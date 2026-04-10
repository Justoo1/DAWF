"use server";

import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { AccrualType, NotificationType } from "@prisma/client";
import { createNotification } from "./notification.actions";

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
  accrualType: AccrualType;
  isFlexible: boolean;
}) {
  try {
    const policy = await prisma.leavePolicy.create({
      data: {
        name: data.name,
        defaultDays: data.defaultDays,
        accrualType: data.accrualType,
        isFlexible: data.isFlexible,
        isActive: true,
      }
    });

    revalidatePath("/admin/leave-management/create");
    return { success: true, policy };
  } catch (error: any) {
    console.error("Error creating leave policy:", error);
    if (error?.code === 'P2002') {
      return { success: false, error: `A leave policy with the name "${data.name}" already exists.` };
    }
    return { success: false, error: error?.message || "Failed to create leave policy" };
  }
}

export async function updateLeavePolicy(id: string, data: {
  name: string;
  defaultDays: number;
  accrualType: AccrualType;
  isFlexible: boolean;
}) {
  try {
    const policy = await prisma.leavePolicy.update({
      where: { id },
      data: {
        name: data.name,
        defaultDays: data.defaultDays,
        accrualType: data.accrualType,
        isFlexible: data.isFlexible,
      }
    });

    revalidatePath("/admin/leave-management/create");
    return { success: true, policy };
  } catch (error: any) {
    console.error("Error updating leave policy:", error);
    if (error?.code === 'P2002') {
      return { success: false, error: `A leave policy with the name "${data.name}" already exists.` };
    }
    return { success: false, error: error?.message || "Failed to update leave policy" };
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
    // 1. Create the leave request
    const request = await prisma.leaveRequest.create({
      data: {
        userId: data.userId,
        policyId: data.policyId,
        startDate: data.startDate,
        endDate: data.endDate,
        days: data.days,
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
        type: NotificationType.ROOM_BOOKING_PENDING, // Using PENDING as a placeholder if leave-specific isn't in Enum yet
        title: "New Leave Request",
        message: `${request.user.name} has requested ${data.days} days of ${request.policy.name}.`,
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
          type: NotificationType.ROOM_BOOKING_PENDING,
          title: "New Leave Request (Unmanaged)",
          message: `${request.user.name} submitted a leave request. No manager assigned to their dept.`,
          linkUrl: "/admin/leave-management/requests"
        });
      }
    }

    revalidatePath("/admin/leave-management");
    revalidatePath("/admin/manage-employees");
    revalidatePath("/leave");
    
    return { success: true, request };
  } catch (error) {
    console.error("Error submitting leave request:", error);
    return { success: false, error: "Failed to submit leave request" };
  }
}

export async function fetchLeaveRequests(viewerId: string) {
  try {
    const viewer = await prisma.user.findUnique({
      where: { id: viewerId },
      select: { role: true, department: true }
    });

    if (!viewer) return { success: false, error: "Unauthorized" };

    // Fetch all departments to know who has a manager
    const departments = await prisma.department.findMany({
      select: { name: true, managerId: true }
    });

    let whereClause: any = {};

    if (viewer.role === 'MANAGER') {
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
        include: { user: true }
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
      type: NotificationType.ROOM_BOOKING_APPROVED,
      title: "Leave Request Approved",
      message: `Your leave request for ${request.days} days has been approved by ${approver.name}.`,
      linkUrl: "/leave"
    });

    revalidatePath("/admin/leave-management/requests");
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
        include: { user: true }
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
      type: NotificationType.ROOM_BOOKING_REJECTED,
      title: "Leave Request Declined",
      message: `Your leave request has been reclined. Reason: ${reason || "No reason provided."}`,
      linkUrl: "/leave"
    });

    revalidatePath("/admin/leave-management/requests");
    revalidatePath("/leave");
    return { success: true };
  } catch (error) {
    console.error("Error rejecting leave request:", error);
    return { success: false, error: "Failed to reject leave request" };
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
  } catch (error: any) {
    console.error("Error creating public holiday:", error);
    if (error?.code === 'P2002') {
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
