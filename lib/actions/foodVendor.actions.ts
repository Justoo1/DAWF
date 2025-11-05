"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { FoodVendor } from "../validation";

// ============================================
// FOOD VENDOR MANAGEMENT
// ============================================

export async function fetchAllFoodVendors() {
  try {
    const vendors = await prisma.foodVendor.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      vendors,
      totalVendors: vendors.length
    };
  } catch (error) {
    console.error('Food vendor fetch error:', error);
    return { error: 'Failed to fetch food vendors' };
  }
}

export async function fetchAllFoodVendorsIncludingInactive() {
  try {
    const vendors = await prisma.foodVendor.findMany({
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      vendors,
      totalVendors: vendors.length
    };
  } catch (error) {
    console.error('Food vendor fetch error:', error);
    return { error: 'Failed to fetch food vendors' };
  }
}

export async function fetchFoodVendorById(vendorId: string) {
  try {
    const vendor = await prisma.foodVendor.findUnique({
      where: { id: vendorId },
      include: {
        menus: {
          orderBy: { weekStartDate: 'desc' },
          take: 10
        }
      }
    });

    if (!vendor) {
      return { error: 'Food vendor not found' };
    }

    return { success: true, vendor };
  } catch (error) {
    console.error('Food vendor fetch error:', error);
    return { error: 'Failed to fetch food vendor' };
  }
}

export async function createFoodVendor(vendor: Omit<FoodVendor, 'id'>) {
  try {
    const newVendor = await prisma.foodVendor.create({
      data: {
        name: vendor.name,
        contactName: vendor.contactName || null,
        phone: vendor.phone || null,
        email: vendor.email || null,
        description: vendor.description || null,
        isActive: vendor.isActive ?? true
      }
    });

    revalidatePath('/admin/food-management/vendors');
    return { success: true, vendor: newVendor };
  } catch (error) {
    console.error('Food vendor creation error:', error);

    // Check for unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return { error: 'A vendor with this name already exists' };
    }

    return { error: 'Failed to create food vendor' };
  }
}

export async function updateFoodVendor(vendorId: string, vendor: Omit<FoodVendor, 'id'>) {
  try {
    const updatedVendor = await prisma.foodVendor.update({
      where: { id: vendorId },
      data: {
        name: vendor.name,
        contactName: vendor.contactName || null,
        phone: vendor.phone || null,
        email: vendor.email || null,
        description: vendor.description || null,
        isActive: vendor.isActive ?? true
      }
    });

    revalidatePath('/admin/food-management/vendors');
    return { success: true, vendor: updatedVendor };
  } catch (error) {
    console.error('Food vendor update error:', error);

    // Check for unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return { error: 'A vendor with this name already exists' };
    }

    return { error: 'Failed to update food vendor' };
  }
}

export async function deleteFoodVendor(vendorId: string) {
  try {
    // Soft delete by setting isActive to false
    await prisma.foodVendor.update({
      where: { id: vendorId },
      data: { isActive: false }
    });

    revalidatePath('/admin/food-management/vendors');
    return { success: true };
  } catch (error) {
    console.error('Food vendor deletion error:', error);
    return { error: 'Failed to delete food vendor' };
  }
}

export async function reactivateFoodVendor(vendorId: string) {
  try {
    await prisma.foodVendor.update({
      where: { id: vendorId },
      data: { isActive: true }
    });

    revalidatePath('/admin/food-management/vendors');
    return { success: true };
  } catch (error) {
    console.error('Food vendor reactivation error:', error);
    return { error: 'Failed to reactivate food vendor' };
  }
}
