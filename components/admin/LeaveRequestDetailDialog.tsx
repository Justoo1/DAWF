"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { AlertCircle, ShieldCheck, Mail, Building2, CalendarRange, FileText } from "lucide-react"

export type AdminLeaveRequestRow = {
  id: string
  startDate: Date | string
  endDate: Date | string
  days: number
  status: string
  reason: string | null
  createdAt: Date | string
  isUnmanaged: boolean
  managerName: string
  /** Approver user when leave was approved or declined */
  manager?: { name: string | null } | null
  user: {
    name: string
    email: string
    department: string | null
  }
  policy: {
    name: string
  }
}

function asDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value)
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800"
    case "APPROVED":
      return "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800"
    case "REJECTED":
      return "bg-red-100 text-red-900 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800"
    case "CANCELLED":
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300"
  }
}

export function LeaveRequestDetailDialog({
  request,
  onOpenChange,
}: {
  request: AdminLeaveRequestRow | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={!!request} onOpenChange={onOpenChange}>
      {request ? (
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <LeaveRequestDetailBody request={request} />
      </DialogContent>
      ) : null}
    </Dialog>
  )
}

function LeaveRequestDetailBody({ request }: { request: AdminLeaveRequestRow }) {
  const start = asDate(request.startDate)
  const end = asDate(request.endDate)
  const created = asDate(request.createdAt)

  return (
    <>
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-zinc-100 pr-8">
            Leave request
          </DialogTitle>
          <DialogDescription className="text-base font-semibold text-slate-700 dark:text-zinc-300">
            {request.user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={`rounded-lg font-bold uppercase text-[10px] tracking-wider ${statusBadgeClass(request.status)}`}
            >
              {request.status}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-lg border-slate-200 bg-slate-50 text-slate-700 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 font-bold text-[10px]"
            >
              {request.policy.name}
            </Badge>
          </div>

          <dl className="grid gap-3 text-sm">
            <div className="flex gap-3">
              <Mail className="h-4 w-4 shrink-0 text-slate-400 dark:text-zinc-500 mt-0.5" aria-hidden />
              <div>
                <dt className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Email
                </dt>
                <dd className="font-medium text-slate-800 dark:text-zinc-200 break-all">{request.user.email}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Building2 className="h-4 w-4 shrink-0 text-slate-400 dark:text-zinc-500 mt-0.5" aria-hidden />
              <div>
                <dt className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Department
                </dt>
                <dd className="font-medium text-slate-800 dark:text-zinc-200">
                  {request.user.department || "—"}
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <CalendarRange className="h-4 w-4 shrink-0 text-slate-400 dark:text-zinc-500 mt-0.5" aria-hidden />
              <div>
                <dt className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Schedule
                </dt>
                <dd className="font-medium text-slate-800 dark:text-zinc-200">
                  {format(start, "MMM d, yyyy")} → {format(end, "MMM d, yyyy")}
                </dd>
                <dd className="text-slate-500 dark:text-zinc-400 mt-0.5">
                  {request.days} working day{request.days === 1 ? "" : "s"}
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <FileText className="h-4 w-4 shrink-0 text-slate-400 dark:text-zinc-500 mt-0.5" aria-hidden />
              <div>
                <dt className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Submitted
                </dt>
                <dd className="font-medium text-slate-800 dark:text-zinc-200">{format(created, "PPpp")}</dd>
              </div>
            </div>
          </dl>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
              Reason
            </p>
            <p className="text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-wrap">
              {request.reason?.trim() ? request.reason : "No reason provided."}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 p-4 dark:border-zinc-800">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
              Approval routing
            </p>
            {request.isUnmanaged ? (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-tight italic">
                    Admin required
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                    No department manager assigned for this employee&apos;s department.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-[#10A074] dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="text-xs font-black text-[#10A074] dark:text-emerald-400 uppercase tracking-tight">
                    Department manager
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">{request.managerName}</p>
                </div>
              </div>
            )}
          </div>

          {(request.status === "APPROVED" || request.status === "REJECTED") && (
            <div className="rounded-xl border border-slate-100 p-4 dark:border-zinc-800">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
                {request.status === "APPROVED" ? "Approved by" : "Declined by"}
              </p>
              <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                {request.manager?.name?.trim() || "—"}
              </p>
            </div>
          )}

          <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-600">ID: {request.id}</p>
        </div>
    </>
  )
}
