"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";

// ============================================
// FOOD MANAGEMENT
// ============================================

export async function fetchAllFoods(vendorId?: string) {
  try {
    const foods = await prisma.food.findMany({
      where: {
        isActive: true,
        ...(vendorId && { vendorId })
      },
      include: {
        vendor: true
      },
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      foods,
      totalFoods: foods.length
    };
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
        vendor: true
      }
    });

    if (!food) {
      return { error: 'Food not found' };
    }

    return { success: true, food };
  } catch (error) {
    console.error('Food fetch error:', error);
    return { error: 'Failed to fetch food' };
  }
}

interface CreateFoodData {
  name: string;
  description?: string;
  price?: number;
  category?: string;
  vendorId: string;
  isSpecialOrder?: boolean;
}

export async function createFood(data: CreateFoodData) {
  try {
    const food = await prisma.food.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price || null,
        category: data.category || null,
        vendorId: data.vendorId,
        isSpecialOrder: data.isSpecialOrder || false
      },
      include: {
        vendor: true
      }
    });

    revalidatePath('/admin/food-management/foods');
    return { success: true, food };
  } catch (error) {
    console.error('Food creation error:', error);
    return { error: 'Failed to create food' };
  }
}

export async function updateFood(foodId: string, data: CreateFoodData) {
  try {
    const food = await prisma.food.update({
      where: { id: foodId },
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price || null,
        category: data.category || null,
        vendorId: data.vendorId,
        isSpecialOrder: data.isSpecialOrder || false
      },
      include: {
        vendor: true
      }
    });

    revalidatePath('/admin/food-management/foods');
    return { success: true, food };
  } catch (error) {
    console.error('Food update error:', error);
    return { error: 'Failed to update food' };
  }
}

export async function deleteFood(foodId: string) {
  try {
    // Soft delete by setting isActive to false
    await prisma.food.update({
      where: { id: foodId },
      data: { isActive: false }
    });

    revalidatePath('/admin/food-management/foods');
    return { success: true };
  } catch (error) {
    console.error('Food deletion error:', error);
    return { error: 'Failed to delete food' };
  }
}
