"use server";

import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";

export async function fetchDepartments() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        manager: {
          select: { name: true, email: true },
        },
        client: {
          select: { id: true, name: true },
        },
      },
    });

    const deptNames = departments.map((d) => d.name);
    const userCounts = await prisma.user.groupBy({
      by: ["department"],
      where: { department: { in: deptNames }, isActive: true },
      _count: { id: true },
    });

    const countMap = new Map(userCounts.map((uc) => [uc.department, uc._count.id]));

    return {
      success: true,
      departments: departments.map((d) => ({
        id: d.id,
        name: d.name,
        clientId: d.clientId,
        clientName: d.client?.name ?? null,
        managerId: d.managerId,
        managerName: d.manager?.name || null,
        employeesCount: countMap.get(d.name) || 0,
        isActive: d.isActive,
      })),
    };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return { success: false, error: "Failed to fetch departments" };
  }
}

export async function fetchDepartmentMembers(
  deptName: string,
  clientId?: string
) {
  try {
    const users = await prisma.user.findMany({
      where: {
        department: deptName,
        isActive: true,
        ...(clientId ? { clientId } : {}),
      },
      select: { id: true, name: true, email: true, clientId: true },
    });
    return { success: true, users };
  } catch (error) {
    console.error("Error fetching department members:", error);
    return { success: false, error: "Failed to fetch members" };
  }
}

export async function createDepartment(data: {
  name: string;
  clientId: string;
  managerId?: string | null;
  employeeIds?: string[];
}) {
  try {
    if (!data.name?.trim()) {
      return { success: false, error: "Department name is required" };
    }
    if (!data.clientId?.trim()) {
      return { success: false, error: "Client is required" };
    }

    const trimmedClientId = data.clientId.trim();
    const trimmedName = data.name.trim();

    const client = await prisma.client.findFirst({
      where: { id: trimmedClientId, isActive: true },
      select: { id: true },
    });
    if (!client) {
      return { success: false, error: "Client not found or inactive" };
    }

    const dept = await prisma.department.create({
      data: {
        name: trimmedName,
        clientId: trimmedClientId,
        managerId: data.managerId || null,
      },
    });

    const idSet = new Set<string>();
    for (const id of data.employeeIds ?? []) {
      if (id?.trim()) idSet.add(id.trim());
    }
    if (data.managerId?.trim()) idSet.add(data.managerId.trim());

    if (idSet.size > 0) {
      const ids = [...idSet];
      const allowed = await prisma.user.findMany({
        where: {
          id: { in: ids },
          clientId: trimmedClientId,
          isActive: true,
        },
        select: { id: true },
      });
      const allowedIds = allowed.map((u) => u.id);
      if (allowedIds.length > 0) {
        await prisma.user.updateMany({
          where: { id: { in: allowedIds } },
          data: { department: trimmedName },
        });
      }
    }

    revalidatePath("/admin/leave-management/departments");
    revalidatePath("/admin/manage-employees");
    
    return { success: true, department: dept };
  } catch (error: unknown) {
    console.error("Error creating department:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: `A department with the name "${data.name}" already exists.` };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create department",
    };
  }
}

export async function updateDepartment(
  id: string,
  data: {
    name: string;
    clientId: string;
    managerId?: string | null;
    employeeIds?: string[];
  }
) {
  try {
    // 1. Get the current department state
    const currentDept = await prisma.department.findUnique({ where: { id } });
    if (!currentDept) return { success: false, error: "Department not found" };

    if (!data.clientId?.trim()) {
      return { success: false, error: "Client is required" };
    }

    const client = await prisma.client.findFirst({
      where: { id: data.clientId.trim(), isActive: true },
      select: { id: true },
    });
    if (!client) {
      return { success: false, error: "Client not found or inactive" };
    }

    const oldName = currentDept.name;
    const newName = data.name.trim();

    // 2. Update the Department record
    const dept = await prisma.department.update({
      where: { id },
      data: {
        name: newName,
        clientId: data.clientId.trim(),
        managerId: data.managerId || null,
      },
    });

    // 3. Handle Department Rename in User records
    if (oldName !== newName) {
      await prisma.user.updateMany({
        where: { department: oldName },
        data: { department: newName }
      });
    }

    // 4. Sync Membership if employeeIds provided
    if (data.employeeIds) {
      // Unset department for anyone NOT in the new list but previously in this department
      await prisma.user.updateMany({
        where: { 
          department: newName,
          id: { notIn: data.employeeIds }
        },
        data: { department: null }
      });

      // Set department for the new list
      await prisma.user.updateMany({
        where: { id: { in: data.employeeIds } },
        data: { department: newName }
      });
    }

    revalidatePath("/admin/leave-management/departments");
    revalidatePath("/admin/manage-employees");
    return { success: true, department: dept };
  } catch (error: unknown) {
    console.error("Error updating department:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: `A department with the name "${data.name}" already exists.` };
    }
    return { success: false, error: "Failed to update department" };
  }
}

export async function toggleDepartmentStatus(id: string, isActive: boolean) {
  try {
    await prisma.department.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/leave-management/departments");
    return { success: true };
  } catch (error) {
    console.error("Error toggling department status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteDepartment(id: string) {
  try {
    // Note: When a department is deleted, we should ideally handle employee unassignment.
    // However, since department in User is just a string 'department', we need to null it out.
    const dept = await prisma.department.findUnique({ where: { id } });
    if (dept) {
      await prisma.user.updateMany({
        where: { department: dept.name },
        data: { department: null }
      });
    }

    await prisma.department.delete({ where: { id } });

    revalidatePath("/admin/leave-management/departments");
    revalidatePath("/admin/manage-employees");
    return { success: true };
  } catch (error) {
    console.error("Error deleting department:", error);
    return { success: false, error: "Failed to delete department" };
  }
}

export async function addEmployeesToDepartment(departmentName: string, employeeIds: string[]) {
  try {
    if (!employeeIds.length) return { success: true };

    await prisma.user.updateMany({
      where: { id: { in: employeeIds } },
      data: { department: departmentName },
    });

    revalidatePath("/admin/manage-employees");
    revalidatePath("/admin/leave-management/departments");
    return { success: true };
  } catch (error) {
    console.error("Error linking employees to department:", error);
    return { success: false, error: "Failed to link employees" };
  }
}
