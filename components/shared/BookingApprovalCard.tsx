"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { approveBooking, rejectBooking } from '@/lib/actions/conferenceRoom.actions'
import { formatDateTime } from '@/lib/utils'

interface BookingApprovalCardProps {
  booking: {
    id: string
    title: string
    description: string | null
    start: Date
    end: Date
    purpose: string | null
    attendeeCount: number | null
    room: {
      id: string
      name: string
      capacity: number
      location: string | null
    }
    user: {
      id: string
      name: string
      email: string
      department: string | null
    }
    createdAt: Date
  }
  approverId: string
  onApprovalComplete?: () => void
}

const BookingApprovalCard = ({ booking, approverId, onApprovalComplete }: BookingApprovalCardProps) => {
  const { toast } = useToast()
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      const result = await approveBooking(booking.id, approverId)

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error
        })
      } else {
        toast({
          title: 'Success',
          description: 'Booking approved successfully'
        })
        onApprovalComplete?.()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong'
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a reason for rejection'
      })
      return
    }

    setIsProcessing(true)
    try {
      const result = await rejectBooking(booking.id, approverId, rejectionReason)

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error
        })
      } else {
        toast({
          title: 'Success',
          description: 'Booking declined successfully'
        })
        setIsRejectDialogOpen(false)
        setRejectionReason('')
        onApprovalComplete?.()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong'
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Card className="bg-zinc-800/50 p-4 sm:p-6 border-yellow-600">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="text-lg font-semibold text-white">{booking.title}</h3>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-600 text-white whitespace-nowrap">
                PENDING
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <p className="text-zinc-400">Requested by:</p>
                <p className="text-white font-medium">{booking.user.name}</p>
                {booking.user.department && (
                  <p className="text-zinc-400 text-xs">{booking.user.department}</p>
                )}
              </div>

              <div>
                <p className="text-zinc-400">Conference Room:</p>
                <p className="text-white font-medium">{booking.room.name}</p>
                {booking.room.location && (
                  <p className="text-zinc-400 text-xs">{booking.room.location}</p>
                )}
              </div>

              <div>
                <p className="text-zinc-400">Start Time:</p>
                <p className="text-white">{formatDateTime(booking.start).dateTime}</p>
              </div>

              <div>
                <p className="text-zinc-400">End Time:</p>
                <p className="text-white">{formatDateTime(booking.end).dateTime}</p>
              </div>

              {booking.purpose && (
                <div>
                  <p className="text-zinc-400">Purpose:</p>
                  <p className="text-white">{booking.purpose}</p>
                </div>
              )}

              {booking.description && (
                <div>
                  <p className="text-zinc-400">Description:</p>
                  <p className="text-white">{booking.description}</p>
                </div>
              )}

              {booking.attendeeCount && (
                <div>
                  <p className="text-zinc-400">Expected Attendees:</p>
                  <p className="text-white">{booking.attendeeCount} people</p>
                </div>
              )}

              <div>
                <p className="text-zinc-400">Requested on:</p>
                <p className="text-white text-xs">{formatDateTime(booking.createdAt).dateTime}</p>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? 'Processing...' : 'Approve'}
            </Button>
            <Button
              onClick={() => setIsRejectDialogOpen(true)}
              disabled={isProcessing}
              variant="destructive"
              className="flex-1 sm:flex-none"
            >
              Reject
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800">
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Please provide a reason for rejecting this booking. This will be sent to {booking.user.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px] bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false)
                setRejectionReason('')
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BookingApprovalCard
