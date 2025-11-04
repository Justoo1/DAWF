"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { ConferenceRoom, ConferenceRoomBooking } from "../validation";
import { createNotificationForAllUsers, createNotificationForRole, createNotification } from './notification.actions';
import { sendEmail, conferenceRoomBookingTemplate, roomBookingApprovedTemplate, roomBookingRejectedTemplate } from '../email';

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

    // Create the booking with PENDING status
    const createdBooking = await prisma.conferenceRoomBooking.create({
      data: {
        ...booking,
        start: new Date(booking.start),
        end: new Date(booking.end),
        status: 'PENDING' // Requires approval from approvers
      }
    });

    // Notify all users with APPROVER role about the new booking pending approval
    await createNotificationForRole({
      role: 'APPROVER',
      type: 'ROOM_BOOKING_PENDING',
      title: `New Booking Awaiting Approval`,
      message: `${user.name} has requested to book ${room.name} for ${booking.title} on ${new Date(booking.start).toLocaleDateString()}. Please review and approve/reject.`,
      linkUrl: '/approvals',
    });

    console.log(`Booking created and pending approval. Approvers have been notified.`);

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

// ============================================
// BOOKING APPROVAL MANAGEMENT
// ============================================

export async function approveBooking(bookingId: string, approverId: string) {
  try {
    // Get the booking with user and room details
    const booking = await prisma.conferenceRoomBooking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        room: true
      }
    });

    if (!booking) {
      return { error: 'Booking not found' };
    }

    if (booking.status !== 'PENDING') {
      return { error: 'Booking is not pending approval' };
    }

    // Get approver details
    const approver = await prisma.user.findUnique({
      where: { id: approverId },
      select: { name: true, role: true }
    });

    if (!approver || approver.role !== 'APPROVER') {
      return { error: 'Only users with APPROVER role can approve bookings' };
    }

    // Update booking status to APPROVED
    await prisma.conferenceRoomBooking.update({
      where: { id: bookingId },
      data: {
        status: 'APPROVED',
        approvedBy: approverId
      }
    });

    // Format date/time for email
    const startDateTime = booking.start.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const endDateTime = booking.end.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Notify the requester that their booking was approved
    await createNotification({
      userId: booking.userId,
      type: 'ROOM_BOOKING_APPROVED',
      title: `Booking Approved: ${booking.room.name}`,
      message: `Your booking for ${booking.room.name} on ${booking.start.toLocaleDateString()} has been approved by ${approver.name}.`,
      linkUrl: '/conference-rooms',
    });

    // Send approval email to the requester
    try {
      const approvalEmailHtml = roomBookingApprovedTemplate(
        booking.user.name,
        booking.room.name,
        booking.title,
        startDateTime,
        endDateTime,
        approver.name
      );

      await sendEmail({
        to: booking.user.email,
        subject: `Booking Approved: ${booking.room.name} - ${booking.title}`,
        html: approvalEmailHtml
      });
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    // Notify all employees about the approved booking
    await createNotificationForAllUsers({
      type: 'ROOM_BOOKING_CREATED',
      title: `Conference Room Booked: ${booking.room.name}`,
      message: `${booking.room.name} has been booked for ${booking.title} on ${booking.start.toLocaleDateString()}.`,
      linkUrl: '/events',
    });

    // Send email to all active employees
    try {
      const activeEmployees = await prisma.user.findMany({
        where: { isActive: true },
        select: { email: true }
      });

      const emailAddresses = activeEmployees.map(emp => emp.email);

      if (emailAddresses.length > 0) {
        const emailHtml = conferenceRoomBookingTemplate(
          booking.room.name,
          booking.title,
          booking.user.name,
          startDateTime,
          endDateTime,
          booking.purpose || undefined,
          booking.description || undefined,
          booking.attendeeCount || undefined
        );

        await sendEmail({
          to: emailAddresses,
          subject: `Conference Room Booked: ${booking.room.name} - ${booking.title}`,
          html: emailHtml
        });

        console.log(`Booking approval notification sent to ${emailAddresses.length} employees`);
      }
    } catch (emailError) {
      console.error('Failed to send booking notification emails:', emailError);
    }

    revalidatePath('/conference-rooms');
    revalidatePath('/events');
    revalidatePath('/approvals');
    return { success: true };
  } catch (error) {
    console.error('Booking approval error:', error);
    return { error: 'Failed to approve booking' };
  }
}

export async function rejectBooking(bookingId: string, approverId: string, rejectionReason: string) {
  try {
    // Get the booking with user and room details
    const booking = await prisma.conferenceRoomBooking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        room: true
      }
    });

    if (!booking) {
      return { error: 'Booking not found' };
    }

    if (booking.status !== 'PENDING') {
      return { error: 'Booking is not pending approval' };
    }

    // Get approver details
    const approver = await prisma.user.findUnique({
      where: { id: approverId },
      select: { name: true, role: true }
    });

    if (!approver || approver.role !== 'APPROVER') {
      return { error: 'Only users with APPROVER role can reject bookings' };
    }

    // Update booking status to REJECTED
    await prisma.conferenceRoomBooking.update({
      where: { id: bookingId },
      data: {
        status: 'REJECTED',
        approvedBy: approverId,
        rejectionReason
      }
    });

    // Format date/time for email
    const startDateTime = booking.start.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const endDateTime = booking.end.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Notify the requester that their booking was rejected
    await createNotification({
      userId: booking.userId,
      type: 'ROOM_BOOKING_REJECTED',
      title: `Booking Rejected: ${booking.room.name}`,
      message: `Your booking for ${booking.room.name} on ${booking.start.toLocaleDateString()} has been rejected. Reason: ${rejectionReason}`,
      linkUrl: '/conference-rooms',
    });

    // Send rejection email to the requester
    try {
      const rejectionEmailHtml = roomBookingRejectedTemplate(
        booking.user.name,
        booking.room.name,
        booking.title,
        startDateTime,
        endDateTime,
        rejectionReason,
        approver.name
      );

      await sendEmail({
        to: booking.user.email,
        subject: `Booking Rejected: ${booking.room.name} - ${booking.title}`,
        html: rejectionEmailHtml
      });
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    revalidatePath('/conference-rooms');
    revalidatePath('/events');
    revalidatePath('/approvals');
    return { success: true };
  } catch (error) {
    console.error('Booking rejection error:', error);
    return { error: 'Failed to reject booking' };
  }
}

export async function fetchPendingBookings() {
  try {
    const bookings = await prisma.conferenceRoomBooking.findMany({
      where: { status: 'PENDING' },
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
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      bookings,
      totalBookings: bookings.length
    };
  } catch (error) {
    console.error('Pending bookings fetch error:', error);
    return { error: 'Failed to fetch pending bookings' };
  }
}
