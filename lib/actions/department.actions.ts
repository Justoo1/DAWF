"use server";

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

export async function fetchDepartmentMembers(deptName: string) {
  try {
    const users = await prisma.user.findMany({
      where: { department: deptName, isActive: true },
      select: { id: true, name: true, email: true }
    });
    return { success: true, users };
  } catch (error) {
    console.error("Error fetching department members:", error);
    return { success: false, error: "Failed to fetch members" };
  }
}

export async function createDepartment(data: { name: string; managerId?: string | null; employeeIds?: string[] }) {
  try {
    if (!data.name?.trim()) {
      return { success: false, error: "Department name is required" };
    }

    const dept = await prisma.department.create({
      data: {
        name: data.name,
        managerId: data.managerId || null,
      },
    });

    if (data.employeeIds && data.employeeIds.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: data.employeeIds } },
        data: { department: data.name.trim() }
      });
    }

    revalidatePath("/admin/leave-management/departments");
    revalidatePath("/admin/manage-employees");
    
    return { success: true, department: dept };
  } catch (error: any) {
    console.error("Error creating department:", error);
    if (error?.code === 'P2002') {
      return { success: false, error: `A department with the name "${data.name}" already exists.` };
    }
    return { success: false, error: error?.message || "Failed to create department" };
  }
}

export async function updateDepartment(id: string, data: { name: string; managerId?: string | null; employeeIds?: string[] }) {
  try {
    // 1. Get the current department state
    const currentDept = await prisma.department.findUnique({ where: { id } });
    if (!currentDept) return { success: false, error: "Department not found" };

    const oldName = currentDept.name;
    const newName = data.name.trim();

    // 2. Update the Department record
    const dept = await prisma.department.update({
      where: { id },
      data: {
        name: newName,
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
  } catch (error: any) {
    console.error("Error updating department:", error);
    if (error?.code === 'P2002') {
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
