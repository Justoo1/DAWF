"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ConferenceRoomForm from './ConferenceRoomForm'
import { ConferenceRoomValues } from '@/lib/validation'

interface ConferenceRoomModalProps {
  isOpen: boolean
  onClose: () => void
  room?: ConferenceRoomValues
  isEdit?: boolean
}

export const ConferenceRoomModal = ({
  isOpen,
  onClose,
  room,
  isEdit
}: ConferenceRoomModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Conference Room' : 'Add New Conference Room'}
          </DialogTitle>
        </DialogHeader>
        <ConferenceRoomForm 
          room={room} 
          isEdit={isEdit} 
          onSuccess={onClose} 
          onCancel={onClose} 
        />
      </DialogContent>
    </Dialog>
  )
}
