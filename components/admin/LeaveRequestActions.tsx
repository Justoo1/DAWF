"use client"

import { useState } from "react"
import { MoreHorizontal, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { authClient } from "@/lib/auth-client"
import { approveLeaveRequest, rejectLeaveRequest, reinstateLeaveRequest } from "@/lib/actions/leave.actions"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function LeaveRequestActions({
  requestId,
  employeeName,
  requestStatus,
}: {
  requestId: string
  employeeName: string
  requestStatus: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
}) {
  const { toast } = useToast()
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const [popoverOpen, setPopoverOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [reinstateOpen, setReinstateOpen] = useState(false)
  const [declineReason, setDeclineReason] = useState("")
  const [reinstateReason, setReinstateReason] = useState("")
  const [busy, setBusy] = useState<"approve" | "decline" | "reinstate" | null>(null)

  const runApprove = async () => {
    const approverId = session?.user?.id
    if (!approverId) {
      toast({
        title: "Not signed in",
        description: "Sign in again to approve requests.",
        variant: "destructive",
      })
      return
    }
    setBusy("approve")
    const res = await approveLeaveRequest(requestId, approverId)
    setBusy(null)
    if (res.success) {
      setApproveOpen(false)
      setPopoverOpen(false)
      toast({
        title: "Approved",
        description: `Leave request for ${employeeName} has been approved.`,
      })
      router.refresh()
    } else {
      toast({
        title: "Could not approve",
        description: res.error || "Something went wrong.",
        variant: "destructive",
      })
    }
  }

  const runDecline = async () => {
    const approverId = session?.user?.id
    if (!approverId) {
      toast({
        title: "Not signed in",
        description: "Sign in again to decline requests.",
        variant: "destructive",
      })
      return
    }
    const note = declineReason.trim() || undefined
    setBusy("decline")
    const res = await rejectLeaveRequest(requestId, approverId, note)
    setBusy(null)
    if (res.success) {
      setDeclineOpen(false)
      setDeclineReason("")
      setPopoverOpen(false)
      toast({
        title: "Declined",
        description: `Leave request for ${employeeName} has been declined.`,
        variant: "destructive",
      })
      router.refresh()
    } else {
      toast({
        title: "Could not decline",
        description: res.error || "Something went wrong.",
        variant: "destructive",
      })
    }
  }

  const runReinstate = async () => {
    const approverId = session?.user?.id
    if (!approverId) {
      toast({
        title: "Not signed in",
        description: "Sign in again to reinstate requests.",
        variant: "destructive",
      })
      return
    }
    const note = reinstateReason.trim()
    if (!note) {
      toast({
        title: "Reason required",
        description: "Add a reason before reinstating this leave request.",
        variant: "destructive",
      })
      return
    }
    setBusy("reinstate")
    const res = await reinstateLeaveRequest(requestId, approverId, note)
    setBusy(null)
    if (res.success) {
      setReinstateOpen(false)
      setReinstateReason("")
      setPopoverOpen(false)
      toast({
        title: "Reinstated",
        description: `Leave request for ${employeeName} has been moved back to pending.`,
      })
      router.refresh()
    } else {
      toast({
        title: "Could not reinstate",
        description: res.error || "Something went wrong.",
        variant: "destructive",
      })
    }
  }

  if (requestStatus !== "PENDING" && requestStatus !== "REJECTED") {
    return <span className="text-xs text-slate-400 dark:text-zinc-600">—</span>
  }

  return (
    <div
      className="inline-block text-left"
      data-request-id={requestId}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition-colors"
            aria-label="Request actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={6}
          className="w-44 p-0 border border-primary/10 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg z-[200]"
          onClick={(e) => e.stopPropagation()}
        >
          {requestStatus === "PENDING" ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setPopoverOpen(false)
                  setApproveOpen(true)
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-primary/5 dark:hover:bg-zinc-800"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setPopoverOpen(false)
                  setDeclineReason("")
                  setDeclineOpen(true)
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Decline
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setPopoverOpen(false)
                setReinstateReason("")
                setReinstateOpen(true)
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              Reinstate
            </button>
          )}
        </PopoverContent>
      </Popover>

      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent
          className="border-slate-200 dark:border-zinc-800 sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Approve leave request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve the request for <span className="font-semibold text-foreground">{employeeName}</span>
              . They will be notified that their leave was approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy === "approve"}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              className="bg-[#10b981] hover:bg-[#059669] text-white"
              disabled={busy === "approve"}
              onClick={(e) => {
                e.preventDefault()
                void runApprove()
              }}
            >
              {busy === "approve" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving…
                </>
              ) : (
                "Confirm approval"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={declineOpen}
        onOpenChange={(open) => {
          setDeclineOpen(open)
          if (!open) setDeclineReason("")
        }}
      >
        <DialogContent
          className="border-slate-200 dark:border-zinc-800 sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
          onPointerDownOutside={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Decline leave request</DialogTitle>
            <DialogDescription>
              Decline the request for <span className="font-semibold text-foreground">{employeeName}</span>
              . They will be notified. You can add an optional note below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label htmlFor={`decline-reason-${requestId}`} className="text-sm font-medium">
              Reason for declining <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id={`decline-reason-${requestId}`}
              placeholder="e.g. Blackout dates, insufficient coverage…"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
              className="resize-none dark:bg-zinc-900 dark:border-zinc-700"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={busy === "decline"}
              onClick={() => setDeclineOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busy === "decline"}
              onClick={() => void runDecline()}
            >
              {busy === "decline" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Declining…
                </>
              ) : (
                "Decline request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={reinstateOpen}
        onOpenChange={(open) => {
          setReinstateOpen(open)
          if (!open) setReinstateReason("")
        }}
      >
        <DialogContent
          className="border-slate-200 dark:border-zinc-800 sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
          onPointerDownOutside={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Reinstate leave request</DialogTitle>
            <DialogDescription>
              Move this declined request back to <span className="font-semibold text-foreground">pending</span> for
              <span className="font-semibold text-foreground"> {employeeName}</span>. A reason is required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label htmlFor={`reinstate-reason-${requestId}`} className="text-sm font-medium">
              Reason for reinstating <span className="text-muted-foreground font-normal">(required)</span>
            </Label>
            <Textarea
              id={`reinstate-reason-${requestId}`}
              placeholder="e.g. New staffing update, additional clarification received…"
              value={reinstateReason}
              onChange={(e) => setReinstateReason(e.target.value)}
              rows={4}
              className="resize-none dark:bg-zinc-900 dark:border-zinc-700"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={busy === "reinstate"}
              onClick={() => setReinstateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={busy === "reinstate"}
              onClick={() => void runReinstate()}
            >
              {busy === "reinstate" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reinstating…
                </>
              ) : (
                "Reinstate request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
