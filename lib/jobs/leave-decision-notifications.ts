import { getAuthAppOrigin } from "@/lib/auth-app-url";
import {
  leaveRequestApprovedTemplate,
  leaveRequestRejectedTemplate,
} from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { postSlackLeaveDecision } from "@/lib/slack-incoming";

function formatDateLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type LeaveDecisionJobPayload = {
  decision: "approved" | "rejected";
  employeeEmail: string;
  employeeName: string;
  policyName: string;
  workingDays: number;
  startDateIso: string;
  endDateIso: string;
  approverName: string;
  rejectReason?: string | null;
};

export async function deliverLeaveDecisionNotifications(
  payload: LeaveDecisionJobPayload
): Promise<void> {
  const origin = getAuthAppOrigin();
  const leavePageUrl = `${origin}/leave`;
  const startLabel = formatDateLabel(payload.startDateIso);
  const endLabel = formatDateLabel(payload.endDateIso);

  if (payload.employeeEmail?.trim()) {
    if (payload.decision === "approved") {
      await sendEmail({
        to: payload.employeeEmail.trim(),
        subject: "Your leave request was approved",
        html: leaveRequestApprovedTemplate(
          payload.employeeName,
          payload.policyName,
          startLabel,
          endLabel,
          payload.workingDays,
          payload.approverName,
          leavePageUrl
        ),
      });
    } else {
      await sendEmail({
        to: payload.employeeEmail.trim(),
        subject: "Your leave request was declined",
        html: leaveRequestRejectedTemplate(
          payload.employeeName,
          payload.policyName,
          startLabel,
          endLabel,
          payload.workingDays,
          payload.approverName,
          payload.rejectReason ?? "No reason provided.",
          leavePageUrl
        ),
      });
    }
  }

  const headline =
    payload.decision === "approved"
      ? "Leave request approved"
      : "Leave request declined";

  await postSlackLeaveDecision({
    headline,
    lines: [
      `Employee: ${payload.employeeName} (${payload.employeeEmail || "no email"})`,
      `Policy: ${payload.policyName}`,
      `Dates: ${startLabel} → ${endLabel}`,
      `Working days: ${payload.workingDays}`,
      `Approver: ${payload.approverName}`,
      ...(payload.decision === "rejected"
        ? [`Reason: ${payload.rejectReason?.trim() || "No reason provided."}`]
        : []),
      `Link: ${leavePageUrl}`,
    ],
  });
}
