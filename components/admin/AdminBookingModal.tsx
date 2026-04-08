"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import BookingForm from '@/components/shared/BookingForm'
import { ConferenceRoomValues } from '@/lib/validation'

interface AdminBookingModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  rooms: ConferenceRoomValues[]
}

export const AdminBookingModal = ({
  isOpen,
  onClose,
  userId,
  rooms
}: AdminBookingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Room Booking</DialogTitle>
        </DialogHeader>
        <BookingForm 
          userId={userId} 
          rooms={rooms} 
          onSuccess={onClose} 
        />
      </DialogContent>
    </Dialog>
  )
}
