"use server";

import prisma from '../prisma'
import { requireAdmin } from '@/lib/security'
import type { Prisma } from '@prisma/client'

export type AuditActor = {
  id: string
  name: string
  email: string
}

/**
 * Records an admin action. Never throws — a logging failure must not break
 * the underlying operation it's recording, so callers can fire-and-forget this.
 */
export async function logAuditEvent(params: {
  actor: AuditActor | null
  action: string
  entityType: string
  entityId?: string | null
  description: string
  metadata?: Record<string, unknown>
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actor?.id ?? null,
        actorName: params.actor?.name ?? 'System',
        actorEmail: params.actor?.email ?? 'system',
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        description: params.description,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}

export type AuditLogRow = {
  id: string
  actorId: string | null
  actorName: string
  actorEmail: string
  action: string
  entityType: string
  entityId: string | null
  description: string
  metadata: Prisma.JsonValue | null
  createdAt: Date
}

const PAGE_SIZE_DEFAULT = 25
const PAGE_SIZE_MAX = 100

export async function fetchAuditLogs(params: {
  page?: number
  pageSize?: number
  search?: string
  action?: string
  entityType?: string
  from?: string
  to?: string
} = {}) {
  try {
    await requireAdmin()

    const page = Math.max(1, params.page ?? 1)
    const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, params.pageSize ?? PAGE_SIZE_DEFAULT))

    const where: Prisma.AuditLogWhereInput = {}

    if (params.action) {
      where.action = params.action
    }
    if (params.entityType) {
      where.entityType = params.entityType
    }
    if (params.search?.trim()) {
      const q = params.search.trim()
      where.OR = [
        { description: { contains: q, mode: 'insensitive' } },
        { actorName: { contains: q, mode: 'insensitive' } },
        { actorEmail: { contains: q, mode: 'insensitive' } },
        { action: { contains: q, mode: 'insensitive' } },
        { entityId: { contains: q, mode: 'insensitive' } },
      ]
    }
    if (params.from || params.to) {
      where.createdAt = {}
      if (params.from) where.createdAt.gte = new Date(params.from)
      if (params.to) where.createdAt.lte = new Date(params.to)
    }

    const [total, logs, distinctActions, distinctEntityTypes] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.findMany({
        distinct: ['action'],
        select: { action: true },
        orderBy: { action: 'asc' },
      }),
      prisma.auditLog.findMany({
        distinct: ['entityType'],
        select: { entityType: true },
        orderBy: { entityType: 'asc' },
      }),
    ])

    return {
      success: true as const,
      logs: logs as AuditLogRow[],
      total,
      page,
      pageSize,
      actions: distinctActions.map((a) => a.action),
      entityTypes: distinctEntityTypes.map((e) => e.entityType),
    }
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch audit logs'
    return { success: false as const, error: message }
  }
}
