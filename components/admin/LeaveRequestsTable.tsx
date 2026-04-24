"use client"

import React, { useState, useMemo } from "react"
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
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

interface LeaveRequestsTableProps {
  initialRequests: AdminLeaveRequestRow[]
  currentTab: string
}

export default function LeaveRequestsTable({ initialRequests, currentTab }: LeaveRequestsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'createdAt', direction: 'desc' })
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<AdminLeaveRequestRow | null>(null)

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ChevronDown className="ml-1 h-3 w-3 opacity-30" />
    return sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-3 w-3 text-[#10b981]" /> : <ChevronDown className="ml-1 h-3 w-3 text-[#10b981]" />
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const filteredAndSortedRequests = useMemo(() => {
    let result = [...initialRequests]

    // 1. Tab Filter
    if (currentTab === "pending") {
      result = result.filter(r => r.status === "PENDING")
    } else if (currentTab === "history") {
      result = result.filter(r => r.status === "APPROVED" || r.status === "REJECTED")
    }

    // 2. Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(r => 
        r.user.name.toLowerCase().includes(query) || 
        r.policy.name.toLowerCase().includes(query) ||
        (r.user.department?.toLowerCase().includes(query))
      )
    }

    // 3. Type Filter
    if (typeFilter !== "all") {
      result = result.filter(r => r.policy.name === typeFilter)
    }

    // 4. Sorting
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number = 0
        let bValue: string | number = 0

        switch (sortConfig.key) {
          case "name":
            aValue = a.user.name
            bValue = b.user.name
            break
          case "type":
            aValue = a.policy.name
            bValue = b.policy.name
            break
          case "duration":
            aValue = a.days
            bValue = b.days
            break
          case "date":
            aValue = new Date(a.startDate).getTime()
            bValue = new Date(b.startDate).getTime()
            break
          case "createdAt":
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
            break
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return result
  }, [initialRequests, currentTab, searchQuery, sortConfig, typeFilter])

  const uniqueTypes = Array.from(new Set(initialRequests.map(r => r.policy.name)))

  return (
    <div className="space-y-6">
      <LeaveRequestDetailDialog
        request={selectedRequest}
        onOpenChange={(open) => {
          if (!open) setSelectedRequest(null)
        }}
      />
      {/* Toolbar */}
      <div
        className={cn(
          adminToolbarClass,
          "rounded-3xl p-6 px-8 shadow-premium dark:shadow-black/30 flex flex-col md:flex-row items-center justify-between gap-4"
        )}
      >
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          <Input
            placeholder="Search by name, department or leave type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-12 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-transparent dark:border-zinc-800 ring-offset-0 focus-visible:ring-1 focus-visible:ring-[#10b981] dark:focus-visible:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-[14px] text-slate-900 dark:text-zinc-100"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-12 w-full md:w-[200px] rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-transparent dark:border-zinc-800 ring-offset-0 focus:ring-1 focus:ring-[#10b981] dark:focus:ring-emerald-500 text-slate-900 dark:text-zinc-100">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <SelectValue placeholder="All Types" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 dark:border-zinc-800 dark:bg-zinc-950">
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchQuery || typeFilter !== "all") && (
            <Button 
                variant="ghost" 
                onClick={() => { setSearchQuery(""); setTypeFilter("all"); }}
                className="text-slate-400 dark:text-zinc-500 hover:text-[#10b981] dark:hover:text-emerald-400 font-bold text-xs uppercase tracking-widest"
            >
                Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div
        className={cn(
          adminTableShellClass,
          "rounded-[32px] shadow-premium dark:shadow-black/30 overflow-hidden"
        )}
      >
        <div className="overflow-x-auto">
          <table className={adminTableClassName()}>
            <thead>
              <tr className={cn(adminTheadRowClass, "bg-slate-50/80 dark:bg-zinc-900/60")}>
                <th 
                  className={cn(adminThClass, "px-8 py-5 cursor-pointer group")}
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">Employee <SortIcon columnKey="name" /></div>
                </th>
                <th 
                  className={cn(adminThClass, "px-6 py-5 cursor-pointer group")}
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">Leave Type <SortIcon columnKey="type" /></div>
                </th>
                <th 
                  className={cn(adminThClass, "px-6 py-5 cursor-pointer group")}
                  onClick={() => handleSort('duration')}
                >
                  <div className="flex items-center">Duration <SortIcon columnKey="duration" /></div>
                </th>
                <th 
                  className={cn(adminThClass, "px-6 py-5 cursor-pointer group")}
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">Schedule <SortIcon columnKey="date" /></div>
                </th>
                <th className={cn(adminThClass, "px-6 py-5")}>
                  Approval Routing
                </th>
                <th className={cn(adminThClass, "px-8 py-5 text-right")}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/80">
              {filteredAndSortedRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-50 dark:opacity-60">
                      <Clock className="h-12 w-12 text-slate-300 dark:text-zinc-600" />
                      <p className="text-slate-500 dark:text-zinc-400 font-medium">No leave requests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedRequests.map((request) => (
                  <tr
                    key={request.id}
                    role="button"
                    tabIndex={0}
                    title="View request details"
                    className={cn(
                      adminTbodyRowClass,
                      "group duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
                    )}
                    onClick={() => setSelectedRequest(request)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedRequest(request)
                      }
                    }}
                  >
                    <td className={cn(adminTdClass, "px-8 py-4")}>
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-2xl bg-[#10b981]/10 dark:bg-emerald-500/15 flex items-center justify-center text-[#10b981] dark:text-emerald-400 font-black text-xs">
                          {request.user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate">{request.user.name}</span>
                          <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{request.user.department || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className={cn(adminTdClass, "px-6 py-4")}>
                      <Badge
                        variant="outline"
                        className="rounded-xl border-slate-200 bg-slate-50 text-slate-700 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 font-bold text-[10px] px-3 py-1"
                      >
                        {request.policy.name}
                      </Badge>
                    </td>
                    <td className={cn(adminTdClass, "px-6 py-4 text-sm font-bold text-slate-700 dark:text-zinc-200")}>
                      {request.days} Days
                    </td>
                    <td className={cn(adminTdClass, "px-6 py-4")}>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-zinc-200">{format(new Date(request.startDate), 'MMM dd, yyyy')}</span>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">to {format(new Date(request.endDate), 'MMM dd, yyyy')}</span>
                      </div>
                    </td>
                    <td className={cn(adminTdClass, "px-6 py-4")}>
                      {request.isUnmanaged ? (
                        <div className="flex items-center gap-2 group/tip relative">
                          <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400/90 uppercase tracking-tighter italic">ADMIN REQUIRED</span>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium leading-none">No Dept Manager assigned</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-[#10b981] dark:text-emerald-400" />
                          <div className="flex flex-col">
                             <span className="text-[11px] font-black text-[#10b981] dark:text-emerald-400 uppercase tracking-tighter">DEPT MANAGER</span>
                             <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium leading-none">{request.managerName}</span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td
                      className={cn(adminTdClass, "px-8 py-4 text-right")}
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
