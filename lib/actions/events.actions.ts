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
        include: {
          user: true
        },
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

export async function deleteEvent(eventId: number) {
    try {
      await prisma.event.delete({ where: { id: eventId } })
      revalidatePath('/admin/events')
      return { success: true }
    } catch (error) {
      console.error('Event deletion error:', error)
      return { error: 'Failed to delete event' }
    }
}

export async function updateEvent(eventId: number, event: Event) {
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
  
  