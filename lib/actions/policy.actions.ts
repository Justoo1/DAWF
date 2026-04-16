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
  createdBy: string | null
  updatedBy: string | null
  attachmentName: string | null
  attachmentMime: string | null
  attachmentData: Uint8Array | null
  createdAt: Date
  updatedAt: Date
}

export interface CreatePolicyParams {
  title: string
  content: string
  updatedBy: string
  attachmentName?: string
  attachmentMime?: string
  attachmentDataBase64?: string
}

export interface UpdatePolicyParams {
  id: string
  title?: string
  content?: string
  updatedBy: string
  attachmentName?: string
  attachmentMime?: string
  attachmentDataBase64?: string
  removeAttachment?: boolean
}

// Fetch active policy by slug
export async function fetchPolicyBySlug(slug: string) {
  try {
    const policy = await prisma.policy.findFirst({
      where: {
        isActive: true,
        slug,
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

// Fetch the policy shown on /policy:
// prefer the welfare constitution slug, then fall back to latest active policy.
export async function fetchPublicPolicy(preferredSlug = "welfare-fund-constitution") {
  try {
    const preferred = await prisma.policy.findFirst({
      where: {
        isActive: true,
        slug: preferredSlug,
      },
    });

    if (preferred) {
      return { success: true, policy: preferred };
    }

    const fallback = await prisma.policy.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!fallback) {
      return { success: false, error: "Policy not found" };
    }

    return { success: true, policy: fallback };
  } catch (error) {
    console.error("Error fetching public policy:", error);
    return { success: false, error: "Failed to fetch policy" };
  }
}

// Fetch active policies for public listing, keeping the preferred slug first.
export async function fetchPublicPolicies(preferredSlug = "welfare-fund-constitution") {
  try {
    const policies = await prisma.policy.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (policies.length === 0) {
      return { success: false, error: "Policy not found", policies: [] };
    }

    const sorted = [...policies].sort((a, b) => {
      if (a.slug === preferredSlug) return -1;
      if (b.slug === preferredSlug) return 1;
      return 0;
    });

    return { success: true, policies: sorted };
  } catch (error) {
    console.error("Error fetching public policies:", error);
    return { success: false, error: "Failed to fetch policies", policies: [] };
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
    const baseSlug = params.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "policy"

    let slug = baseSlug
    let suffix = 2
    while (true) {
      const existing = await prisma.policy.findUnique({ where: { slug } })
      if (!existing) break
      slug = `${baseSlug}-${suffix}`
      suffix += 1
    }

    const policy = await prisma.policy.create({
      data: {
        title: params.title,
        slug,
        content: params.content,
        createdBy: params.updatedBy,
        updatedBy: params.updatedBy,
        attachmentName: params.attachmentName ?? null,
        attachmentMime: params.attachmentMime ?? null,
        attachmentData: params.attachmentDataBase64
          ? Buffer.from(params.attachmentDataBase64, "base64")
          : null,
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
        ...(params.removeAttachment
          ? {
              attachmentName: null,
              attachmentMime: null,
              attachmentData: null,
            }
          : {}),
        ...(params.attachmentDataBase64
          ? {
              attachmentName: params.attachmentName ?? existingPolicy.attachmentName,
              attachmentMime: params.attachmentMime ?? "application/pdf",
              attachmentData: Buffer.from(params.attachmentDataBase64, "base64"),
            }
          : {}),
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
