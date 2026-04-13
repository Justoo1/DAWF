"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Mail } from "lucide-react"

type EmailVerificationSentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** New work email the verification link was sent to. */
  email: string
}

export function EmailVerificationSentDialog({
  open,
  onOpenChange,
  email,
}: EmailVerificationSentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              <Mail className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-lg">Verification email sent</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Their email address was updated. We sent a message to{" "}
                <span className="font-semibold text-foreground">{email}</span> with
                a link to verify the new address. They must complete that step
                before they can sign in with the updated email.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
