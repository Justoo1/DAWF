'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'

/**
 * Require authenticated session
 */
export async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    throw new Error('Unauthorized: You must be logged in')
  }
  return session
}

/**
 * Require authenticated user with additional data
 */
export async function requireAuthenticatedUser() {
  const session = await requireAuth()
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      canApproveBookings: true,
      isActive: true,
      department: true,
    },
  })
  if (!user) {
    throw new Error('Unauthorized: User not found')
  }
  if (!user.isActive) {
    throw new Error('Unauthorized: Account is disabled')
  }
  return user
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  const user = await requireAuthenticatedUser()
  if (user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required')
  }
  return user
}

/**
 * Require manager or admin
 */
export async function requireManagerOrAdmin() {
  const user = await requireAuthenticatedUser()
  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    throw new Error('Unauthorized: Manager or Admin access required')
  }
  return user
}

/**
 * Require food committee or admin
 */
export async function requireFoodCommitteeOrAdmin() {
  const user = await requireAuthenticatedUser()
  if (user.role !== 'ADMIN' && user.role !== 'FOOD_COMMITTEE') {
    throw new Error('Unauthorized: Food committee or Admin access required')
  }
  return user
}
