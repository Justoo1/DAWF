"use server";

import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { NotificationType, Prisma } from "@prisma/client";
import { createNotification } from "./notification.actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { countLeaveWorkingDays } from "@/lib/leave-working-days";
import { runAfterResponse } from "@/lib/background-work";
import { deliverLeaveDecisionNotifications } from "@/lib/jobs/leave-decision-notifications";

async function workingDaysForLeaveRange(startDate: Date, endDate: Date) {
  const holidays = await prisma.publicHoliday.findMany({
    select: { date: true, isRecurring: true },
  });
  return countLeaveWorkingDays(startDate, endDate, holidays);
}

function startOfLocalDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function containsWeekendInRange(startDate: Date, endDate: Date): boolean {
  const cursor = startOfLocalDay(startDate);
  const end = startOfLocalDay(endDate);
  while (cursor <= end) {
    const day = cursor.getDay();
    if (day === 0 || day === 6) return true;
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
}

function validateLeaveDateRange(startDate: Date, endDate: Date) {
  const start = startOfLocalDay(startDate);
  const end = startOfLocalDay(endDate);
  const today = startOfLocalDay(new Date());

  if (start < today) {
    return {
      ok: false as const,
      error: "Start date cannot be in the past.",
    };
  }

  if (end < start) {
    return {
      ok: false as const,
      error: "End date cannot be earlier than start date.",
    };
  }

  if (containsWeekendInRange(start, end)) {
    return {
      ok: false as const,
      error: "Leave request range cannot include weekends. Please select weekdays only.",
    };
  }

  return { ok: true as const };
}

export async function fetchLeavePolicies() {
  try {
    const policies = await prisma.leavePolicy.findMany({
      orderBy: { name: "asc" }
    });
    return { success: true, policies };
  } catch (error) {
    console.error("Error fetching leave policies:", error);
    return { success: false, error: "Failed to fetch leave policies" };
  }
}

export async function createLeavePolicy(data: {
  name: string;
  defaultDays: number;
  isUnlimited: boolean;
  isFlexible: boolean;
}) {
  try {
    if (!data.isUnlimited && data.defaultDays <= 0) {
      return { success: false, error: "Default days must be greater than 0 unless policy is unlimited." };
    }

    const policy = await prisma.leavePolicy.create({
      data: {
        name: data.name,
        defaultDays: data.isUnlimited ? 0 : data.defaultDays,
        isUnlimited: data.isUnlimited,
        isFlexible: data.isFlexible,
        isActive: true,
      }
    });

    revalidatePath("/admin/leave-management/create");
    return { success: true, policy };
  } catch (error: unknown) {
    console.error("Error creating leave policy:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: `A leave policy with the name "${data.name}" already exists.` };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create leave policy",
    };
  }
}

export async function updateLeavePolicy(id: string, data: {
  name: string;
  defaultDays: number;
  isUnlimited: boolean;
  isFlexible: boolean;
}) {
  try {
    if (!data.isUnlimited && data.defaultDays <= 0) {
      return { success: false, error: "Default days must be greater than 0 unless policy is unlimited." };
    }

    const policy = await prisma.leavePolicy.update({
      where: { id },
      data: {
        name: data.name,
        defaultDays: data.isUnlimited ? 0 : data.defaultDays,
        isUnlimited: data.isUnlimited,
        isFlexible: data.isFlexible,
      }
    });

    revalidatePath("/admin/leave-management/create");
    return { success: true, policy };
  } catch (error: unknown) {
    console.error("Error updating leave policy:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: `A leave policy with the name "${data.name}" already exists.` };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update leave policy",
    };
  }
}

export async function toggleLeavePolicyStatus(id: string, isActive: boolean) {
  try {
    await prisma.leavePolicy.update({
      where: { id },
      data: { isActive }
    });

    revalidatePath("/admin/leave-management/create");
    return { success: true };
  } catch (error) {
    console.error("Error toggling leave policy status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteLeavePolicy(id: string) {
  try {
    // Check for existing leave requests using this policy
    const requestCount = await prisma.leaveRequest.count({ where: { policyId: id } });
    if (requestCount > 0) {
      return { success: false, error: "Cannot delete policy as it is linked to existing leave requests. Try deactivating it instead." };
    }

    await prisma.leavePolicy.delete({ where: { id } });

    revalidatePath("/admin/leave-management/create");
    return { success: true };
  } catch (error) {
    console.error("Error deleting leave policy:", error);
    return { success: false, error: "Failed to delete leave policy" };
  }
}

export async function fetchUserLeaveBalances(userId: string, year: number) {
  try {
    const balances = await prisma.leaveBalance.findMany({
      where: { userId, year },
      include: {
        policy: true
      }
    });
    return { success: true, balances };
  } catch (error) {
    console.error("Error fetching leave balances:", error);
    return { success: false, error: "Failed to fetch leave balances" };
  }
}

export async function submitLeaveRequest(data: {
  userId: string;
  policyId: string;
  startDate: Date;
  endDate: Date;
  days: number;
  reason?: string;
}) {
  try {
    const dateValidation = validateLeaveDateRange(data.startDate, data.endDate);
    if (!dateValidation.ok) {
      return { success: false, error: dateValidation.error };
    }

    const days = await workingDaysForLeaveRange(data.startDate, data.endDate);
    if (days <= 0) {
      return {
        success: false,
        error: "The selected range has no working days (check weekends and public holidays).",
      };
    }

    // 1. Create the leave request
    const request = await prisma.leaveRequest.create({
      data: {
        userId: data.userId,
        policyId: data.policyId,
        startDate: data.startDate,
        endDate: data.endDate,
        days,
        reason: data.reason
      },
      include: {
        user: true,
        policy: true
      }
    });

    // 2. Identify the approver (Department Manager or Admins)
    const userDept = await prisma.department.findUnique({
      where: { name: request.user.department || "" }
    });

    if (userDept?.managerId) {
      // Notify the specific manager
      await createNotification({
        userId: userDept.managerId,
        type: NotificationType.LEAVE_REQUEST_PENDING,
        title: "New Leave Request",
        message: `${request.user.name} has requested ${days} days of ${request.policy.name}.`,
        linkUrl: "/admin/leave-management/requests"
      });
    } else {
      // Fallback: Notify all admins
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', isActive: true },
        select: { id: true }
      });
      
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          type: NotificationType.LEAVE_REQUEST_PENDING,
          title: "New Leave Request (Unmanaged)",
          message: `${request.user.name} submitted a leave request. No manager assigned to their dept.`,
          linkUrl: "/admin/leave-management/requests"
        });
      }
    }

    revalidatePath("/admin/leave-management");
    revalidatePath("/admin/leave-management/leaves");
    revalidatePath("/leave");
    
    return { success: true, request };
  } catch (error) {
    console.error("Error submitting leave request:", error);
    return { success: false, error: "Failed to submit leave request" };
  }
}

/** Only the owner may update, and only while the request is still pending approval. */
export async function updatePendingLeaveRequest(
  requestId: string,
  data: {
    policyId: string;
    startDate: Date;
    endDate: Date;
    days: number;
    reason?: string;
  }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const existing = await prisma.leaveRequest.findFirst({
      where: {
        id: requestId,
        userId: session.user.id,
        status: "PENDING",
      },
    });

    if (!existing) {
      return {
        success: false,
        error:
          "This request cannot be edited. Only pending requests can be changed before a decision is made.",
      };
    }

    const dateValidation = validateLeaveDateRange(data.startDate, data.endDate);
    if (!dateValidation.ok) {
      return { success: false, error: dateValidation.error };
    }

    const days = await workingDaysForLeaveRange(data.startDate, data.endDate);
    if (days <= 0) {
      return {
        success: false,
        error:
          "The selected range has no working days (check weekends and public holidays).",
      };
    }

    await prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        policyId: data.policyId,
        startDate: data.startDate,
        endDate: data.endDate,
        days,
        reason: data.reason ?? null,
      },
    });

    revalidatePath("/admin/leave-management");
    revalidatePath("/admin/leave-management/leaves");
    revalidatePath("/leave");
    return { success: true };
  } catch (error) {
    console.error("Error updating leave request:", error);
    return { success: false, error: "Failed to update leave request" };
  }
}

/** Only the owner may delete, and only while the request is still pending approval. */
export async function deletePendingLeaveRequest(requestId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const existing = await prisma.leaveRequest.findFirst({
      where: {
        id: requestId,
        userId: session.user.id,
        status: "PENDING",
      },
    });

    if (!existing) {
      return {
        success: false,
        error:
          "This request cannot be removed. Only pending requests can be withdrawn before a decision is made.",
      };
    }

    await prisma.leaveRequest.delete({ where: { id: requestId } });

    revalidatePath("/admin/leave-management");
    revalidatePath("/admin/leave-management/leaves");
    revalidatePath("/leave");
    return { success: true };
  } catch (error) {
    console.error("Error deleting leave request:", error);
    return { success: false, error: "Failed to delete leave request" };
  }
}

export async function fetchLeaveRequests(
  viewerId: string,
  options?: { scope?: "self" | "review" }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id || session.user.id !== viewerId) {
      return { success: false, error: "Unauthorized" };
    }

    const scope = options?.scope ?? "review";

    const viewer = await prisma.user.findUnique({
      where: { id: viewerId },
      select: { role: true, department: true }
    });

    if (!viewer) return { success: false, error: "Unauthorized" };

    // Fetch all departments to know who has a manager
    const departments = await prisma.department.findMany({
      select: { name: true, managerId: true }
    });

    let whereClause: Record<string, unknown> = {};

    if (scope === "self") {
      whereClause = { userId: viewerId };
    } else if (viewer.role === 'MANAGER') {
      const managedDepts = departments
        .filter(d => d.managerId === viewerId)
        .map(d => d.name);
      
      whereClause = {
        user: {
          department: { in: managedDepts }
        }
      };
    } else if (viewer.role !== 'ADMIN') {
        whereClause = { userId: viewerId };
    }

    const requests = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true, department: true }
        },
        policy: true,
        manager: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Post-process to add routing metadata
    const requestsWithMetadata = requests.map(req => {
      const dept = departments.find(d => d.name === req.user.department);
      return {
        ...req,
        isUnmanaged: !dept || !dept.managerId, // True if the department has no assigned manager
        managerName: dept?.managerId ? (req.manager?.name || "Pending") : "System Admin (Fallback)"
      };
    });

    return { success: true, requests: requestsWithMetadata };
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return { success: false, error: "Failed to fetch leave requests" };
  }
}

export async function approveLeaveRequest(requestId: string, approverId: string) {
  try {
    const [request, approver] = await Promise.all([
      prisma.leaveRequest.findUnique({ 
        where: { id: requestId },
        include: { user: true, policy: true }
      }),
      prisma.user.findUnique({ where: { id: approverId } })
    ]);

    if (!request || !approver) return { success: false, error: "Not found" };

    // Check permissions
    const department = await prisma.department.findUnique({
        where: { name: request.user.department || "" }
    });

    const isSystemAdmin = approver.role === 'ADMIN';
    const isDeptManager = department?.managerId === approverId;

    if (!isSystemAdmin && !isDeptManager) {
      return { success: false, error: "Unauthorized: only department managers or admins can approve" };
    }

    await prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        approvedById: approverId
      }
    });

    // Notify the user
    await createNotification({
      userId: request.userId,
      type: NotificationType.LEAVE_REQUEST_APPROVED,
      title: "Leave Request Approved",
      message: `Your leave request for ${request.days} days has been approved by ${approver.name}.`,
      linkUrl: "/leave"
    });

    runAfterResponse(() =>
      deliverLeaveDecisionNotifications({
        decision: "approved",
        employeeEmail: request.user.email,
        employeeName: request.user.name,
        policyName: request.policy.name,
        workingDays: request.days,
        startDateIso: request.startDate.toISOString(),
        endDateIso: request.endDate.toISOString(),
        approverName: approver.name,
      })
    );

    revalidatePath("/admin/leave-management/requests");
    revalidatePath("/admin/leave-management/leaves");
    revalidatePath("/leave");
    return { success: true };
  } catch (error) {
    console.error("Error approving leave request:", error);
    return { success: false, error: "Failed to approve leave request" };
  }
}

export async function rejectLeaveRequest(requestId: string, approverId: string, reason?: string) {
  try {
    const [request, approver] = await Promise.all([
      prisma.leaveRequest.findUnique({ 
        where: { id: requestId },
        include: { user: true, policy: true }
      }),
      prisma.user.findUnique({ where: { id: approverId } })
    ]);

    if (!request || !approver) return { success: false, error: "Not found" };

    const department = await prisma.department.findUnique({
        where: { name: request.user.department || "" }
    });

    const isSystemAdmin = approver.role === 'ADMIN';
    const isDeptManager = department?.managerId === approverId;

    if (!isSystemAdmin && !isDeptManager) {
      return { success: false, error: "Unauthorized" };
    }

    const declineReasonText = reason?.trim() || "No reason provided.";

    await prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        approvedById: approverId,
        reason: reason || request.reason
      }
    });

    // Notify the user
    await createNotification({
      userId: request.userId,
      type: NotificationType.LEAVE_REQUEST_REJECTED,
      title: "Leave Request Declined",
      message: `Your leave request has been declined. Reason: ${declineReasonText}`,
      linkUrl: "/leave"
    });

    runAfterResponse(() =>
      deliverLeaveDecisionNotifications({
        decision: "rejected",
        employeeEmail: request.user.email,
        employeeName: request.user.name,
        policyName: request.policy.name,
        workingDays: request.days,
        startDateIso: request.startDate.toISOString(),
        endDateIso: request.endDate.toISOString(),
        approverName: approver.name,
        rejectReason: declineReasonText,
      })
    );

    revalidatePath("/admin/leave-management/requests");
    revalidatePath("/admin/leave-management/leaves");
    revalidatePath("/leave");
    return { success: true };
  } catch (error) {
    console.error("Error declining leave request:", error);
    return { success: false, error: "Failed to decline leave request" };
  }
}

export async function reinstateLeaveRequest(requestId: string, approverId: string, reason: string) {
  try {
    const note = reason.trim()
    if (!note) {
      return { success: false, error: "A reason is required to reinstate this leave request." }
    }

    const [request, approver] = await Promise.all([
      prisma.leaveRequest.findUnique({
        where: { id: requestId },
        include: { user: true }
      }),
      prisma.user.findUnique({ where: { id: approverId } })
    ])

    if (!request || !approver) return { success: false, error: "Not found" }
    if (request.status !== 'REJECTED') {
      return { success: false, error: "Only declined requests can be reinstated." }
    }

    const department = await prisma.department.findUnique({
      where: { name: request.user.department || "" }
    })

    const isSystemAdmin = approver.role === 'ADMIN'
    const isDeptManager = department?.managerId === approverId
    if (!isSystemAdmin && !isDeptManager) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: 'PENDING',
        approvedById: null,
        reinstatementReason: note,
      }
    })

    await createNotification({
      userId: request.userId,
      type: NotificationType.LEAVE_REQUEST_PENDING,
      title: "Leave Request Reinstated",
      message: `Your leave request has been reinstated and moved back to pending review. Reason: ${note}`,
      linkUrl: "/leave"
    })

    revalidatePath("/admin/leave-management/requests")
    revalidatePath("/admin/leave-management/leaves")
    revalidatePath("/leave")
    return { success: true }
  } catch (error) {
    console.error("Error reinstating leave request:", error)
    return { success: false, error: "Failed to reinstate leave request" }
  }
}

// ============================================
// PUBLIC HOLIDAY MANAGEMENT
// ============================================

export async function fetchPublicHolidays() {
  try {
    const holidays = await prisma.publicHoliday.findMany({
      orderBy: { date: 'asc' }
    });
    return { success: true, holidays };
  } catch (error) {
    console.error("Error fetching public holidays:", error);
    return { success: false, error: "Failed to fetch holidays" };
  }
}

export async function createPublicHoliday(data: {
  name: string;
  date: Date;
  isRecurring: boolean;
}) {
  try {
    const holiday = await prisma.publicHoliday.create({
      data: {
        name: data.name,
        date: data.date,
        isRecurring: data.isRecurring
      }
    });

    revalidatePath("/admin/leave-management/calendar");
    return { success: true, holiday };
  } catch (error: unknown) {
    console.error("Error creating public holiday:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: `A holiday named "${data.name}" already exists.` };
    }
    return { success: false, error: "Failed to create public holiday" };
  }
}

export async function deletePublicHoliday(id: string) {
  try {
    await prisma.publicHoliday.delete({ where: { id } });
    revalidatePath("/admin/leave-management/calendar");
    return { success: true };
  } catch (error) {
    console.error("Error deleting public holiday:", error);
    return { success: false, error: "Failed to delete public holiday" };
  }
}

export async function fetchUserApprovedLeavesInRange(userId: string, startDate: Date, endDate: Date) {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        userId,
        status: "APPROVED",
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
      select: {
        startDate: true,
        endDate: true,
      }
    });
    return { success: true, leaves };
  } catch (error) {
    console.error("Error fetching user leaves in range:", error);
    return { success: false, error: "Failed to fetch user leaves" };
  }
}
