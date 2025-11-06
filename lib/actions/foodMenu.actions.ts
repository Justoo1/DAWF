"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { createNotificationForAllUsers } from "./notification.actions";
import { sendEmail } from "../email";
import { foodMenuPublishedTemplate, foodSelectionReminderTemplate } from "../email-templates";

// ============================================
// WEEKLY FOOD MENU MANAGEMENT
// ============================================

export async function fetchAllFoodMenus() {
  try {
    const menus = await prisma.weeklyFoodMenu.findMany({
      where: { isActive: true },
      include: {
        vendor: true,
        menuItems: {
          orderBy: [{ dayOfWeek: 'asc' }, { displayOrder: 'asc' }]
        },
        _count: {
          select: { selections: true }
        }
      },
      orderBy: { weekStartDate: 'desc' }
    });

    return {
      success: true,
      menus,
      totalMenus: menus.length
    };
  } catch (error) {
    console.error('Food menu fetch error:', error);
    return { error: 'Failed to fetch food menus' };
  }
}

export async function fetchFoodMenuById(menuId: string) {
  try {
    const menu = await prisma.weeklyFoodMenu.findUnique({
      where: { id: menuId },
      include: {
        vendor: true,
        menuItems: {
          orderBy: [{ dayOfWeek: 'asc' }, { displayOrder: 'asc' }]
        },
        _count: {
          select: { selections: true }
        }
      }
    });

    if (!menu) {
      return { error: 'Food menu not found' };
    }

    return { success: true, menu };
  } catch (error) {
    console.error('Food menu fetch error:', error);
    return { error: 'Failed to fetch food menu' };
  }
}

export async function fetchActiveFoodMenus() {
  try {
    const now = new Date();

    const menus = await prisma.weeklyFoodMenu.findMany({
      where: {
        isActive: true,
        status: 'PUBLISHED',
        selectionOpenDate: { lte: now },
        selectionCloseDate: { gte: now }
      },
      include: {
        vendor: true,
        menuItems: {
          where: { isAvailable: true },
          orderBy: [{ dayOfWeek: 'asc' }, { displayOrder: 'asc' }]
        }
      },
      orderBy: { weekStartDate: 'asc' }
    });

    return {
      success: true,
      menus
    };
  } catch (error) {
    console.error('Active food menus fetch error:', error);
    return { error: 'Failed to fetch active food menus' };
  }
}

interface CreateMenuData {
  vendorId: string;
  weekStartDate: string;
  weekEndDate: string;
  selectionOpenDate: string;
  selectionCloseDate: string;
  menuItems: Array<{
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
    itemName: string;
    description?: string;
    price?: number;
    isAvailable?: boolean;
    displayOrder?: number;
  }>;
}

export async function createFoodMenu(data: CreateMenuData, createdBy: string) {
  try {
    const menu = await prisma.weeklyFoodMenu.create({
      data: {
        vendorId: data.vendorId,
        weekStartDate: new Date(data.weekStartDate),
        weekEndDate: new Date(data.weekEndDate),
        selectionOpenDate: new Date(data.selectionOpenDate),
        selectionCloseDate: new Date(data.selectionCloseDate),
        status: 'DRAFT',
        createdBy,
        menuItems: {
          create: data.menuItems.map((item) => ({
            dayOfWeek: item.dayOfWeek,
            itemName: item.itemName,
            description: item.description || null,
            price: item.price || null,
            isAvailable: item.isAvailable ?? true,
            displayOrder: item.displayOrder ?? 0
          }))
        }
      },
      include: {
        vendor: true,
        menuItems: true
      }
    });

    revalidatePath('/admin/food-management/menus');
    return { success: true, menu };
  } catch (error) {
    console.error('Food menu creation error:', error);
    return { error: 'Failed to create food menu' };
  }
}

export async function updateFoodMenu(menuId: string, data: CreateMenuData) {
  try {
    // Check if menu is still in DRAFT status
    const existingMenu = await prisma.weeklyFoodMenu.findUnique({
      where: { id: menuId },
      select: { status: true }
    });

    if (!existingMenu) {
      return { error: 'Menu not found' };
    }

    if (existingMenu.status !== 'DRAFT') {
      return { error: 'Can only update menus in DRAFT status' };
    }

    // Delete existing menu items and create new ones
    await prisma.foodMenuItem.deleteMany({
      where: { menuId }
    });

    const menu = await prisma.weeklyFoodMenu.update({
      where: { id: menuId },
      data: {
        vendorId: data.vendorId,
        weekStartDate: new Date(data.weekStartDate),
        weekEndDate: new Date(data.weekEndDate),
        selectionOpenDate: new Date(data.selectionOpenDate),
        selectionCloseDate: new Date(data.selectionCloseDate),
        menuItems: {
          create: data.menuItems.map((item) => ({
            dayOfWeek: item.dayOfWeek,
            itemName: item.itemName,
            description: item.description || null,
            price: item.price || null,
            isAvailable: item.isAvailable ?? true,
            displayOrder: item.displayOrder ?? 0
          }))
        }
      },
      include: {
        vendor: true,
        menuItems: true
      }
    });

    revalidatePath('/admin/food-management/menus');
    return { success: true, menu };
  } catch (error) {
    console.error('Food menu update error:', error);
    return { error: 'Failed to update food menu' };
  }
}

export async function publishFoodMenu(menuId: string) {
  try {
    const menu = await prisma.weeklyFoodMenu.findUnique({
      where: { id: menuId },
      include: { vendor: true, menuItems: true }
    });

    if (!menu) {
      return { error: 'Menu not found' };
    }

    if (menu.status !== 'DRAFT') {
      return { error: 'Menu is already published' };
    }

    // Update menu status to PUBLISHED
    await prisma.weeklyFoodMenu.update({
      where: { id: menuId },
      data: {
        status: 'PUBLISHED',
        notificationSent: true
      }
    });

    // Get all active users
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, email: true, name: true }
    });

    // Create notifications for all users
    const weekStart = menu.weekStartDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    const weekEnd = menu.weekEndDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    await createNotificationForAllUsers({
      type: 'FOOD_MENU_PUBLISHED',
      title: `${menu.vendor.name} - Weekly Menu Available`,
      message: `The food menu for ${weekStart} - ${weekEnd} is now available. Make your selections before ${menu.selectionCloseDate.toLocaleDateString()}.`,
      linkUrl: '/food-orders'
    });

    // Send email notifications
    const emailPromises = users.map((user) =>
      sendEmail({
        to: user.email,
        subject: `${menu.vendor.name} - Weekly Food Menu Available`,
        html: foodMenuPublishedTemplate({
          userName: user.name,
          vendorName: menu.vendor.name,
          weekStartDate: menu.weekStartDate,
          weekEndDate: menu.weekEndDate,
          selectionCloseDate: menu.selectionCloseDate,
          linkUrl: 'https://dawf.edtmsys.com/food-orders'
        })
      })
    );

    await Promise.allSettled(emailPromises);

    revalidatePath('/admin/food-management/menus');
    revalidatePath('/food-orders');
    return { success: true };
  } catch (error) {
    console.error('Food menu publish error:', error);
    return { error: 'Failed to publish food menu' };
  }
}

export async function closeFoodMenuSelection(menuId: string) {
  try {
    await prisma.weeklyFoodMenu.update({
      where: { id: menuId },
      data: { status: 'CLOSED' }
    });

    revalidatePath('/admin/food-management/menus');
    revalidatePath('/food-orders');
    return { success: true };
  } catch (error) {
    console.error('Food menu close error:', error);
    return { error: 'Failed to close food menu selection' };
  }
}

export async function markFoodMenuAsSent(menuId: string) {
  try {
    await prisma.weeklyFoodMenu.update({
      where: { id: menuId },
      data: { status: 'SENT' }
    });

    revalidatePath('/admin/food-management/menus');
    return { success: true };
  } catch (error) {
    console.error('Food menu mark as sent error:', error);
    return { error: 'Failed to mark menu as sent' };
  }
}

export async function revertMenuToDraft(menuId: string) {
  try {
    const menu = await prisma.weeklyFoodMenu.findUnique({
      where: { id: menuId },
      select: { status: true }
    });

    if (!menu) {
      return { error: 'Menu not found' };
    }

    if (menu.status === 'DRAFT') {
      return { error: 'Menu is already in DRAFT status' };
    }

    await prisma.weeklyFoodMenu.update({
      where: { id: menuId },
      data: { status: 'DRAFT' }
    });

    revalidatePath('/admin/food-management/menus');
    return { success: true };
  } catch (error) {
    console.error('Menu revert error:', error);
    return { error: 'Failed to revert menu to draft' };
  }
}

export async function deleteFoodMenu(menuId: string) {
  try {
    const menu = await prisma.weeklyFoodMenu.findUnique({
      where: { id: menuId },
      select: { status: true }
    });

    if (!menu) {
      return { error: 'Menu not found' };
    }

    if (menu.status !== 'DRAFT') {
      return { error: 'Can only delete menus in DRAFT status' };
    }

    await prisma.weeklyFoodMenu.update({
      where: { id: menuId },
      data: { isActive: false }
    });

    revalidatePath('/admin/food-management/menus');
    return { success: true };
  } catch (error) {
    console.error('Food menu deletion error:', error);
    return { error: 'Failed to delete food menu' };
  }
}

export async function sendSelectionReminders() {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find menus closing within 24 hours that haven't sent reminders
    const menusToRemind = await prisma.weeklyFoodMenu.findMany({
      where: {
        status: 'PUBLISHED',
        selectionCloseDate: {
          gte: now,
          lte: tomorrow
        },
        reminderSent: false
      },
      include: {
        vendor: true
      }
    });

    for (const menu of menusToRemind) {
      // Get users who haven't made selections
      const allUsers = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true, email: true, name: true }
      });

      const usersWithSelections = await prisma.foodSelection.findMany({
        where: { menuId: menu.id },
        select: { userId: true },
        distinct: ['userId']
      });

      const userIdsWithSelections = new Set(usersWithSelections.map((s) => s.userId));
      const usersWithoutSelections = allUsers.filter((u) => !userIdsWithSelections.has(u.id));

      // Send reminders
      const notificationPromises = usersWithoutSelections.map(() =>
        createNotificationForAllUsers({
          type: 'FOOD_SELECTION_REMINDER',
          title: 'Reminder: Food Selection Deadline Approaching',
          message: `Don't forget to make your food selections for ${menu.vendor.name}. Deadline: ${menu.selectionCloseDate.toLocaleDateString()}.`,
          linkUrl: '/food-orders'
        })
      );

      const emailPromises = usersWithoutSelections.map((user) =>
        sendEmail({
          to: user.email,
          subject: 'Reminder: Food Selection Deadline Approaching',
          html: foodSelectionReminderTemplate({
            userName: user.name,
            vendorName: menu.vendor.name,
            selectionCloseDate: menu.selectionCloseDate,
            linkUrl: 'https://dawf.edtmsys.com/food-orders'
          })
        })
      );

      await Promise.allSettled([...notificationPromises, ...emailPromises]);

      // Mark reminder as sent
      await prisma.weeklyFoodMenu.update({
        where: { id: menu.id },
        data: { reminderSent: true }
      });
    }

    return { success: true, remindersCount: menusToRemind.length };
  } catch (error) {
    console.error('Send selection reminders error:', error);
    return { error: 'Failed to send selection reminders' };
  }
}
