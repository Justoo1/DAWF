"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { setClientActive } from "@/lib/actions/clients.actions"
import { EditClientDialog } from "./EditClientDialog"
import { AdminTableCard } from "@/components/admin/layout/AdminTableCard"
import {
  adminTableClassName,
  adminTdClass,
  adminThClass,
  adminTheadRowClass,
  adminTbodyRowClass,
} from "@/lib/admin-ui"
import { cn } from "@/lib/utils"
import { MoreHorizontal, Pencil, Power } from "lucide-react"
import type { AdminClientRow } from "./client-admin.types"

export type { AdminClientRow }

interface ClientsTableProps {
  clients: AdminClientRow[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [editing, setEditing] = useState<AdminClientRow | null>(null)

  const toggleActive = async (row: AdminClientRow, nextActive: boolean) => {
    const res = await setClientActive({ id: row.id, isActive: nextActive })
    if (res.success) {
      toast({
        title: nextActive ? "Client enabled" : "Client disabled",
        description: nextActive
          ? `${row.name} is active again and will appear when adding employees.`
          : `${row.name} is inactive and hidden from the add-employee client list.`,
      })
      router.refresh()
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: res.error,
      })
    }
  }

  if (clients.length === 0) {
    return (
      <AdminTableCard>
        <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No clients yet. Create one to assign employees.
        </p>
      </AdminTableCard>
    )
  }

  return (
    <>
      <EditClientDialog
        client={editing}
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      />
      <AdminTableCard>
        <table className={adminTableClassName()}>
          <thead>
            <tr className={adminTheadRowClass}>
              <th className={adminThClass}>Client</th>
              <th className={adminThClass}>Employees</th>
              <th className={adminThClass}>Status</th>
              <th className={cn(adminThClass, "text-right")}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr
                key={c.id}
                className={cn(
                  adminTbodyRowClass,
                  "group cursor-pointer hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                )}
                onClick={() => setEditing(c)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setEditing(c)
                  }
                }}
                tabIndex={0}
                aria-label={`Edit client ${c.name}`}
              >
                <td className={adminTdClass}>
                  <span className="font-semibold text-slate-900 dark:text-slate-50 underline-offset-2 group-hover:text-primary group-hover:underline dark:group-hover:text-emerald-400">
                    {c.name}
                  </span>
                </td>
                <td className={adminTdClass}>{c.employeeCount}</td>
                <td className={adminTdClass}>
                  <Badge
                    variant="outline"
                    className={
                      c.isActive
                        ? "border-emerald-300 text-emerald-800 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "border-slate-300 text-slate-600 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-300"
                    }
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td
                  className={cn(adminTdClass, "text-right")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-primary"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      className="w-[240px] p-2 rounded-2xl shadow-lg border-slate-100 bg-white dark:bg-zinc-950 dark:border-slate-800"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Actions
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full justify-start h-9 rounded-lg px-2 text-slate-700 dark:text-slate-200"
                          onClick={() => setEditing(c)}
                        >
                          <Pencil className="mr-2 h-4 w-4 shrink-0" />
                          Edit client
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full justify-start h-9 rounded-lg px-2 text-slate-700 dark:text-slate-200"
                          onClick={() =>
                            void toggleActive(c, !c.isActive)
                          }
                        >
                          <Power className="mr-2 h-4 w-4 shrink-0" />
                          {c.isActive ? "Disable client" : "Enable client"}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableCard>
    </>
  )
}
