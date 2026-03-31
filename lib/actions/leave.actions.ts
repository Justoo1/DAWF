"use server";

import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { AccrualType } from "@prisma/client";

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
    // Basic validation could happen here, checking balances, etc.
    const request = await prisma.leaveRequest.create({
      data: {
        userId: data.userId,
        policyId: data.policyId,
        startDate: data.startDate,
        endDate: data.endDate,
        days: data.days,
        reason: data.reason
      }
    });

    revalidatePath("/admin/leave-management");
    revalidatePath("/admin/manage-employees");
    
    return { success: true, request };
  } catch (error) {
    console.error("Error submitting leave request:", error);
    return { success: false, error: "Failed to submit leave request" };
  }
}
