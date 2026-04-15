"use client"

import React, { useMemo, useState } from "react"
import {
  Search,
  Filter,
  ListFilter,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  Inbox,
  PlaneTakeoff,
  PlaneLanding,
  type LucideIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  format,
  startOfDay,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns"
import LeaveRequestActions from "./LeaveRequestActions"
import {
  LeaveRequestDetailDialog,
  type AdminLeaveRequestRow,
} from "./LeaveRequestDetailDialog"
import { cn } from "@/lib/utils"
import {
  adminTableShellClass,
  adminToolbarClass,
  adminTheadRowClass,
  adminThClass,
  adminTdClass,
  adminTbodyRowClass,
  adminTableClassName,
} from "@/lib/admin-ui"

type StatusFilter = "all" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"

type LeaveInsightFilter = "on-leave" | "pending" | "going-week" | "returning-week"

function computeInsightStats(requests: AdminLeaveRequestRow[]) {
  const today = startOfDay(new Date())
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  const onLeaveEmails = new Set<string>()
  let pending = 0
  let goingWeek = 0
  let returningWeek = 0

  for (const r of requests) {
    if (r.status === "PENDING") pending++

    if (r.status === "APPROVED") {
      const s = startOfDay(new Date(r.startDate))
      const e = startOfDay(new Date(r.endDate))
      if (s.getTime() <= today.getTime() && today.getTime() <= e.getTime()) {
        onLeaveEmails.add(r.user.email)
      }
    }

    if (
      isWithinInterval(new Date(r.startDate), { start: weekStart, end: weekEnd })
    ) {
      goingWeek++
    }

    if (
      r.status === "APPROVED" &&
      isWithinInterval(new Date(r.endDate), { start: weekStart, end: weekEnd })
    ) {
      returningWeek++
    }
  }

  return {
    onLeave: onLeaveEmails.size,
    pending,
    goingWeek,
    returningWeek,
  }
}

function rowMatchesInsight(
  r: AdminLeaveRequestRow,
  insight: LeaveInsightFilter,
  now: Date
): boolean {
  const today = startOfDay(now)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  switch (insight) {
    case "on-leave": {
      if (r.status !== "APPROVED") return false
      const s = startOfDay(new Date(r.startDate))
      const e = startOfDay(new Date(r.endDate))
      return s.getTime() <= today.getTime() && today.getTime() <= e.getTime()
    }
    case "pending":
      return r.status === "PENDING"
    case "going-week":
      return isWithinInterval(new Date(r.startDate), {
        start: weekStart,
        end: weekEnd,
      })
    case "returning-week":
      return (
        r.status === "APPROVED" &&
        isWithinInterval(new Date(r.endDate), { start: weekStart, end: weekEnd })
      )
    default:
      return true
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
    case "APPROVED":
      return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
    case "CANCELLED":
      return "border-slate-200 bg-slate-100 text-slate-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
    default:
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
  }
}

function statusLabel(status: string) {
  return status === "REJECTED" ? "DECLINED" : status
}

export default function AdminAllLeavesTable({
  initialRequests,
}: {
  initialRequests: AdminLeaveRequestRow[]
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [insightFilter, setInsightFilter] = useState<LeaveInsightFilter | null>(null)
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "asc" | "desc"
  } | null>({ key: "createdAt", direction: "desc" })
  const [selectedRequest, setSelectedRequest] = useState<AdminLeaveRequestRow | null>(null)

  const uniqueTypes = useMemo(
    () => Array.from(new Set(initialRequests.map((r) => r.policy.name))),
    [initialRequests]
  )

  const counts = useMemo(() => {
    const c = { all: 0, PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 }
    for (const r of initialRequests) {
      c.all++
      if (r.status === "PENDING") c.PENDING++
      else if (r.status === "APPROVED") c.APPROVED++
      else if (r.status === "REJECTED") c.REJECTED++
      else if (r.status === "CANCELLED") c.CANCELLED++
    }
    return c
  }, [initialRequests])

  const insightStats = useMemo(
    () => computeInsightStats(initialRequests),
    [initialRequests]
  )

  const toggleInsight = (key: LeaveInsightFilter) => {
    setInsightFilter((prev) => (prev === key ? null : key))
    setStatusFilter("all")
  }

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey)
      return <ChevronDown className="ml-1 h-3 w-3 opacity-30" />
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-1 h-3 w-3 text-[#10A074]" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3 text-[#10A074]" />
    )
  }

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const filteredAndSorted = useMemo(() => {
    const now = new Date()
    let result = [...initialRequests]

    if (insightFilter) {
      result = result.filter((r) => rowMatchesInsight(r, insightFilter, now))
    }

    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.user.name.toLowerCase().includes(q) ||
          r.policy.name.toLowerCase().includes(q) ||
          (r.user.department?.toLowerCase().includes(q) ?? false) ||
          (r.user.email?.toLowerCase().includes(q) ?? false)
      )
    }

    if (typeFilter !== "all") {
      result = result.filter((r) => r.policy.name === typeFilter)
    }

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number = 0
        let bValue: string | number = 0
        switch (sortConfig.key) {
          case "name":
            aValue = a.user.name
            bValue = b.user.name
            break
          case "department":
            aValue = a.user.department || ""
            bValue = b.user.department || ""
            break
          case "type":
            aValue = a.policy.name
            bValue = b.policy.name
            break
          case "start":
            aValue = new Date(a.startDate).getTime()
            bValue = new Date(b.startDate).getTime()
            break
          case "days":
            aValue = a.days
            bValue = b.days
            break
          case "status":
            aValue = a.status
            bValue = b.status
            break
          case "createdAt":
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
            break
          default:
            return 0
        }
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return result
  }, [
    initialRequests,
    insightFilter,
    statusFilter,
    searchQuery,
    typeFilter,
    sortConfig,
  ])

  const insightCards: {
    key: LeaveInsightFilter
    title: string
    value: number
    icon: LucideIcon
    hint: string
  }[] = [
    {
      key: "on-leave",
      title: "Employee on leave",
      value: insightStats.onLeave,
      icon: Users,
      hint: "Approved leave active today (distinct employees). Click or use the filter icon to show matching rows.",
    },
    {
      key: "pending",
      title: "Pending actions",
      value: insightStats.pending,
      icon: Inbox,
      hint: "Requests awaiting a decision. Click or use the filter icon to show pending rows.",
    },
    {
      key: "going-week",
      title: "Going this week",
      value: insightStats.goingWeek,
      icon: PlaneTakeoff,
      hint: "Leave that starts during the current week (Mon–Sun). Click or use the filter icon to filter the table.",
    },
    {
      key: "returning-week",
      title: "Returning this week",
      value: insightStats.returningWeek,
      icon: PlaneLanding,
      hint: "Approved leave ending during the current week. Click or use the filter icon to filter the table.",
    },
  ]

  return (
    <div className="space-y-6">
      <LeaveRequestDetailDialog
        request={selectedRequest}
        onOpenChange={(open) => {
          if (!open) setSelectedRequest(null)
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full">
        {insightCards.map(({ key, title, value, icon: Icon, hint }) => {
          const active = insightFilter === key
          return (
            <div
              key={key}
              className={cn(
                "flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm transition-colors dark:bg-zinc-950",
                active
                  ? "border-[#10A074] ring-2 ring-[#10A074]/25 dark:border-emerald-500/50"
                  : "border-slate-100 dark:border-slate-800"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-[800] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {title}
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    title={hint}
                    aria-label={`Filter table: ${title}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleInsight(key)
                    }}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border text-slate-500 transition-colors dark:text-slate-400",
                      active
                        ? "border-[#10A074] bg-emerald-50 text-[#10A074] dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "border-slate-200 bg-slate-50 hover:border-[#10A074]/50 hover:text-[#10A074] dark:border-slate-700 dark:bg-slate-800/90 dark:hover:border-emerald-500/40"
                    )}
                  >
                    <ListFilter className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                  </button>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 dark:bg-slate-800/90 dark:text-slate-300">
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleInsight(key)}
                aria-pressed={active}
                className="flex flex-col gap-1 rounded-lg text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#10A074] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
              >
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl tabular-nums">
                  {value}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  {active ? "Table filtered · click to clear" : "Click to filter table"}
                </span>
              </button>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All", counts.all],
            ["PENDING", "Pending", counts.PENDING],
            ["APPROVED", "Approved", counts.APPROVED],
            ["REJECTED", "Declined", counts.REJECTED],
            ["CANCELLED", "Cancelled", counts.CANCELLED],
          ] as const
        ).map(([key, label, n]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setInsightFilter(null)
              setStatusFilter(key)
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors",
              statusFilter === key
                ? "border-[#10A074] bg-emerald-50 text-[#10A074] dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
            )}
          >
            {label}{" "}
            <span className="tabular-nums opacity-80">({n})</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div
        className={cn(
          adminToolbarClass,
          "flex flex-col gap-4 rounded-3xl p-6 px-8 shadow-premium dark:shadow-black/30 md:flex-row md:items-center md:justify-between"
        )}
      >
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <Input
            placeholder="Search by name, email, department, or leave type…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-2xl border border-transparent bg-slate-50 pl-12 text-[14px] text-slate-900 ring-offset-0 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#10A074] dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-emerald-500"
          />
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="h-12 w-full min-w-[200px] rounded-2xl border border-transparent bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/80 md:w-[220px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <SelectValue placeholder="Leave type" />
              </div>
            </SelectTrigger>
            <SelectContent className="dark:border-zinc-800 dark:bg-zinc-950">
              <SelectItem value="all">All leave types</SelectItem>
              {uniqueTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(searchQuery ||
            typeFilter !== "all" ||
            statusFilter !== "all" ||
            insightFilter !== null) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setTypeFilter("all")
                setStatusFilter("all")
                setInsightFilter(null)
              }}
              className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-[#10A074] dark:text-zinc-500 dark:hover:text-emerald-400"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className={cn(
          adminTableShellClass,
          "overflow-hidden rounded-[32px] shadow-premium dark:shadow-black/30"
        )}
      >
        <div className="overflow-x-auto">
          <table className={adminTableClassName()}>
            <thead>
              <tr className={cn(adminTheadRowClass, "bg-slate-50/80 dark:bg-zinc-900/60")}>
                <th
                  className={cn(adminThClass, "cursor-pointer px-6 py-5")}
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Employee <SortIcon columnKey="name" />
                  </div>
                </th>
                <th
                  className={cn(adminThClass, "hidden cursor-pointer px-4 py-5 lg:table-cell")}
                  onClick={() => handleSort("department")}
                >
                  <div className="flex items-center">
                    Department <SortIcon columnKey="department" />
                  </div>
                </th>
                <th
                  className={cn(adminThClass, "cursor-pointer px-4 py-5")}
                  onClick={() => handleSort("type")}
                >
                  <div className="flex items-center">
                    Leave type <SortIcon columnKey="type" />
                  </div>
                </th>
                <th
                  className={cn(adminThClass, "cursor-pointer px-4 py-5")}
                  onClick={() => handleSort("start")}
                >
                  <div className="flex items-center">
                    Schedule <SortIcon columnKey="start" />
                  </div>
                </th>
                <th
                  className={cn(adminThClass, "cursor-pointer px-4 py-5")}
                  onClick={() => handleSort("days")}
                >
                  <div className="flex items-center">
                    Days <SortIcon columnKey="days" />
                  </div>
                </th>
                <th
                  className={cn(adminThClass, "cursor-pointer px-4 py-5")}
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status <SortIcon columnKey="status" />
                  </div>
                </th>
                <th className={cn(adminThClass, "px-4 py-5")}>Decided by</th>
                <th className={cn(adminThClass, "px-6 py-5 text-right")}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/80">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-60 dark:opacity-60">
                      <Clock className="h-12 w-12 text-slate-300 dark:text-zinc-600" />
                      <p className="font-medium text-slate-500 dark:text-zinc-400">
                        No leave records match your filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((request) => (
                  <tr
                    key={request.id}
                    role="button"
                    tabIndex={0}
                    title="View details"
                    className={cn(
                      adminTbodyRowClass,
                      "cursor-pointer duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10A074] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
                    )}
                    onClick={() => setSelectedRequest(request)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedRequest(request)
                      }
                    }}
                  >
                    <td className={cn(adminTdClass, "px-6 py-4")}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10A074]/10 text-xs font-black text-[#10A074] dark:bg-emerald-500/15 dark:text-emerald-400">
                          {request.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800 dark:text-zinc-100">
                            {request.user.name}
                          </p>
                          <p className="truncate text-[11px] text-slate-500 dark:text-zinc-500 lg:hidden">
                            {request.user.department || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      className={cn(
                        adminTdClass,
                        "hidden max-w-[140px] truncate px-4 py-4 lg:table-cell"
                      )}
                    >
                      {request.user.department || "—"}
                    </td>
                    <td className={cn(adminTdClass, "px-4 py-4")}>
                      <Badge
                        variant="outline"
                        className="rounded-xl border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-700 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200"
                      >
                        {request.policy.name}
                      </Badge>
                    </td>
                    <td className={cn(adminTdClass, "px-4 py-4")}>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-zinc-200">
                          {format(new Date(request.startDate), "MMM d, yyyy")}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-500">
                          to {format(new Date(request.endDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    </td>
                    <td className={cn(adminTdClass, "px-4 py-4 text-sm font-bold tabular-nums text-slate-700 dark:text-zinc-200")}>
                      {request.days}
                    </td>
                    <td className={cn(adminTdClass, "px-4 py-4")}>
                      <span
                        className={cn(
                          "inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                          statusBadge(request.status)
                        )}
                      >
                        {statusLabel(request.status)}
                      </span>
                    </td>
                    <td className={cn(adminTdClass, "max-w-[140px] truncate px-4 py-4 text-sm text-slate-700 dark:text-zinc-300")}>
                      {request.status === "PENDING"
                        ? "—"
                        : request.manager?.name?.trim() || "—"}
                    </td>
                    <td
                      className={cn(adminTdClass, "px-6 py-4 text-right")}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <LeaveRequestActions
                        requestId={request.id}
                        employeeName={request.user.name}
                        requestStatus={request.status as "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
