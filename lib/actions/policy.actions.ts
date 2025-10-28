"use server"

import prisma from '@/lib/prisma'
import { revalidatePath } from "next/cache"

export interface Policy {
  id: string
  title: string
  slug: string
  content: string
  version: number
  isActive: boolean
  updatedBy: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreatePolicyParams {
  title: string
  slug: string
  content: string
  updatedBy: string
}

export interface UpdatePolicyParams {
  id: string
  title?: string
  content?: string
  updatedBy: string
}

// Fetch active policy by slug
export async function fetchPolicyBySlug(slug: string) {
  try {
    const policy = await prisma.policy.findFirst({
      where: {
        slug,
        isActive: true,
      },
    })

    if (!policy) {
      return { success: false, error: "Policy not found" }
    }

    return { success: true, policy }
  } catch (error) {
    console.error("Error fetching policy:", error)
    return { success: false, error: "Failed to fetch policy" }
  }
}

// Fetch all policies (for admin)
export async function fetchAllPolicies() {
  try {
    const policies = await prisma.policy.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    })

    return { success: true, policies }
  } catch (error) {
    console.error("Error fetching policies:", error)
    return { success: false, error: "Failed to fetch policies", policies: [] }
  }
}

// Create new policy
export async function createPolicy(params: CreatePolicyParams) {
  try {
    // Check if slug already exists
    const existingPolicy = await prisma.policy.findUnique({
      where: { slug: params.slug },
    })

    if (existingPolicy) {
      return { success: false, error: "A policy with this slug already exists" }
    }

    const policy = await prisma.policy.create({
      data: {
        title: params.title,
        slug: params.slug,
        content: params.content,
        updatedBy: params.updatedBy,
      },
    })

    revalidatePath("/policy")
    revalidatePath("/admin/policies")

    return { success: true, policy }
  } catch (error) {
    console.error("Error creating policy:", error)
    return { success: false, error: "Failed to create policy" }
  }
}

// Update existing policy
export async function updatePolicy(params: UpdatePolicyParams) {
  try {
    const existingPolicy = await prisma.policy.findUnique({
      where: { id: params.id },
    })

    if (!existingPolicy) {
      return { success: false, error: "Policy not found" }
    }

    const policy = await prisma.policy.update({
      where: { id: params.id },
      data: {
        ...(params.title && { title: params.title }),
        ...(params.content && { content: params.content }),
        updatedBy: params.updatedBy,
        version: existingPolicy.version + 1,
      },
    })

    revalidatePath("/policy")
    revalidatePath(`/policy/${policy.slug}`)
    revalidatePath("/admin/policies")

    return { success: true, policy }
  } catch (error) {
    console.error("Error updating policy:", error)
    return { success: false, error: "Failed to update policy" }
  }
}

// Toggle policy active status
export async function togglePolicyStatus(id: string, updatedBy: string) {
  try {
    const existingPolicy = await prisma.policy.findUnique({
      where: { id },
    })

    if (!existingPolicy) {
      return { success: false, error: "Policy not found" }
    }

    const policy = await prisma.policy.update({
      where: { id },
      data: {
        isActive: !existingPolicy.isActive,
        updatedBy,
      },
    })

    revalidatePath("/policy")
    revalidatePath("/admin/policies")

    return { success: true, policy }
  } catch (error) {
    console.error("Error toggling policy status:", error)
    return { success: false, error: "Failed to toggle policy status" }
  }
}

// Delete policy
export async function deletePolicy(id: string) {
  try {
    await prisma.policy.delete({
      where: { id },
    })

    revalidatePath("/policy")
    revalidatePath("/admin/policies")

    return { success: true }
  } catch (error) {
    console.error("Error deleting policy:", error)
    return { success: false, error: "Failed to delete policy" }
  }
}
