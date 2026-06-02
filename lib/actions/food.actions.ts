"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { requireFoodCommitteeOrAdmin } from '@/lib/security';
import { isValidPrismaId, sanitizeText } from '@/lib/utils/validators';

// ============================================
// FOOD MANAGEMENT
// ============================================

export async function fetchAllFoods(vendorId?: string) {
  try {
    const foods = await prisma.food.findMany({
      where: {
        isActive: true,
        ...(vendorId && {
          vendorItems: { some: { vendorId, isActive: true } }
        })
      },
      include: {
        vendorItems: {
          where: { isActive: true },
          include: { vendor: true },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    return { success: true, foods, totalFoods: foods.length };
  } catch (error) {
    console.error('Food fetch error:', error);
    return { error: 'Failed to fetch foods' };
  }
}

export async function fetchFoodById(foodId: string) {
  try {
    const food = await prisma.food.findUnique({
      where: { id: foodId },
      include: {
        vendorItems: {
          include: { vendor: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!food) return { error: 'Food not found' };
    return { success: true, food };
  } catch (error) {
    console.error('Food fetch error:', error);
    return { error: 'Failed to fetch food' };
  }
}

interface VendorAssignment {
  vendorId: string;
  price?: number;
}

interface CreateFoodData {
  name: string;
  description?: string;
  category?: string;
  isSpecialOrder?: boolean;
  vendorAssignments?: VendorAssignment[];
}

export async function createFood(data: CreateFoodData) {
  try {
    await requireFoodCommitteeOrAdmin();

    const name = sanitizeText(data.name);

    const existing = await prisma.food.findUnique({ where: { name } });
    if (existing) return { error: `A food item named "${name}" already exists` };

    const food = await prisma.food.create({
      data: {
        name,
        description: data.description ? sanitizeText(data.description) : null,
        category: data.category ? sanitizeText(data.category) : null,
        isSpecialOrder: data.isSpecialOrder ?? false,
        vendorItems: data.vendorAssignments?.length
          ? {
              create: data.vendorAssignments
                .filter(a => isValidPrismaId(a.vendorId))
                .map(a => ({ vendorId: a.vendorId, price: a.price ?? null }))
            }
          : undefined
      },
      include: {
        vendorItems: { include: { vendor: true } }
      }
    });

    revalidatePath('/admin/food-management/foods');
    return { success: true, food };
  } catch (error) {
    console.error('Food creation error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return { error: 'A food item with this name already exists' };
    }
    return { error: error instanceof Error ? error.message : 'Failed to create food' };
  }
}

interface UpdateFoodData extends CreateFoodData {
  isActive?: boolean;
}

export async function updateFood(foodId: string, data: UpdateFoodData) {
  try {
    await requireFoodCommitteeOrAdmin();

    if (!isValidPrismaId(foodId)) return { error: 'Invalid food ID' };

    const name = sanitizeText(data.name);

    await prisma.$transaction(async (tx) => {
      await tx.food.update({
        where: { id: foodId },
        data: {
          name,
          description: data.description ? sanitizeText(data.description) : null,
          category: data.category ? sanitizeText(data.category) : null,
          isSpecialOrder: data.isSpecialOrder ?? false,
          isActive: data.isActive ?? true,
        }
      });

      if (data.vendorAssignments !== undefined) {
        const validAssignments = data.vendorAssignments.filter(a => isValidPrismaId(a.vendorId));
        const assignedVendorIds = validAssignments.map(a => a.vendorId);

        // Remove assignments no longer in the list
        await tx.foodVendorItem.deleteMany({
          where: { foodId, vendorId: { notIn: assignedVendorIds } }
        });

        // Upsert each assignment
        for (const assignment of validAssignments) {
          await tx.foodVendorItem.upsert({
            where: { foodId_vendorId: { foodId, vendorId: assignment.vendorId } },
            create: { foodId, vendorId: assignment.vendorId, price: assignment.price ?? null },
            update: { price: assignment.price ?? null, isActive: true }
          });
        }
      }
    });

    const food = await prisma.food.findUnique({
      where: { id: foodId },
      include: { vendorItems: { include: { vendor: true } } }
    });

    revalidatePath('/admin/food-management/foods');
    return { success: true, food };
  } catch (error) {
    console.error('Food update error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return { error: 'A food item with this name already exists' };
    }
    return { error: error instanceof Error ? error.message : 'Failed to update food' };
  }
}

export async function deleteFood(foodId: string) {
  try {
    await requireFoodCommitteeOrAdmin();
    if (!isValidPrismaId(foodId)) return { error: 'Invalid food ID' };

    await prisma.food.update({ where: { id: foodId }, data: { isActive: false } });

    revalidatePath('/admin/food-management/foods');
    return { success: true };
  } catch (error) {
    console.error('Food deletion error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete food' };
  }
}

// ============================================
// BULK EXCEL UPLOAD
// ============================================

export interface BulkFoodRow {
  name: string;
  description?: string;
  category?: string;
  isSpecialOrder?: boolean;
}

export async function bulkCreateFoods(rows: BulkFoodRow[]) {
  try {
    await requireFoodCommitteeOrAdmin();

    if (!rows.length) return { error: 'No food items provided' };

    const sanitized = rows.map(r => ({
      name: sanitizeText(r.name),
      description: r.description ? sanitizeText(r.description) : null,
      category: r.category ? sanitizeText(r.category) : null,
      isSpecialOrder: r.isSpecialOrder ?? false,
    })).filter(r => r.name.length >= 2);

    if (!sanitized.length) return { error: 'No valid food names found' };

    // Deduplicate within the incoming batch
    const seen = new Set<string>();
    const unique = sanitized.filter(r => {
      const key = r.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const result = await prisma.food.createMany({
      data: unique,
      skipDuplicates: true,
    });

    revalidatePath('/admin/food-management/foods');
    return { success: true, created: result.count };
  } catch (error) {
    console.error('Bulk food create error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create food items' };
  }
}
