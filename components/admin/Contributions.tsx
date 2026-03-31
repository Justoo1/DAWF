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
  adminTableClassName,
  adminTbodyRowClass,
  adminTdClass,
  adminThClass,
  adminTheadRowClass,
} from '@/lib/admin-ui'
import { cn } from '@/lib/utils'
import { UserAvatarHover } from './UserAvatarHover'

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
    const { toast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()

  const filteredRecords = contributions.filter(record =>{
      const monthName = record.month.toLocaleString('default', { month: 'long' }).toLowerCase();
      const monthNumber = (record.month.getMonth() + 1).toString();
      return (
            record.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            monthName.includes(searchTerm.toLowerCase()) || 
            monthNumber.includes(searchTerm.toLowerCase())
      )
  })

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
      <AdminToolbar>
        <AdminSearchField
          placeholder="Search by employee name, status, or month..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
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
              <th className={adminThClass}>Employee</th>
              <th className={adminThClass}>Amount</th>
              <th className={adminThClass}>Date</th>
              <th className={adminThClass}>Status</th>
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
                      <UserAvatarHover user={record.user as any} initials={initials} />
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
                      <PopoverContent align="end" className="w-[300px] sm:w-[26rem] p-4 rounded-2xl shadow-lg border-slate-100 bg-white">
                        <div className="flex flex-col gap-2">
                          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2">
                            Edit Contribution
                          </div>
                          
                          <div className="flex w-full px-2 pb-4">
                             <ContributionForm employees={[{ id: record.user.id!, name: record.user.name }]} contribution={record} update />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 h-9 rounded-lg px-2"
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

export default Contributions