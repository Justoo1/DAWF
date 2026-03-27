"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { MoreHorizontal, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { deleteUser } from "@/lib/actions/users.action"
import { useRouter } from "next/navigation"

type Employee = {
  id: string
  name: string | null
  email: string
  department: string | null
  isActive?: boolean | null
}

export default function EmployeeLeaveActions({ employee }: { employee: Employee }) {
  const router = useRouter()
  const { toast } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [modifyOpen, setModifyOpen] = useState(false)

  const [annualLeave, setAnnualLeave] = useState<number>(21)
  const [sickLeave, setSickLeave] = useState<number>(10)
  const [casualLeave, setCasualLeave] = useState<number>(7)

  const rootRef = useRef<HTMLDivElement | null>(null)

  const initials = useMemo(() => {
    const label = (employee.name || employee.email || "?").trim()
    return label
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("")
  }, [employee.email, employee.name])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  const openModify = () => {
    setMenuOpen(false)
    setModifyOpen(true)
  }

  const handleRemove = async () => {
    setMenuOpen(false)
    const ok = window.confirm(`Remove ${employee.name || employee.email}? This cannot be undone.`)
    if (!ok) return

    const result = await deleteUser(employee.id)
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to remove employee",
      })
      return
    }

    toast({
      title: "Employee removed",
      description: `${employee.name || employee.email} was removed successfully.`,
    })
    router.refresh()
  }

  return (
    <div className="relative inline-block text-left" ref={rootRef}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="p-2 hover:bg-primary/10 rounded-full transition-colors text-slate-400 group-hover:text-primary"
        aria-label="Employee actions"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-primary/10 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden z-50">
          <button
            onClick={openModify}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-primary/5"
          >
            Modify Leave
          </button>
          <button
            onClick={handleRemove}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            Remove Employee
          </button>
        </div>
      )}

      {modifyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-xl shadow-2xl border border-primary/10 overflow-hidden transform scale-100">
            <div className="p-6 border-b border-primary/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Modify Employee Leave Balance
              </h2>
              <button
                onClick={() => setModifyOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="h-14 w-14 rounded-full border-2 border-primary/20 overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    {employee.name || "Unnamed"}
                  </p>
                  <p className="text-xs text-primary font-bold uppercase tracking-wider">
                    {employee.department || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                    Annual Leave (Days)
                  </label>
                  <div className="relative group">
                    <input
                      className="w-full pl-4 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950/40 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-semibold"
                      type="number"
                      value={annualLeave}
                      onChange={(e) => setAnnualLeave(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                    Sick Leave (Days)
                  </label>
                  <div className="relative group">
                    <input
                      className="w-full pl-4 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950/40 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-semibold"
                      type="number"
                      value={sickLeave}
                      onChange={(e) => setSickLeave(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                    Casual Leave (Days)
                  </label>
                  <div className="relative group">
                    <input
                      className="w-full pl-4 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950/40 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-semibold"
                      type="number"
                      value={casualLeave}
                      onChange={(e) => setCasualLeave(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-zinc-950/40 border-t border-primary/10 flex gap-3 justify-end">
              <button
                onClick={() => setModifyOpen(false)}
                className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-zinc-900 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setModifyOpen(false)
                  toast({
                    title: "Balance updated",
                    description: `Annual: ${annualLeave}, Sick: ${sickLeave}, Casual: ${casualLeave}`,
                  })
                }}
                className="px-6 py-2.5 rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all text-sm"
              >
                Update Balance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
