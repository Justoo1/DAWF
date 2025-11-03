"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { ConferenceRoom, ConferenceRoomBooking } from "../validation";
import { createNotificationForAllUsers } from './notification.actions';
import { sendEmail, conferenceRoomBookingTemplate } from '../email';

// ============================================
// CONFERENCE ROOM MANAGEMENT
// ============================================

export async function fetchAllConferenceRooms() {
  try {
    const rooms = await prisma.conferenceRoom.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      rooms,
      totalRooms: rooms.length
    };
  } catch (error) {
    console.error('Conference room fetch error:', error);
    return { error: 'Failed to fetch conference rooms' };
  }
}

export async function fetchConferenceRoomById(roomId: string) {
  try {
    const room = await prisma.conferenceRoom.findUnique({
      where: { id: roomId },
      include: {
        bookings: {
          where: {
            start: {
              gte: new Date()
            },
            status: {
              in: ['APPROVED', 'PENDING']
            }
          },
          orderBy: { start: 'asc' }
        }
      }
    });

    if (!room) {
      return { error: 'Conference room not found' };
    }

    return { success: true, room };
  } catch (error) {
    console.error('Conference room fetch error:', error);
    return { error: 'Failed to fetch conference room' };
  }
}

export async function createConferenceRoom(room: Omit<ConferenceRoom, 'id'>) {
  try {
    await prisma.conferenceRoom.create({ data: room });
    revalidatePath('/admin/conference-rooms');
    return { success: true };
  } catch (error) {
    console.error('Conference room creation error:', error);
    return { error: 'Failed to create conference room' };
  }
}

export async function updateConferenceRoom(roomId: string, room: Omit<ConferenceRoom, 'id'>) {
  try {
    await prisma.conferenceRoom.update({
      where: { id: roomId },
      data: room
    });
    revalidatePath('/admin/conference-rooms');
    return { success: true };
  } catch (error) {
    console.error('Conference room update error:', error);
    return { error: 'Failed to update conference room' };
  }
}

export async function deleteConferenceRoom(roomId: string) {
  try {
    // Soft delete by setting isActive to false
    await prisma.conferenceRoom.update({
      where: { id: roomId },
      data: { isActive: false }
    });
    revalidatePath('/admin/conference-rooms');
    return { success: true };
  } catch (error) {
    console.error('Conference room deletion error:', error);
    return { error: 'Failed to delete conference room' };
  }
}

// ============================================
// CONFERENCE ROOM BOOKING MANAGEMENT
// ============================================

export async function fetchAllBookings() {
  try {
    const bookings = await prisma.conferenceRoomBooking.findMany({
      include: {
        room: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        }
      },
      orderBy: { start: 'desc' }
    });

    return {
      success: true,
      bookings,
      totalBookings: bookings.length
    };
  } catch (error) {
    console.error('Booking fetch error:', error);
    return { error: 'Failed to fetch bookings' };
  }
}

export async function fetchUpcomingBookings() {
  try {
    const now = new Date();
    const bookings = await prisma.conferenceRoomBooking.findMany({
      where: {
        start: { gte: now },
        status: { in: ['APPROVED', 'PENDING'] }
      },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        }
      },
      orderBy: { start: 'asc' },
      take: 10
    });

    return { success: true, bookings };
  } catch (error) {
    console.error('Upcoming bookings fetch error:', error);
    return { error: 'Failed to fetch upcoming bookings' };
  }
}

export async function fetchUserBookings(userId: string) {
  try {
    const bookings = await prisma.conferenceRoomBooking.findMany({
      where: { userId },
      include: {
        room: true
      },
      orderBy: { start: 'desc' }
    });

    return { success: true, bookings };
  } catch (error) {
    console.error('User bookings fetch error:', error);
    return { error: 'Failed to fetch user bookings' };
  }
}

export async function fetchBookingsForCalendar() {
  try {
    const bookings = await prisma.conferenceRoomBooking.findMany({
      where: {
        status: { in: ['APPROVED', 'PENDING'] }
      },
      include: {
        room: true,
        user: {
          select: {
            name: true,
            department: true
          }
        }
      },
      orderBy: { start: 'asc' }
    });

    // Transform to calendar event format
    const calendarBookings = bookings.map(booking => ({
      id: `booking-${booking.id}`,
      title: `${booking.room.name}: ${booking.title}`,
      start: booking.start.toISOString(),
      end: booking.end.toISOString(),
      allDay: false,
      extendedProps: {
        type: 'ROOM_BOOKING',
        roomId: booking.roomId,
        roomName: booking.room.name,
        userId: booking.userId,
        userName: booking.user.name,
        description: booking.description,
        purpose: booking.purpose,
        status: booking.status,
        attendeeCount: booking.attendeeCount
      },
      backgroundColor: booking.status === 'APPROVED' ? '#10b981' : '#f59e0b',
      borderColor: booking.status === 'APPROVED' ? '#059669' : '#d97706'
    }));

    return { success: true, bookings: calendarBookings };
  } catch (error) {
    console.error('Calendar bookings fetch error:', error);
    return { error: 'Failed to fetch calendar bookings' };
  }
}

/**
 * Check if a room is available for the specified time period
 */
export async function checkRoomAvailability(
  roomId: string,
  start: Date,
  end: Date,
  excludeBookingId?: string
) {
  try {
    const conflictingBookings = await prisma.conferenceRoomBooking.findMany({
      where: {
        roomId,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: { in: ['APPROVED', 'PENDING'] },
        OR: [
          // Booking starts during the requested period
          {
            start: {
              gte: start,
              lt: end
            }
          },
          // Booking ends during the requested period
          {
            end: {
              gt: start,
              lte: end
            }
          },
          // Booking completely encompasses the requested period
          {
            start: { lte: start },
            end: { gte: end }
          }
        ]
      }
    });

    return {
      success: true,
      isAvailable: conflictingBookings.length === 0,
      conflictingBookings
    };
  } catch (error) {
    console.error('Availability check error:', error);
    return { error: 'Failed to check room availability' };
  }
}

export async function createBooking(booking: Omit<ConferenceRoomBooking, 'id' | 'status'> & { userId: string }) {
  try {
    // Check room availability
    const availabilityCheck = await checkRoomAvailability(
      booking.roomId,
      new Date(booking.start),
      new Date(booking.end)
    );

    if (!availabilityCheck.success) {
      return { error: availabilityCheck.error };
    }

    if (!availabilityCheck.isAvailable) {
      return { error: 'Room is not available for the selected time period' };
    }

    // Get room details and user details
    const [room, user] = await Promise.all([
      prisma.conferenceRoom.findUnique({
        where: { id: booking.roomId }
      }),
      prisma.user.findUnique({
        where: { id: booking.userId },
        select: { name: true, email: true }
      })
    ]);

    if (!room) {
      return { error: 'Conference room not found' };
    }

    if (!user) {
      return { error: 'User not found' };
    }

    // Create the booking
    const createdBooking = await prisma.conferenceRoomBooking.create({
      data: {
        ...booking,
        start: new Date(booking.start),
        end: new Date(booking.end),
        status: 'APPROVED' // Auto-approve bookings
      }
    });

    // Format date/time for email
    const startDateTime = new Date(booking.start).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const endDateTime = new Date(booking.end).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Notify all users about the new booking
    await createNotificationForAllUsers({
      type: 'ROOM_BOOKING_CREATED',
      title: `Conference Room Booked: ${room.name}`,
      message: `${room.name} has been booked for ${booking.title} on ${new Date(booking.start).toLocaleDateString()}.`,
      linkUrl: '/events',
    });

    // Send email to all active employees
    try {
      // Fetch all active employees
      const activeEmployees = await prisma.user.findMany({
        where: { isActive: true },
        select: { email: true }
      });

      const emailAddresses = activeEmployees.map(emp => emp.email);

      if (emailAddresses.length > 0) {
        // Generate email HTML
        const emailHtml = conferenceRoomBookingTemplate(
          room.name,
          booking.title,
          user.name,
          startDateTime,
          endDateTime,
          booking.purpose || undefined,
          booking.description || undefined,
          booking.attendeeCount || undefined
        );

        // Send email to all active employees
        await sendEmail({
          to: emailAddresses,
          subject: `Conference Room Booked: ${room.name} - ${booking.title}`,
          html: emailHtml
        });

        console.log(`Booking notification email sent to ${emailAddresses.length} employees`);
      }
    } catch (emailError) {
      // Log email error but don't fail the booking
      console.error('Failed to send booking notification emails:', emailError);
    }

    revalidatePath('/conference-rooms');
    revalidatePath('/events');
    return { success: true, booking: createdBooking };
  } catch (error) {
    console.error('Booking creation error:', error);
    return { error: 'Failed to create booking' };
  }
}

export async function updateBooking(
  bookingId: string,
  booking: Omit<ConferenceRoomBooking, 'id' | 'userId'>
) {
  try {
    // Check room availability (excluding current booking)
    const availabilityCheck = await checkRoomAvailability(
      booking.roomId,
      new Date(booking.start),
      new Date(booking.end),
      bookingId
    );

    if (!availabilityCheck.success) {
      return { error: availabilityCheck.error };
    }

    if (!availabilityCheck.isAvailable) {
      return { error: 'Room is not available for the selected time period' };
    }

    await prisma.conferenceRoomBooking.update({
      where: { id: bookingId },
      data: {
        ...booking,
        start: new Date(booking.start),
        end: new Date(booking.end)
      }
    });

    revalidatePath('/conference-rooms');
    revalidatePath('/events');
    return { success: true };
  } catch (error) {
    console.error('Booking update error:', error);
    return { error: 'Failed to update booking' };
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    await prisma.conferenceRoomBooking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' }
    });

    revalidatePath('/conference-rooms');
    revalidatePath('/events');
    return { success: true };
  } catch (error) {
    console.error('Booking cancellation error:', error);
    return { error: 'Failed to cancel booking' };
  }
}

export async function deleteBooking(bookingId: string) {
  try {
    await prisma.conferenceRoomBooking.delete({
      where: { id: bookingId }
    });

    revalidatePath('/conference-rooms');
    revalidatePath('/events');
    return { success: true };
  } catch (error) {
    console.error('Booking deletion error:', error);
    return { error: 'Failed to delete booking' };
  }
}
