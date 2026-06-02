"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { FoodVendor } from "../validation";
import { requireFoodCommitteeOrAdmin } from '@/lib/security';
import { isValidPrismaId, sanitizeText } from '@/lib/utils/validators';

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
    if (!isValidPrismaId(vendorId)) {
      return { error: 'Invalid vendor ID' };
    }
    
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
    return { error: error instanceof Error ? error.message : 'Failed to fetch food vendor' };
  }
}

export async function createFoodVendor(vendor: Omit<FoodVendor, 'id'>) {
  try {
    await requireFoodCommitteeOrAdmin();
    
    const sanitizedVendor = {
      ...vendor,
      name: sanitizeText(vendor.name),
      contactName: vendor.contactName ? sanitizeText(vendor.contactName) : null,
      phone: vendor.phone ? sanitizeText(vendor.phone) : null,
      email: vendor.email ? sanitizeText(vendor.email) : null,
      description: vendor.description ? sanitizeText(vendor.description) : null,
    };
    
    const newVendor = await prisma.foodVendor.create({
      data: sanitizedVendor
    });

    revalidatePath('/admin/food-management/vendors');
    return { success: true, vendor: newVendor };
  } catch (error) {
    console.error('Food vendor creation error:', error);

    // Check for unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return { error: 'A vendor with this name already exists' };
    }

    return { error: error instanceof Error ? error.message : 'Failed to create food vendor' };
  }
}

export async function updateFoodVendor(vendorId: string, vendor: Omit<FoodVendor, 'id'>) {
  try {
    await requireFoodCommitteeOrAdmin();
    
    if (!isValidPrismaId(vendorId)) {
      return { error: 'Invalid vendor ID' };
    }
    
    const sanitizedVendor = {
      ...vendor,
      name: sanitizeText(vendor.name),
      contactName: vendor.contactName ? sanitizeText(vendor.contactName) : null,
      phone: vendor.phone ? sanitizeText(vendor.phone) : null,
      email: vendor.email ? sanitizeText(vendor.email) : null,
      description: vendor.description ? sanitizeText(vendor.description) : null,
    };
    
    const updatedVendor = await prisma.foodVendor.update({
      where: { id: vendorId },
      data: sanitizedVendor
    });

    revalidatePath('/admin/food-management/vendors');
    return { success: true, vendor: updatedVendor };
  } catch (error) {
    console.error('Food vendor update error:', error);

    // Check for unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return { error: 'A vendor with this name already exists' };
    }

    return { error: error instanceof Error ? error.message : 'Failed to update food vendor' };
  }
}

export async function deleteFoodVendor(vendorId: string) {
  try {
    await requireFoodCommitteeOrAdmin();
    
    if (!isValidPrismaId(vendorId)) {
      return { error: 'Invalid vendor ID' };
    }
    
    // Soft delete by setting isActive to false
    await prisma.foodVendor.update({
      where: { id: vendorId },
      data: { isActive: false }
    });

    revalidatePath('/admin/food-management/vendors');
    return { success: true };
  } catch (error) {
    console.error('Food vendor deletion error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete food vendor' };
  }
}

export async function reactivateFoodVendor(vendorId: string) {
  try {
    await requireFoodCommitteeOrAdmin();
    
    if (!isValidPrismaId(vendorId)) {
      return { error: 'Invalid vendor ID' };
    }
    
    await prisma.foodVendor.update({
      where: { id: vendorId },
      data: { isActive: true }
    });

    revalidatePath('/admin/food-management/vendors');
    return { success: true };
  } catch (error) {
    console.error('Food vendor reactivation error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to reactivate food vendor' };
  }
}

/** Enable or disable a vendor without changing other fields. */
export async function setFoodVendorActive(vendorId: string, isActive: boolean) {
  try {
    await requireFoodCommitteeOrAdmin();
    
    if (!isValidPrismaId(vendorId)) {
      return { error: 'Invalid vendor ID' };
    }
    
    await prisma.foodVendor.update({
      where: { id: vendorId },
      data: { isActive },
    });
    revalidatePath('/admin/food-management/vendors');
    revalidatePath('/admin/food-management/menus');
    return { success: true as const };
  } catch (error) {
    console.error('Food vendor active toggle error:', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Failed to update vendor status' };
  }
}

/**
 * Permanently removes the vendor and its weekly menus.
 * FoodVendorItem assignments for this vendor cascade-delete automatically.
 * Foods themselves are NOT deleted — they are shared catalog items.
 */
export async function permanentlyDeleteFoodVendor(vendorId: string) {
  try {
    await requireFoodCommitteeOrAdmin();

    if (!isValidPrismaId(vendorId)) {
      return { success: false as const, error: 'Invalid vendor ID' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.weeklyFoodMenu.deleteMany({ where: { vendorId } });
      // FoodVendorItem rows for this vendor cascade-delete via FK
      await tx.foodVendor.delete({ where: { id: vendorId } });
    });
    revalidatePath('/admin/food-management/vendors');
    revalidatePath('/admin/food-management/menus');
    revalidatePath('/admin/food-management/foods');
    return { success: true as const };
  } catch (error) {
    console.error('Food vendor permanent delete error:', error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Could not delete this vendor. It may still be referenced elsewhere.',
    };
  }
}
