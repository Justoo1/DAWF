"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { createNotification } from "./notification.actions";
import { sendEmail } from "../email";
import { foodSelectionConfirmedTemplate } from "../email-templates";
import { requireAuth, requireAuthenticatedUser, requireFoodCommitteeOrAdmin } from '@/lib/security';
import { isValidUUID, sanitizeText } from '@/lib/utils/validators';

// ============================================
// FOOD SELECTION MANAGEMENT
// ============================================

export async function fetchUserFoodSelections(userId: string, menuId: string) {
  try {
    await requireAuth();
    
    const user = await requireAuthenticatedUser();
    
    if (user.id !== userId) {
      return { error: 'Unauthorized: You can only access your own selections' };
    }
    
    if (!isValidUUID(menuId)) {
      return { error: 'Invalid menu ID' };
    }
    
    const selections = await prisma.foodSelection.findMany({
      where: {
        userId,
        menuId
      },
      include: {
        menuItem: true
      },
      orderBy: { dayOfWeek: 'asc' }
    });

    return {
      success: true,
      selections
    };
  } catch (error) {
    console.error('Food selection fetch error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch food selections' };
  }
}

export async function fetchAllSelectionsForMenu(menuId: string) {
  try {
    await requireFoodCommitteeOrAdmin();
    
    if (!isValidUUID(menuId)) {
      return { error: 'Invalid menu ID' };
    }
    
    const selections = await prisma.foodSelection.findMany({
      where: { menuId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        },
        menuItem: true
      },
      orderBy: [{ dayOfWeek: 'asc' }, { user: { name: 'asc' } }]
    });

    return {
      success: true,
      selections
    };
  } catch (error) {
    console.error('Food selections fetch error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch food selections' };
  }
}

interface SelectionData {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
  menuItemId?: string | null;
  notes?: string;
}

export async function createOrUpdateFoodSelection(
  userId: string,
  menuId: string,
  selectionData: SelectionData
) {
  try {
    await requireAuth();
    
    const user = await requireAuthenticatedUser();
    
    if (user.id !== userId) {
      return { error: 'Unauthorized: You can only modify your own selections' };
    }
    
    if (!isValidUUID(menuId)) {
      return { error: 'Invalid menu ID' };
    }
    
    if (selectionData.menuItemId && !isValidUUID(selectionData.menuItemId)) {
      return { error: 'Invalid menu item ID' };
    }
    
    const sanitizedData = {
      ...selectionData,
      notes: selectionData.notes ? sanitizeText(selectionData.notes) : null
    };
    
    // Check if menu is still open for selection
    const menu = await prisma.weeklyFoodMenu.findUnique({
      where: { id: menuId },
      select: {
        status: true,
        selectionCloseDate: true,
        weekStartDate: true,
        vendor: { select: { name: true } }
      }
    });

    if (!menu) {
      return { error: 'Menu not found' };
    }

    if (menu.status !== 'PUBLISHED') {
      return { error: 'This menu is not available for selection' };
    }

    if (new Date() > menu.selectionCloseDate) {
      return { error: 'Selection period has ended' };
    }

    // --- LEAVE VALIDATION START ---
    // Calculate the absolute date for this day of week
    const daysToAdd = {
      'MONDAY': 0, 'TUESDAY': 1, 'WEDNESDAY': 2, 'THURSDAY': 3, 'FRIDAY': 4
    }[sanitizedData.dayOfWeek];

    const targetDate = new Date(menu.weekStartDate);
    targetDate.setDate(targetDate.getDate() + daysToAdd);

    // Check for approved leave on this date
    const approvedLeave = await prisma.leaveRequest.findFirst({
      where: {
        userId,
        status: 'APPROVED',
        startDate: { lte: targetDate },
        endDate: { gte: targetDate }
      }
    });

    if (approvedLeave && sanitizedData.menuItemId) {
      return { 
        error: `Selection blocked: You have an approved leave on ${targetDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}.` 
      };
    }
    // --- LEAVE VALIDATION END ---

    // Upsert the selection
    const selection = await prisma.foodSelection.upsert({
      where: {
        menuId_userId_dayOfWeek: {
          menuId,
          userId,
          dayOfWeek: sanitizedData.dayOfWeek
        }
      },
      update: {
        menuItemId: sanitizedData.menuItemId || null,
        notes: sanitizedData.notes
      },
      create: {
        menuId,
        userId,
        dayOfWeek: sanitizedData.dayOfWeek,
        menuItemId: sanitizedData.menuItemId || null,
        notes: sanitizedData.notes
      },
      include: {
        menuItem: true
      }
    });

    revalidatePath('/food-orders');
    return { success: true, selection };
  } catch (error) {
    console.error('Food selection create/update error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to save food selection' };
  }
}

interface BulkSelectionData {
  selections: Array<{
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
    menuItemId?: string | null;
    notes?: string;
  }>;
}

export async function createBulkFoodSelections(
  userId: string,
  menuId: string,
  data: BulkSelectionData
) {
  try {
    await requireAuth();
    
    const user = await requireAuthenticatedUser();
    
    if (user.id !== userId) {
      return { error: 'Unauthorized: You can only modify your own selections' };
    }
    
    if (!isValidUUID(menuId)) {
      return { error: 'Invalid menu ID' };
    }
    
    for (const selection of data.selections) {
      if (selection.menuItemId && !isValidUUID(selection.menuItemId)) {
        return { error: 'Invalid menu item ID' };
      }
    }
    
    const sanitizedData = {
      ...data,
      selections: data.selections.map(selection => ({
        ...selection,
        notes: selection.notes ? sanitizeText(selection.notes) : null
      }))
    };
    
    // Check if menu is still open for selection
    const menu = await prisma.weeklyFoodMenu.findUnique({
      where: { id: menuId },
      include: { vendor: true }
    });

    if (!menu) {
      return { error: 'Menu not found' };
    }

    if (menu.status !== 'PUBLISHED') {
      return { error: 'This menu is not available for selection' };
    }

    if (new Date() > menu.selectionCloseDate) {
      return { error: 'Selection period has ended' };
    }

    // --- BULK LEAVE VALIDATION START ---
    const dayOffsets: Record<string, number> = {
      'MONDAY': 0, 'TUESDAY': 1, 'WEDNESDAY': 2, 'THURSDAY': 3, 'FRIDAY': 4
    };

    for (const selection of sanitizedData.selections) {
        if (!selection.menuItemId) continue;

        const targetDate = new Date(menu.weekStartDate);
        targetDate.setDate(targetDate.getDate() + dayOffsets[selection.dayOfWeek]);

        const approvedLeave = await prisma.leaveRequest.findFirst({
            where: {
                userId,
                status: 'APPROVED',
                startDate: { lte: targetDate },
                endDate: { gte: targetDate }
            }
        });

        if (approvedLeave) {
            return { 
                error: `Cannot save selections: You have an approved leave on ${selection.dayOfWeek.toLowerCase()}, ${targetDate.toLocaleDateString('en-GB')}.` 
            };
        }
    }
    // --- BULK LEAVE VALIDATION END ---

    // Use transaction to create/update all selections
    const selections = await prisma.$transaction(
      sanitizedData.selections.map((selection) =>
        prisma.foodSelection.upsert({
          where: {
            menuId_userId_dayOfWeek: {
              menuId,
              userId,
              dayOfWeek: selection.dayOfWeek
            }
          },
          update: {
            menuItemId: selection.menuItemId || null,
            notes: selection.notes
          },
          create: {
            menuId,
            userId,
            dayOfWeek: selection.dayOfWeek,
            menuItemId: selection.menuItemId || null,
            notes: selection.notes
          }
        })
      )
    );

    // Send confirmation notification
    await createNotification({
      userId,
      type: 'FOOD_SELECTION_CONFIRMED',
      title: 'Food Selections Confirmed',
      message: `Your food selections for ${menu.vendor.name} have been saved successfully.`,
      linkUrl: '/food-orders'
    });

    // Calculate actual meals ordered (excluding "No Selection")
    const actualMealCount = selections.filter(s => s.menuItemId !== null).length;

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Food Selections Confirmed',
      html: foodSelectionConfirmedTemplate({
        userName: user.name,
        vendorName: menu.vendor.name,
        weekStartDate: menu.weekStartDate,
        weekEndDate: menu.weekEndDate,
        actualMealCount
      })
    });

    revalidatePath('/food-orders');
    return { success: true, selections };
  } catch (error) {
    console.error('Bulk food selection error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to save food selections' };
  }
}

export async function deleteFoodSelection(userId: string, menuId: string, dayOfWeek: string) {
  try {
    await requireAuth();
    
    const user = await requireAuthenticatedUser();
    
    if (user.id !== userId) {
      return { error: 'Unauthorized: You can only delete your own selections' };
    }
    
    if (!isValidUUID(menuId)) {
      return { error: 'Invalid menu ID' };
    }
    
    // Check if menu is still open for selection
    const menu = await prisma.weeklyFoodMenu.findUnique({
      where: { id: menuId },
      select: { status: true, selectionCloseDate: true }
    });

    if (!menu) {
      return { error: 'Menu not found' };
    }

    if (menu.status !== 'PUBLISHED') {
      return { error: 'Cannot modify selections for this menu' };
    }

    if (new Date() > menu.selectionCloseDate) {
      return { error: 'Selection period has ended' };
    }

    await prisma.foodSelection.delete({
      where: {
        menuId_userId_dayOfWeek: {
          menuId,
          userId,
          dayOfWeek: dayOfWeek as 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY'
        }
      }
    });

    revalidatePath('/food-orders');
    return { success: true };
  } catch (error) {
    console.error('Food selection deletion error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete food selection' };
  }
}

// ============================================
// ADMIN/COMMITTEE FUNCTIONS
// ============================================

export async function getMenuOrderSummary(menuId: string) {
  try {
    await requireFoodCommitteeOrAdmin();
    
    if (!isValidUUID(menuId)) {
      return { error: 'Invalid menu ID' };
    }
    
    const menu = await prisma.weeklyFoodMenu.findUnique({
      where: { id: menuId },
      include: {
        vendor: true,
        menuItems: {
          orderBy: [{ dayOfWeek: 'asc' }, { displayOrder: 'asc' }]
        }
      }
    });

    if (!menu) {
      return { error: 'Menu not found' };
    }

    const selections = await prisma.foodSelection.findMany({
      where: { menuId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        },
        menuItem: true
      },
      orderBy: [{ dayOfWeek: 'asc' }, { user: { name: 'asc' } }]
    });

    // Group selections by day
    const selectionsByDay = selections.reduce((acc, selection) => {
      if (!acc[selection.dayOfWeek]) {
        acc[selection.dayOfWeek] = [];
      }
      acc[selection.dayOfWeek].push(selection);
      return acc;
    }, {} as Record<string, typeof selections>);

    // Group selections by day and department
    const selectionsByDayAndDept = selections.reduce((acc, selection) => {
      const day = selection.dayOfWeek;
      const dept = selection.user.department || 'Unassigned';

      if (!acc[day]) {
        acc[day] = {};
      }
      if (!acc[day][dept]) {
        acc[day][dept] = [];
      }
      acc[day][dept].push(selection);
      return acc;
    }, {} as Record<string, Record<string, typeof selections>>);

    // Calculate counts per item per day
    const itemCounts = selections.reduce((acc, selection) => {
      const key = `${selection.dayOfWeek}-${selection.menuItemId || 'NO_SELECTION'}`;
      if (!acc[key]) {
        acc[key] = {
          dayOfWeek: selection.dayOfWeek,
          itemName: selection.menuItem?.itemName || 'No Selection',
          count: 0,
          users: []
        };
      }
      acc[key].count++;
      acc[key].users.push(selection.user.name);
      return acc;
    }, {} as Record<string, { dayOfWeek: string; itemName: string; count: number; users: string[] }>);

    // Calculate unique employees who made selections
    const uniqueUserIds = new Set(selections.map(s => s.userId));
    const employeesWithSelections = uniqueUserIds.size;

    // Calculate total actual meal orders (excluding "No Selection")
    const actualMealOrders = selections.filter(s => s.menuItemId !== null).length;

    return {
      success: true,
      menu,
      selections,
      selectionsByDay,
      selectionsByDayAndDept,
      itemCounts: Object.values(itemCounts),
      totalSelections: selections.length, // Total selection records (all days)
      employeesWithSelections, // Unique employees who made at least one selection
      actualMealOrders // Total meals ordered (excluding "No Selection")
    };
  } catch (error) {
    console.error('Menu order summary error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch menu order summary' };
  }
}

export async function getSelectionStatistics(menuId: string) {
  try {
    await requireFoodCommitteeOrAdmin();
    
    if (!isValidUUID(menuId)) {
      return { error: 'Invalid menu ID' };
    }
    
    const menu = await prisma.weeklyFoodMenu.findUnique({
      where: { id: menuId },
      include: {
        vendor: true,
        _count: {
          select: { selections: true }
        }
      }
    });

    if (!menu) {
      return { error: 'Menu not found' };
    }

    const totalUsers = await prisma.user.count({
      where: { isActive: true }
    });

    const usersWithSelections = await prisma.foodSelection.findMany({
      where: { menuId },
      select: { userId: true },
      distinct: ['userId']
    });

    const participationRate = totalUsers > 0
      ? (usersWithSelections.length / totalUsers) * 100
      : 0;

    return {
      success: true,
      statistics: {
        totalUsers,
        usersWithSelections: usersWithSelections.length,
        participationRate: Math.round(participationRate),
        totalSelections: menu._count.selections
      }
    };
  } catch (error) {
    console.error('Selection statistics error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch selection statistics' };
  }
}

// ============================================
// ADMIN FOOD SELECTION MANAGEMENT
// ============================================

export async function adminCreateBulkFoodSelections(
  targetUserId: string,
  menuId: string,
  data: BulkSelectionData
) {
  try {
    await requireFoodCommitteeOrAdmin();
    
    if (!isValidUUID(targetUserId)) {
      return { error: 'Invalid target user ID' };
    }
    
    if (!isValidUUID(menuId)) {
      return { error: 'Invalid menu ID' };
    }
    
    for (const selection of data.selections) {
      if (selection.menuItemId && !isValidUUID(selection.menuItemId)) {
        return { error: 'Invalid menu item ID' };
      }
    }
    
    const sanitizedData = {
      ...data,
      selections: data.selections.map(selection => ({
        ...selection,
        notes: selection.notes ? sanitizeText(selection.notes) : null
      }))
    };
    
    // Check if menu exists
    const menu = await prisma.weeklyFoodMenu.findUnique({
      where: { id: menuId },
      include: { vendor: true }
    });

    if (!menu) {
      return { error: 'Menu not found' };
    }

    // Get target user details
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { name: true, email: true, isActive: true }
    });

    if (!targetUser) {
      return { error: 'Employee not found' };
    }

    if (!targetUser.isActive) {
      return { error: 'Cannot add selections for inactive employee' };
    }

    // Use transaction to create/update all selections
    const selections = await prisma.$transaction(
      sanitizedData.selections.map((selection) =>
        prisma.foodSelection.upsert({
          where: {
            menuId_userId_dayOfWeek: {
              menuId,
              userId: targetUserId,
              dayOfWeek: selection.dayOfWeek
            }
          },
          update: {
            menuItemId: selection.menuItemId || null,
            notes: selection.notes
          },
          create: {
            menuId,
            userId: targetUserId,
            dayOfWeek: selection.dayOfWeek,
            menuItemId: selection.menuItemId || null,
            notes: selection.notes
          }
        })
      )
    );

    // Send confirmation notification to the employee
    await createNotification({
      userId: targetUserId,
      type: 'FOOD_SELECTION_CONFIRMED',
      title: 'Food Selections Added',
      message: `Food selections for ${menu.vendor.name} have been added for you by the committee.`,
      linkUrl: '/food-orders'
    });

    // Calculate actual meals ordered (excluding "No Selection")
    const actualMealCount = selections.filter(s => s.menuItemId !== null).length;

    // Send confirmation email to the employee
    await sendEmail({
      to: targetUser.email,
      subject: 'Food Selections Confirmed',
      html: foodSelectionConfirmedTemplate({
        userName: targetUser.name,
        vendorName: menu.vendor.name,
        weekStartDate: menu.weekStartDate,
        weekEndDate: menu.weekEndDate,
        actualMealCount
      })
    });

    revalidatePath('/admin/food-management/orders');
    revalidatePath('/food-orders');
    return { success: true, selections };
  } catch (error) {
    console.error('Admin bulk food selection error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to save food selections' };
  }
}

export async function getEmployeesWithoutSelections(menuId: string) {
  try {
    await requireFoodCommitteeOrAdmin();
    
    if (!isValidUUID(menuId)) {
      return { error: 'Invalid menu ID' };
    }
    
    // Get all active users
    const allUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        department: true
      },
      orderBy: { name: 'asc' }
    });

    // Get users who have made selections for this menu
    const usersWithSelections = await prisma.foodSelection.findMany({
      where: { menuId },
      select: { userId: true },
      distinct: ['userId']
    });

    const userIdsWithSelections = new Set(usersWithSelections.map(s => s.userId));

    // Filter out users who already have selections
    const usersWithoutSelections = allUsers.filter(
      user => !userIdsWithSelections.has(user.id)
    );

    return {
      success: true,
      users: usersWithoutSelections,
      allUsers // Include all users so admin can also edit existing selections
    };
  } catch (error) {
    console.error('Employees without selections fetch error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch employees' };
  }
}

// ============================================
// USER ORDER HISTORY
// ============================================

interface OrderHistoryFilters {
  startDate?: Date;
  endDate?: Date;
  userId: string;
}

export async function fetchUserOrderHistory(filters: OrderHistoryFilters) {
  try {
    await requireAuth();
    
    const user = await requireAuthenticatedUser();
    
    if (user.id !== filters.userId) {
      return { error: 'Unauthorized: You can only access your own order history' };
    }
    
    const { userId, startDate, endDate } = filters;

    interface MenuWhereClause {
      isActive: boolean;
      weekStartDate?: {
        gte?: Date;
        lte?: Date;
      };
    }

    const menuWhere: MenuWhereClause = {
      isActive: true
    };

    // Add date filters if provided
    if (startDate || endDate) {
      menuWhere.weekStartDate = {};
      if (startDate) {
        menuWhere.weekStartDate.gte = startDate;
      }
      if (endDate) {
        menuWhere.weekStartDate.lte = endDate;
      }
    }

    const selections = await prisma.foodSelection.findMany({
      where: {
        userId,
        menu: menuWhere
      },
      include: {
        menuItem: {
          include: {
            food: true
          }
        },
        menu: {
          include: {
            vendor: true
          }
        }
      },
      orderBy: [
        { menu: { weekStartDate: 'desc' } },
        { dayOfWeek: 'asc' }
      ]
    });

    // Group selections by menu
    type MenuSelection = typeof selections[0];
    type GroupedSelections = {
      menu: MenuSelection['menu'];
      selections: MenuSelection[];
    };

    const selectionsByMenu = selections.reduce((acc, selection) => {
      const menuId = selection.menuId;
      if (!acc[menuId]) {
        acc[menuId] = {
          menu: selection.menu,
          selections: []
        };
      }
      acc[menuId].selections.push(selection);
      return acc;
    }, {} as Record<string, GroupedSelections>);

    return {
      success: true,
      selectionsByMenu: Object.values(selectionsByMenu),
      totalOrders: Object.keys(selectionsByMenu).length
    };
  } catch (error) {
    console.error('User order history fetch error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch order history' };
  }
}
