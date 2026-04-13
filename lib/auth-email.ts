import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";
import { EmployeeVerificationEmail } from "@/lib/emails/employee-verification-email";

export type SendVerificationEmailOptions = {
  /** Shown once when an admin set or generated an initial password. */
  initialPassword?: string;
};

export async function sendEmployeeVerificationEmail(
  to: string,
  displayName: string,
  verifyUrl: string,
  options?: SendVerificationEmailOptions
) {
  const html = await render(
    EmployeeVerificationEmail({
      displayName: displayName || to,
      verifyUrl,
      initialPassword: options?.initialPassword,
    })
  );

  return sendEmail({
    to,
    subject: "Verify your email — DEVOPS AFRICA",
    html,
  });
}

export function passwordResetEmailHtml(displayName: string, resetUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>Hi ${escapeHtml(displayName)},</p>
  <p>We received a request to reset your DEVOPS AFRICA password. Use the link below to choose a new password:</p>
  <p><a href="${escapeHtml(resetUrl)}" style="color: #146C43; font-weight: 600;">Reset my password</a></p>
  <p>If you did not request this, you can ignore this email.</p>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPasswordResetEmail(
  to: string,
  displayName: string,
  resetUrl: string
) {
  return sendEmail({
    to,
    subject: "Reset your DEVOPS AFRICA password",
    html: passwordResetEmailHtml(displayName || to, resetUrl),
  });
}
