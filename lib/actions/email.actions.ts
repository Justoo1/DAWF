"use server"

import prisma from "../prisma"
import {
  sendEmail,
  birthdayWishTemplate,
  childbirthAnnouncementTemplate,
  childbirthCongratulationsTemplate,
  marriageAnnouncementTemplate,
  marriageCongratulationsTemplate,
  upcomingEventTemplate
} from "../email"
import { formatDateTime } from "../utils"

/**
 * Get users with upcoming birthdays (within next 7 days)
 */
export async function getUpcomingBirthdays() {
  try {
    const users = await prisma.user.findMany({
      where: {
        dateOfBirth: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        dateOfBirth: true
      }
    })

    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)

    const upcomingBirthdays = users.filter(user => {
      if (!user.dateOfBirth) return false

      const birthday = new Date(user.dateOfBirth)
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())

      return thisYearBirthday >= today && thisYearBirthday <= nextWeek
    }).map(user => ({
      ...user,
      daysUntilBirthday: Math.ceil((new Date(today.getFullYear(), new Date(user.dateOfBirth!).getMonth(), new Date(user.dateOfBirth!).getDate()).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }))

    return { success: true, birthdays: upcomingBirthdays }
  } catch (error) {
    console.error('Get upcoming birthdays error:', error)
    return { success: false, error: 'Failed to fetch upcoming birthdays' }
  }
}

/**
 * Get today's birthdays
 */
export async function getTodayBirthdays() {
  try {
    const users = await prisma.user.findMany({
      where: {
        dateOfBirth: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        dateOfBirth: true
      }
    })

    const today = new Date()
    const todayBirthdays = users.filter(user => {
      if (!user.dateOfBirth) return false

      const birthday = new Date(user.dateOfBirth)
      return birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate()
    })

    return { success: true, birthdays: todayBirthdays }
  } catch (error) {
    console.error('Get today birthdays error:', error)
    return { success: false, error: 'Failed to fetch today birthdays' }
  }
}

/**
 * Send birthday wishes to employees whose birthday is today
 */
export async function sendBirthdayWishes() {
  try {
    const { success, birthdays } = await getTodayBirthdays()

    if (!success || !birthdays || birthdays.length === 0) {
      return { success: true, message: 'No birthdays today' }
    }

    const results = await Promise.all(
      birthdays.map(async (user) => {
        const html = birthdayWishTemplate(user.name)
        return await sendEmail({
          to: user.email,
          subject: `🎉 Happy Birthday ${user.name}!`,
          html
        })
      })
    )

    const successCount = results.filter(r => r.success).length

    return {
      success: true,
      message: `Sent birthday wishes to ${successCount} employee(s)`,
      totalBirthdays: birthdays.length,
      successCount
    }
  } catch (error) {
    console.error('Send birthday wishes error:', error)
    return { success: false, error: 'Failed to send birthday wishes' }
  }
}

/**
 * Send event notification to all employees
 */
export async function sendEventNotification(eventId: string) {
  try {
    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { user: true }
    })

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    // Check if notification already sent
    if (event.emailNotificationSent) {
      return { success: false, error: 'Notification already sent for this event' }
    }

    // Get all employees
    const employees = await prisma.user.findMany({
      select: {
        email: true,
        name: true
      }
    })

    if (employees.length === 0) {
      return { success: false, error: 'No employees found' }
    }

    const eventDate = formatDateTime(event.start).dateOnly
    const html = upcomingEventTemplate(
      event.title,
      event.type,
      eventDate,
      event.location || undefined,
      event.description || undefined
    )

    // Send to all employees
    const result = await sendEmail({
      to: employees.map(emp => emp.email),
      subject: `📅 Upcoming Event: ${event.title}`,
      html
    })

    if (result.success) {
      // Mark notification as sent
      await prisma.event.update({
        where: { id: eventId },
        data: { emailNotificationSent: true }
      })
    }

    return {
      success: result.success,
      message: `Event notification sent to ${employees.length} employee(s)`
    }
  } catch (error) {
    console.error('Send event notification error:', error)
    return { success: false, error: 'Failed to send event notification' }
  }
}

/**
 * Send childbirth announcement
 * - Congratulations email to the parent
 * - Announcement email to all other employees
 */
export async function sendChildbirthAnnouncement(eventId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { user: true }
    })

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    if (event.type !== 'CHILDBIRTH') {
      return { success: false, error: 'Event is not a childbirth event' }
    }

    if (event.emailNotificationSent) {
      return { success: false, error: 'Announcement already sent for this event' }
    }

    // Send congratulations to the parent
    const congratsHtml = childbirthCongratulationsTemplate(event.user.name)
    await sendEmail({
      to: event.user.email,
      subject: `👶 Congratulations on Your New Baby!`,
      html: congratsHtml
    })

    // Send announcement to all other employees
    const otherEmployees = await prisma.user.findMany({
      where: {
        id: { not: event.userId }
      },
      select: { email: true }
    })

    if (otherEmployees.length > 0) {
      const announcementHtml = childbirthAnnouncementTemplate(event.user.name)
      await sendEmail({
        to: otherEmployees.map(emp => emp.email),
        subject: `🎊 Wonderful News - ${event.user.name} Welcomed a New Baby!`,
        html: announcementHtml
      })
    }

    // Mark as sent
    await prisma.event.update({
      where: { id: eventId },
      data: { emailNotificationSent: true }
    })

    return {
      success: true,
      message: `Childbirth announcement sent to all employees`
    }
  } catch (error) {
    console.error('Send childbirth announcement error:', error)
    return { success: false, error: 'Failed to send childbirth announcement' }
  }
}

/**
 * Send marriage announcement
 * - Congratulations email to the employee
 * - Announcement email to all other employees
 */
export async function sendMarriageAnnouncement(eventId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { user: true }
    })

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    if (event.type !== 'MARRIAGE') {
      return { success: false, error: 'Event is not a marriage event' }
    }

    if (event.emailNotificationSent) {
      return { success: false, error: 'Announcement already sent for this event' }
    }

    // Send congratulations to the employee
    const congratsHtml = marriageCongratulationsTemplate(event.user.name)
    await sendEmail({
      to: event.user.email,
      subject: `💍 Congratulations on Your Marriage!`,
      html: congratsHtml
    })

    // Send announcement to all other employees
    const otherEmployees = await prisma.user.findMany({
      where: {
        id: { not: event.userId }
      },
      select: { email: true }
    })

    if (otherEmployees.length > 0) {
      const announcementHtml = marriageAnnouncementTemplate(event.user.name)
      await sendEmail({
        to: otherEmployees.map(emp => emp.email),
        subject: `💝 Joyful News - ${event.user.name} Got Married!`,
        html: announcementHtml
      })
    }

    // Mark as sent
    await prisma.event.update({
      where: { id: eventId },
      data: { emailNotificationSent: true }
    })

    return {
      success: true,
      message: `Marriage announcement sent to all employees`
    }
  } catch (error) {
    console.error('Send marriage announcement error:', error)
    return { success: false, error: 'Failed to send marriage announcement' }
  }
}

/**
 * Check and send notifications for upcoming events (within 3 days)
 * This function should be called by a cron job
 */
export async function checkAndSendUpcomingEventNotifications() {
  try {
    const today = new Date()
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(today.getDate() + 3)

    // Get events starting within the next 3 days that haven't had notifications sent
    const upcomingEvents = await prisma.event.findMany({
      where: {
        start: {
          gte: today,
          lte: threeDaysFromNow
        },
        emailNotificationSent: false,
        status: 'ACTIVE'
      },
      include: { user: true }
    })

    if (upcomingEvents.length === 0) {
      return { success: true, message: 'No upcoming events to notify' }
    }

    const results = await Promise.all(
      upcomingEvents.map(async (event) => {
        // Send different types of notifications based on event type
        if (event.type === 'CHILDBIRTH') {
          return await sendChildbirthAnnouncement(event.id)
        } else if (event.type === 'MARRIAGE') {
          return await sendMarriageAnnouncement(event.id)
        } else {
          return await sendEventNotification(event.id)
        }
      })
    )

    const successCount = results.filter(r => r.success).length

    return {
      success: true,
      message: `Sent notifications for ${successCount} out of ${upcomingEvents.length} events`
    }
  } catch (error) {
    console.error('Check upcoming events error:', error)
    return { success: false, error: 'Failed to check upcoming events' }
  }
}
