"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2 } from "lucide-react"

export type EmployeeSaveSummary = {
  fullName: string
  email: string
  phoneNumber: string
  role: string
  clientName: string
  department: string
  isActive: boolean
  isContributor: boolean
  startDate: string
  dateOfBirth: string
}

function formatRole(role: string) {
  return role
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ")
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium leading-snug text-foreground break-all sm:text-right">
        {value}
      </span>
    </div>
  )
}

type EmployeeSaveSuccessDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: "add" | "edit"
  summary: EmployeeSaveSummary | null
}

export function EmployeeSaveSuccessDialog({
  open,
  onOpenChange,
  variant,
  summary,
}: EmployeeSaveSuccessDialogProps) {
  if (!summary) return null

  const title = variant === "add" ? "Employee added" : "Employee updated"
  const subtitle =
    variant === "add"
      ? "They can sign in with Google using the work email you entered (after an admin has added them, they use the same email in Google)."
      : "Here is a quick recap of what we saved."

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[440px]">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-5 text-white shadow-inner">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-9 w-9 shrink-0 opacity-95" />
              <div className="space-y-1">
                <DialogTitle className="text-xl font-semibold tracking-tight text-white">
                  {title}
                </DialogTitle>
                <p className="text-sm leading-snug text-white/90">{subtitle}</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="max-h-[min(52vh,380px)] space-y-2 overflow-y-auto px-6 py-4">
          <SummaryRow label="Name" value={summary.fullName} />
          <SummaryRow label="Email" value={summary.email} />
          <SummaryRow label="Phone" value={summary.phoneNumber || "—"} />
          <SummaryRow label="Role" value={formatRole(summary.role)} />
          <SummaryRow label="Client" value={summary.clientName} />
          <SummaryRow
            label="Department"
            value={summary.department === "none" ? "None" : summary.department}
          />
          <SummaryRow
            label="Status"
            value={
              summary.isActive
                ? "Active"
                : "Inactive"
            }
          />
          <SummaryRow
            label="Welfare contributor"
            value={summary.isContributor ? "Yes" : "No"}
          />
          <SummaryRow label="Date of birth" value={summary.dateOfBirth} />
          <SummaryRow label="Employment start" value={summary.startDate} />
        </div>

        <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
