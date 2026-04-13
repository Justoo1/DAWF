"use client"

import { useToast } from '@/hooks/use-toast'
import { deleteContribution } from '@/lib/actions/contribution'
import { ContributionValues } from '@/lib/validation'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Trash2Icon, MoreHorizontal } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import ContributionForm from './ContributionForm'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminToolbar } from './layout/AdminToolbar'
import { AdminSearchField } from './layout/AdminSearchField'
import { AdminTableCard } from './layout/AdminTableCard'
import { AdminPaginationBar } from './layout/AdminPaginationBar'
import {
  adminFilterSelectTriggerClass,
  adminSelectContentSurfaceClass,
  adminTableClassName,
  adminTbodyRowClass,
  adminTdClass,
  adminThClass,
  adminTheadRowClass,
  adminThSortableClass,
  adminToolbarDividerClass,
  adminToolbarFilterRowClass,
} from '@/lib/admin-ui'
import { cn } from '@/lib/utils'
import { UserAvatarHover } from './UserAvatarHover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContributionsProps {
    contributions: ContributionValues[]
    pagination: {
      page: number
      pageSize: number
      totalCount: number
      totalPages: number
    }
}


const Contributions = ({contributions, pagination}: ContributionsProps) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortConfig, setSortConfig] = useState<{
      key: keyof ContributionValues | "user_name";
      direction: "asc" | "desc";
    }>({ key: "month", direction: "desc" });

    const { toast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()

  const filteredRecords = contributions
    .filter(record =>{
      const monthName = record.month.toLocaleString('default', { month: 'long' }).toLowerCase();
      const monthNumber = (record.month.getMonth() + 1).toString();
      const matchesSearch = 
            record.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            monthName.includes(searchTerm.toLowerCase()) || 
            monthNumber.includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" ? true : record.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      if (sortConfig.key === "user_name") {
        aValue = a.user.name.toLowerCase();
        bValue = b.user.name.toLowerCase();
      } else {
        aValue = a[sortConfig.key as keyof ContributionValues] ?? "";
        bValue = b[sortConfig.key as keyof ContributionValues] ?? "";
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const handleSort = (key: keyof ContributionValues | "user_name") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`?${params.toString()}`)
  }

  const handleDelete =  async (id: string | undefined) => {
    if (!id) return
    const deleted = await deleteContribution(id)
    if (deleted.success) {
      toast({
        title: 'Deleted',
        description: "Successfully deleted contribution",
      })
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: deleted.error,
      })
    }
  }

  return (
    <>
      <AdminToolbar className="shadow-premium dark:shadow-black/30">
        {/* Top half: Search */}
        <div className={cn("p-6 px-8 flex-1", adminToolbarDividerClass)}>
          <AdminSearchField
            placeholder="Search by employee name, status, or month..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        {/* Bottom half: Filters */}
        <div className={adminToolbarFilterRowClass}>
          <div className="w-full sm:w-44">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={adminFilterSelectTriggerClass}>
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent className={adminSelectContentSurfaceClass}>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(statusFilter !== "all" || searchTerm) && (
            <Button
              variant="ghost"
              className="text-xs text-slate-400 dark:text-zinc-500 hover:text-primary dark:hover:text-emerald-400 h-10 px-2"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </AdminToolbar>

      <AdminTableCard
        footer={
          <AdminPaginationBar
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            entityLabel="contributions"
            onPageChange={handlePageChange}
          />
        }
      >
        <table className={adminTableClassName()}>
          <thead>
            <tr className={adminTheadRowClass}>
              <th
                className={cn(adminThClass, adminThSortableClass)}
                onClick={() => handleSort("user_name")}
              >
                <div className="flex items-center gap-2">
                  Employee
                  <SortIcon field="user_name" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th
                className={cn(adminThClass, adminThSortableClass)}
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center gap-2">
                  Amount
                  <SortIcon field="amount" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th
                className={cn(adminThClass, adminThSortableClass)}
                onClick={() => handleSort("month")}
              >
                <div className="flex items-center gap-2">
                  Date
                  <SortIcon field="month" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th
                className={cn(adminThClass, adminThSortableClass)}
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon field="status" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th className={cn(adminThClass, "text-right")}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => {
              const initials = (record.user.name || "?")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((s) => s[0]?.toUpperCase())
                .join("");

              return (
                <tr key={record.id} className={adminTbodyRowClass}>
                  <td className={adminTdClass}>
                    <div className="flex items-center gap-4 relative">
                      <UserAvatarHover initials={initials} />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{record.user.name}</span>
                        <span className="text-[12px] text-slate-500">{record.user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className={adminTdClass}>
                    <span className="font-bold text-slate-700">GHS {record.amount}</span>
                  </td>
                  <td className={adminTdClass}>
                    <span className="text-slate-500">{formatDateTime(record.month).dateOnly}</span>
                  </td>
                  <td className={adminTdClass}>
                    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", 
                        record.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-800" : 
                        record.status === 'PENDING' ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"
                      )}>
                        {record.status}
                    </span>
                  </td>
                  <td className={cn(adminTdClass, "text-right")}>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-primary">
                          <MoreHorizontal className="h-5 w-5" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="w-[300px] rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-lg sm:w-[26rem]"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="mb-2 border-b border-border px-2 py-1.5 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Edit Contribution
                          </div>
                          
                          <div className="flex w-full px-2 pb-4">
                             <ContributionForm employees={[{ id: record.user.id!, name: record.user.name }]} contribution={record} update />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 w-full justify-start rounded-lg px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2Icon className="mr-2 h-4 w-4" />
                            Delete Contribution
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </AdminTableCard>
    </>
  )
}

function SortIcon({ field, activeField, direction }: { field: string, activeField: string, direction: "asc" | "desc" }) {
  if (field !== activeField) return <div className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5-5" /></svg></div>;
  return (
    <div className="w-4 h-4 text-primary">
      {direction === "asc" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11l5-5 5 5M12 19V6"/></svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13l5 5 5-5M12 5v13"/></svg>
      )}
    </div>
  );
}

export default Contributions