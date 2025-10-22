"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma"
import { Event } from "../validation";

export async function fetchUpcomingEvents() {
  try {
    
    const events = await prisma.event.findMany({
      orderBy: {
        start: 'asc'
      }
    })

    const upcomingEvents = events
    .filter(event => event.start > new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 3)

    const eventTypes = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      success: true,
      events: upcomingEvents,
      totalEvents: events.length,
      eventTypes,
    };
  } catch (error) {
    console.error('Event fetch error:', error);
    return { error: 'Failed to fetch upcoming events' };
  }
}


  export async function fetchAllEvents() {
    try {
      const events = await prisma.event.findMany({
        // include: {
        //   user: true
        // },
        orderBy: {
          start: 'asc'
        }
      })
  
      return { 
        success: true, 
        events,
        totalEvents: events.length
      }
    } catch (error) {
      console.error('Event fetch error:', error)
      return { error: 'Failed to fetch upcoming events' }
    }
}

import { EventInput } from '@fullcalendar/core';

// Modify the fetchAllEvents function to return compatible events
export async function fetchAllEventsForCalendar() {
  try {
    const result = await fetchAllEvents(); // Call your existing function

    if (result.success) {
      const events: EventInput[] = result.events.map(event => ({
        id: event.id, // FullCalendar's ID
        title: event.title, // Title for the event
        start: event.start.toISOString(), // Start date in ISO format
        end: event.end ? event.end.toISOString() : undefined, // End date in ISO format
        allDay: false, // Adjust based on your logic
        extendedProps: {
          userId: event.userId, // Extra data can go here
          description: event.description,
          location: event.location,
          status: event.status
        }
      }));

      return { 
        success: true, 
        events,
        totalEvents: events.length 
      };
    } else {
      return { error: 'Failed to fetch events' };
    }
  } catch (error) {
    console.error('Event fetch error:', error);
    return { error: 'Failed to fetch events' };
  }
}


export async function deleteEvent(eventId: string) {
    try {
      await prisma.event.delete({ where: { id: eventId } })
      revalidatePath('/admin/events')
      return { success: true }
    } catch (error) {
      console.error('Event deletion error:', error)
      return { error: 'Failed to delete event' }
    }
}

export async function updateEvent(eventId: string, event: Event) {
    try {
      await prisma.event.update({
        where: { id: eventId },
        data: event
      })
      revalidatePath('/admin/events')
      return { success: true }
    } catch (error) {
      console.error('Event update error:', error)
      return { error: 'Failed to update event' }
    }
}

export async function createEvent(event: Event) {
    try {
      await prisma.event.create({ data: event })
      revalidatePath('/admin/events')
      return { success: true }
    } catch (error) {
      console.error('Event creation error:', error)
      return { error: 'Failed to create event' }
    }
}

/**
 * Automatically generate birthday events for all employees for a specific year
 * This should be run at the start of each year (or manually triggered)
 */
export async function generateBirthdayEvents(year?: number) {
  try {
    const targetYear = year || new Date().getFullYear()

    // Get all users with birthdays
    const users = await prisma.user.findMany({
      where: {
        dateOfBirth: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        dateOfBirth: true
      }
    })

    if (users.length === 0) {
      return {
        success: true,
        message: 'No users with birthdays found',
        created: 0,
        skipped: 0,
        errors: []
      }
    }

    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[]
    }

    for (const user of users) {
      if (!user.dateOfBirth) continue

      const birthDate = new Date(user.dateOfBirth)
      const birthdayThisYear = new Date(targetYear, birthDate.getMonth(), birthDate.getDate())

      // Set the event to start at 9 AM and end at 5 PM on birthday
      const eventStart = new Date(birthdayThisYear)
      eventStart.setHours(9, 0, 0, 0)

      const eventEnd = new Date(birthdayThisYear)
      eventEnd.setHours(17, 0, 0, 0)

      // Check if birthday event already exists for this user and year
      const existingEvent = await prisma.event.findFirst({
        where: {
          userId: user.id,
          type: 'BIRTHDAY',
          year: targetYear,
          month: birthDate.getMonth() + 1
        }
      })

      if (existingEvent) {
        results.skipped++
        continue
      }

      // Create the birthday event
      try {
        await prisma.event.create({
          data: {
            userId: user.id,
            type: 'BIRTHDAY',
            title: `${user.name}'s Birthday`,
            start: eventStart,
            end: eventEnd,
            year: targetYear,
            month: birthDate.getMonth() + 1,
            quarter: Math.floor(birthDate.getMonth() / 3) + 1,
            description: `Birthday celebration for ${user.name}`,
            location: 'Office',
            status: 'ACTIVE',
            emailNotificationSent: false
          }
        })
        results.created++
      } catch (error) {
        console.error(`Failed to create birthday event for ${user.name}:`, error)
        results.errors.push(`Failed to create event for ${user.name}`)
      }
    }

    revalidatePath('/admin/events')
    revalidatePath('/admin/calendar')

    return {
      success: true,
      message: `Generated birthday events for ${targetYear}`,
      totalUsers: users.length,
      created: results.created,
      skipped: results.skipped,
      errors: results.errors,
      year: targetYear
    }
  } catch (error) {
    console.error('Birthday event generation error:', error)
    return {
      success: false,
      error: 'Failed to generate birthday events'
    }
  }
}

/**
 * Generate birthday events for multiple years (useful for initial setup)
 */
export async function generateBirthdayEventsMultipleYears(startYear: number, endYear: number) {
  try {
    const results = []

    for (let year = startYear; year <= endYear; year++) {
      const result = await generateBirthdayEvents(year)
      results.push({ year, ...result })
    }

    return {
      success: true,
      results
    }
  } catch (error) {
    console.error('Multi-year birthday generation error:', error)
    return {
      success: false,
      error: 'Failed to generate birthday events for multiple years'
    }
  }
}

