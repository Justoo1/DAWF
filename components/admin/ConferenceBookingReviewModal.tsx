"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { approveBooking, rejectBooking } from "@/lib/actions/conferenceRoom.actions"
import type { ConferenceRoomBookingValues } from "@/lib/validation"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

type Props = {
  booking: ConferenceRoomBookingValues | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  canReviewBookings: boolean
}

function formatRange(start: Date, end: Date) {
  const dOpts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }
  const tOpts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" }
  const s = new Date(start)
  const e = new Date(end)
  return {
    dateLine: s.toLocaleDateString(undefined, dOpts),
    timeLine: `${s.toLocaleTimeString(undefined, tOpts)} – ${e.toLocaleTimeString(undefined, tOpts)}`,
  }
}

export function ConferenceBookingReviewModal({
  booking,
  open,
  onOpenChange,
  userId,
  canReviewBookings,
}: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showReject, setShowReject] = useState(false)

  const resetLocal = () => {
    setBusy(null)
    setRejectReason("")
    setShowReject(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) resetLocal()
    onOpenChange(next)
  }

  if (!booking) return null

  const isPending = booking.status === "PENDING"
  const canAct = canReviewBookings && isPending
  const { dateLine, timeLine } = formatRange(booking.start, booking.end)

  const onApprove = async () => {
    if (!booking.id) return
    setBusy("approve")
    try {
      const res = await approveBooking(booking.id, userId)
      if (res && "error" in res && res.error) {
        toast({ title: "Could not approve", description: res.error, variant: "destructive" })
        return
      }
      toast({ title: "Booking approved", description: `${booking.title} is confirmed.` })
      handleOpenChange(false)
      router.refresh()
    } finally {
      setBusy(null)
    }
  }

  const onReject = async () => {
    if (!booking.id) return
    const reason = rejectReason.trim()
    if (reason.length < 3) {
      toast({
        title: "Reason required",
        description: "Please enter a short reason for declining (at least 3 characters).",
        variant: "destructive",
      })
      return
    }
    setBusy("reject")
    try {
      const res = await rejectBooking(booking.id, userId, reason)
      if (res && "error" in res && res.error) {
        toast({ title: "Could not decline", description: res.error, variant: "destructive" })
        return
      }
      toast({ title: "Booking declined", description: "The requester has been notified." })
      handleOpenChange(false)
      router.refresh()
    } finally {
      setBusy(null)
    }
  }

  const statusLabel = booking.status === "REJECTED" ? "DECLINED" : booking.status

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Booking details</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {canAct
              ? "Review the request and approve or decline."
              : !isPending
                ? "This booking is no longer pending."
                : "You do not have permission to approve or decline. Ask an admin or booking approver."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={cn(
                "font-bold uppercase tracking-wider",
                booking.status === "APPROVED" && "bg-emerald-600",
                booking.status === "PENDING" && "bg-amber-600",
                booking.status === "REJECTED" && "bg-rose-600",
                booking.status === "CANCELLED" && "bg-slate-600"
              )}
            >
              {statusLabel}
            </Badge>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Title</p>
            <p className="font-semibold text-foreground">{booking.title}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Room</p>
              <p className="text-sm font-medium">{booking.room.name}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Requested by
              </p>
              <p className="text-sm font-medium">{booking.user.name}</p>
              <p className="text-xs text-muted-foreground">{booking.user.email}</p>
              {booking.user.department ? (
                <p className="text-xs text-muted-foreground">{booking.user.department}</p>
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">When</p>
            <p className="text-sm font-medium">{dateLine}</p>
            <p className="text-sm text-muted-foreground">{timeLine}</p>
          </div>

          {booking.purpose ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Purpose</p>
              <p className="text-sm">{booking.purpose}</p>
            </div>
          ) : null}

          {booking.description ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Description
              </p>
              <p className="text-sm whitespace-pre-wrap">{booking.description}</p>
            </div>
          ) : null}

          {booking.attendeeCount != null ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Expected attendees
              </p>
              <p className="text-sm">{booking.attendeeCount}</p>
            </div>
          ) : null}

          {booking.rejectionReason ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Decline reason
              </p>
              <p className="text-sm text-rose-900 dark:text-rose-100">{booking.rejectionReason}</p>
            </div>
          ) : null}

          {canAct && showReject ? (
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason for declining</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain briefly why this slot cannot be approved…"
                className="min-h-[88px] rounded-xl"
                disabled={busy !== null}
              />
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          {canAct ? (
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
              {!showReject ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl font-semibold"
                    onClick={() => setShowReject(true)}
                    disabled={busy !== null}
                  >
                    Decline
                  </Button>
                  <Button
                    type="button"
                    className="rounded-xl bg-[#10A074] font-semibold hover:bg-[#0d8460]"
                    onClick={onApprove}
                    disabled={busy !== null}
                  >
                    {busy === "approve" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Approving…
                      </>
                    ) : (
                      "Approve"
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => {
                      setShowReject(false)
                      setRejectReason("")
                    }}
                    disabled={busy !== null}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="rounded-xl font-semibold"
                    onClick={onReject}
                    disabled={busy !== null}
                  >
                    {busy === "reject" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Declining…
                      </>
                    ) : (
                      "Confirm decline"
                    )}
                  </Button>
                </>
              )}
            </div>
          ) : null}
          <Button type="button" variant="secondary" className="rounded-xl" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
