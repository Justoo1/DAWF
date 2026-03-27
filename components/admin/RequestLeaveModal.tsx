"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Info, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type EmployeeOption = {
  value: string
  label: string
}

const employees: EmployeeOption[] = [
  { value: "", label: "Select employee" },
  { value: "sarah", label: "Sarah Jenkins" },
  { value: "marcus", label: "Marcus Thorne" },
  { value: "elena", label: "Elena Rodriguez" },
]

export default function RequestLeaveModal() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const [employee, setEmployee] = useState("sarah")
  const [leaveType, setLeaveType] = useState<"annual" | "sick" | "casual">("annual")
  const [days, setDays] = useState<number>(3)

  const selectedEmployeeLabel = useMemo(() => {
    return employees.find((e) => e.value === employee)?.label || "Employee"
  }, [employee])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-[42px] px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Request
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-[540px] bg-white dark:bg-zinc-950 rounded-lg shadow-2xl overflow-hidden border border-primary/10 animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-primary/5 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Request Leave
                </h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">
                  Create a new leave application for an employee
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-8 py-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Employee Selection
                </label>
                <div className="relative">
                  <select
                    value={employee}
                    onChange={(e) => setEmployee(e.target.value)}
                    className="w-full appearance-none rounded-lg border-2 border-primary/10 bg-slate-50 dark:bg-zinc-900 py-3 px-4 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-0 transition-all cursor-pointer font-medium"
                  >
                    {employees.map((emp) => (
                      <option key={emp.value} disabled={emp.value === ""} value={emp.value}>
                        {emp.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary">
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary">
                  <Info className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Available Leave Balance
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-200">
                  <div className="flex flex-col items-center flex-1 border-r border-primary/10">
                    <span className="text-primary text-lg">18</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">
                      Annual
                    </span>
                  </div>
                  <div className="flex flex-col items-center flex-1 border-r border-primary/10">
                    <span className="text-primary text-lg">12</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">
                      Sick
                    </span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-primary text-lg">5</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">
                      Casual
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Leave Type
                  </label>
                  <div className="relative">
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as "annual" | "sick" | "casual")}
                      className="w-full appearance-none rounded-lg border-2 border-primary/10 bg-slate-50 dark:bg-zinc-900 py-3 px-4 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-0 transition-all font-medium"
                    >
                      <option value="annual">Annual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="casual">Casual Leave</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary">
                      <ChevronDown className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Number of Days
                  </label>
                  <input
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full rounded-lg border-2 border-primary/10 bg-slate-50 dark:bg-zinc-900 py-3 px-4 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-0 transition-all font-medium"
                    type="number"
                    min={1}
                  />
                </div>
              </div>

            </div>

            <div className="px-8 py-6 bg-slate-50 dark:bg-zinc-950/40 border-t border-primary/5 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-6 py-3 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  toast({
                    title: "Request submitted",
                    description: `${selectedEmployeeLabel} • ${leaveType.toUpperCase()} • ${days} day(s)`,
                  })
                }}
                className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
