"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma"
import { Event } from "../validation";
import { createNotificationForAllUsers } from './notification.actions';

export async function fetchUpcomingEvents() {
  try {
    const now = new Date();

    // Fetch regular events
    const events = await prisma.event.findMany({
      orderBy: {
        start: 'asc'
      }
    })

    // Fetch approved/pending conference room bookings
    const bookings = await prisma.conferenceRoomBooking.findMany({
      where: {
        status: { in: ['APPROVED', 'PENDING'] }
      },
      include: {
        room: true,
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        start: 'asc'
      }
    })

    // Transform bookings to match event format
    const bookingEvents = bookings.map(booking => ({
      id: `booking-${booking.id}`,
      title: `${booking.room.name}: ${booking.title}`,
      start: booking.start,
      end: booking.end,
      type: 'ROOM_BOOKING' as const,
      category: 'COMPANY' as const,
      userId: booking.userId,
      description: booking.description,
      location: booking.room.name,
      status: 'ACTIVE' as const,
      maxAttendees: booking.attendeeCount,
      isRecurring: false,
      year: booking.start.getFullYear(),
      month: booking.start.getMonth() + 1,
      quarter: Math.floor(booking.start.getMonth() / 3) + 1,
      emailNotificationSent: false,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    // Combine events and bookings
    const allEvents = [...events, ...bookingEvents];

    const upcomingEvents = getfilteredUpcomingEvents(now, allEvents);
    const eventTypes = allEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      success: true,
      events: upcomingEvents,
      totalEvents: allEvents.length,
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
import { fetchBookingsForCalendar } from './conferenceRoom.actions';
import { getfilteredUpcomingEvents } from "../utils";

// Modify the fetchAllEvents function to return compatible events
export async function fetchAllEventsForCalendar() {
  try {
    const result = await fetchAllEvents(); // Call your existing function
    const bookingsResult = await fetchBookingsForCalendar(); // Get conference room bookings

    if (result.success) {
      // Map regular events
      const events: EventInput[] = result.events.map(event => {
        // Determine color based on event category and type
        let backgroundColor = '#3b82f6'; // Default blue
        let borderColor = '#2563eb';

        if (event.category === 'WELFARE') {
          backgroundColor = '#ec4899'; // Pink for welfare events
          borderColor = '#db2777';
        } else if (event.category === 'COMPANY') {
          backgroundColor = '#8b5cf6'; // Purple for company events
          borderColor = '#7c3aed';
        }

        return {
          id: event.id, // FullCalendar's ID
          title: event.title, // Title for the event
          start: event.start.toISOString(), // Start date in ISO format
          end: event.end ? event.end.toISOString() : undefined, // End date in ISO format
          allDay: false, // Adjust based on your logic
          backgroundColor,
          borderColor,
          extendedProps: {
            type: event.type,
            category: event.category,
            userId: event.userId, // Extra data can go here
            description: event.description,
            location: event.location,
            status: event.status,
            maxAttendees: event.maxAttendees,
            isRecurring: event.isRecurring
          }
        };
      });

      // Add conference room bookings to the calendar
      if (bookingsResult.success && bookingsResult.bookings) {
        events.push(...bookingsResult.bookings);
      }

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
      const createdEvent = await prisma.event.create({ data: event })

      // Notify all users about the new event
      await createNotificationForAllUsers({
        type: 'EVENT_CREATED',
        title: `New Event: ${event.title}`,
        message: `A new ${event.type.toLowerCase()} event has been scheduled for ${new Date(event.start).toLocaleDateString()}.`,
        linkUrl: '/events',
        eventId: createdEvent.id,
      })

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

