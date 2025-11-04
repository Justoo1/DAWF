"use server"

import prisma from '@/lib/prisma'
import { NotificationType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

/**
 * Create a notification for a single user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  linkUrl,
  eventId,
  contributionId,
  expenseId,
}: {
  userId: string
  type: NotificationType
  title: string
  message: string
  linkUrl?: string
  eventId?: string
  contributionId?: string
  expenseId?: number
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        linkUrl,
        eventId,
        contributionId,
        expenseId,
      },
    })

    revalidatePath('/')
    return { success: true, notification }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error: 'Failed to create notification' }
  }
}

/**
 * Create notifications for all active users
 */
export async function createNotificationForAllUsers({
  type,
  title,
  message,
  linkUrl,
  eventId,
  contributionId,
  expenseId,
}: {
  type: NotificationType
  title: string
  message: string
  linkUrl?: string
  eventId?: string
  contributionId?: string
  expenseId?: number
}) {
  try {
    // Get all active users
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    })

    // Create notifications for all users
    const notifications = await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type,
        title,
        message,
        linkUrl,
        eventId,
        contributionId,
        expenseId,
      })),
    })

    revalidatePath('/')
    return { success: true, count: notifications.count }
  } catch (error) {
    console.error('Error creating notifications for all users:', error)
    return { success: false, error: 'Failed to create notifications' }
  }
}

/**
 * Fetch notifications for a user
 */
export async function fetchUserNotifications(userId: string, limit: number = 20) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    })

    return {
      success: true,
      notifications,
      unreadCount,
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return { success: false, error: 'Failed to fetch notifications' }
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { success: false, error: 'Failed to mark notification as read' }
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return { success: false, error: 'Failed to mark notifications as read' }
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting notification:', error)
    return { success: false, error: 'Failed to delete notification' }
  }
}

/**
 * Delete all read notifications for a user
 */
export async function deleteReadNotifications(userId: string) {
  try {
    await prisma.notification.deleteMany({
      where: { userId, isRead: true },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting read notifications:', error)
    return { success: false, error: 'Failed to delete notifications' }
  }
}

/**
 * Notify about upcoming events (events starting within 24 hours)
 */
export async function notifyUpcomingEvents() {
  try {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // Find events starting within the next 24 hours
    const upcomingEvents = await prisma.event.findMany({
      where: {
        start: {
          gte: now,
          lte: tomorrow,
        },
        status: 'ACTIVE',
      },
      include: {
        user: true,
      },
    })

    let notificationCount = 0

    for (const event of upcomingEvents) {
      const result = await createNotificationForAllUsers({
        type: 'EVENT_UPCOMING',
        title: `Upcoming Event: ${event.title}`,
        message: `${event.title} is happening soon on ${event.start.toLocaleDateString()}. Don't miss it!`,
        linkUrl: '/events',
        eventId: event.id,
      })

      if (result.success) {
        notificationCount += result.count || 0
      }
    }

    return {
      success: true,
      eventCount: upcomingEvents.length,
      notificationCount,
    }
  } catch (error) {
    console.error('Error notifying upcoming events:', error)
    return { success: false, error: 'Failed to send upcoming event notifications' }
  }
}

/**
 * Notify about active events (events happening today)
 */
export async function notifyActiveEvents() {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

    // Find events active today
    const activeEvents = await prisma.event.findMany({
      where: {
        start: {
          gte: startOfDay,
          lt: endOfDay,
        },
        status: 'ACTIVE',
      },
      include: {
        user: true,
      },
    })

    let notificationCount = 0

    for (const event of activeEvents) {
      const result = await createNotificationForAllUsers({
        type: 'EVENT_ACTIVE',
        title: `Event Today: ${event.title}`,
        message: `${event.title} is happening today! Check the events page for details.`,
        linkUrl: '/events',
        eventId: event.id,
      })

      if (result.success) {
        notificationCount += result.count || 0
      }
    }

    return {
      success: true,
      eventCount: activeEvents.length,
      notificationCount,
    }
  } catch (error) {
    console.error('Error notifying active events:', error)
    return { success: false, error: 'Failed to send active event notifications' }
  }
}

/**
 * Send engagement reminder to all users
 */
export async function sendEngagementReminder() {
  try {
    const result = await createNotificationForAllUsers({
      type: 'REMINDER',
      title: 'Check the Welfare Fund App!',
      message: "Don't forget to check the app for new events, contributions, and updates from the welfare fund.",
      linkUrl: '/',
    })

    return result
  } catch (error) {
    console.error('Error sending engagement reminder:', error)
    return { success: false, error: 'Failed to send engagement reminder' }
  }
}

/**
 * Create notifications for users with a specific role
 */
export async function createNotificationForRole({
  role,
  type,
  title,
  message,
  linkUrl,
}: {
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  type: NotificationType
  title: string
  message: string
  linkUrl?: string
}) {
  try {
    // Get all active users with the specified role
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: role
      },
      select: { id: true },
    })

    if (users.length === 0) {
      return { success: true, count: 0, message: `No active users with role ${role}` }
    }

    // Create notifications for all users with the role
    const notifications = await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type,
        title,
        message,
        linkUrl,
      })),
    })

    revalidatePath('/')
    return { success: true, count: notifications.count }
  } catch (error) {
    console.error(`Error creating notifications for role ${role}:`, error)
    return { success: false, error: 'Failed to create notifications' }
  }
}

/**
 * Create notifications for users who can approve bookings
 */
export async function createNotificationForApprovers({
  type,
  title,
  message,
  linkUrl,
}: {
  type: NotificationType
  title: string
  message: string
  linkUrl?: string
}) {
  try {
    // Get all active users who can approve bookings
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        canApproveBookings: true
      },
      select: { id: true },
    })

    if (users.length === 0) {
      return { success: true, count: 0, message: 'No active users with booking approval permission' }
    }

    // Create notifications for all approvers
    const notifications = await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type,
        title,
        message,
        linkUrl,
      })),
    })

    revalidatePath('/')
    return { success: true, count: notifications.count }
  } catch (error) {
    console.error('Error creating notifications for approvers:', error)
    return { success: false, error: 'Failed to create notifications' }
  }
}
