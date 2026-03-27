"use client"

import { useMemo, useState } from "react"
import { Search, Trash2, User, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Employee = {
  id: string
  name: string
  email: string
  title: string
}

const mockEmployees: Employee[] = [
  { id: "alex", name: "Alex Rivera", email: "alex.r@company.com", title: "Senior Engineer" },
  { id: "sarah", name: "Sarah Chen", email: "sarah.c@company.com", title: "Marketing Lead" },
  { id: "james", name: "James Wilson", email: "james.w@company.com", title: "Sales Rep" },
  { id: "michael", name: "Michael Chen", email: "michael.c@company.com", title: "HR Manager" },
  { id: "elena", name: "Elena Rodriguez", email: "elena.r@company.com", title: "Finance Manager" },
]

export default function CreateDepartmentModal() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const [departmentName, setDepartmentName] = useState("")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Employee[]>(mockEmployees.slice(0, 3))
  const [managerId, setManagerId] = useState<string>(mockEmployees[0]?.id ?? "")

  const selectedCount = selected.length

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return selected
    return selected.filter((emp) => {
      return (
        emp.name.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.title.toLowerCase().includes(query)
      )
    })
  }, [search, selected])

  const removeEmployee = (id: string) => {
    setSelected((prev) => {
      const next = prev.filter((emp) => emp.id !== id)
      if (managerId === id) setManagerId(next[0]?.id ?? "")
      return next
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
      >
        Create Department
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[600px] rounded-xl shadow-2xl flex flex-col max-h-[921px] overflow-hidden border border-primary/10">
            <div className="px-6 py-5 border-b border-primary/10 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-20">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Create New Department
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Department Name
                </label>
                <input
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-primary/20 bg-zinc-100/60 dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  placeholder="e.g. Creative Design"
                  type="text"
                />
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Assign Employees
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-primary/10 bg-zinc-100/60 dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                      placeholder="Find employees to add..."
                      type="text"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Selected ({selectedCount})
                  </p>

                  {filteredEmployees.map((emp, index) => {
                    const primary = index === 0
                    return (
                      <div
                        key={emp.id}
                        className={
                          primary
                            ? "flex items-center gap-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/10"
                            : "flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                        }
                      >
                        <div
                          className={
                            primary
                              ? "h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden text-primary"
                              : "h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400"
                          }
                        >
                          <User className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{emp.name}</p>
                          <p className="text-xs text-slate-500 truncate">{emp.email}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span
                            className={
                              primary
                                ? "text-xs font-medium text-primary"
                                : "text-xs font-medium text-slate-600 dark:text-slate-400"
                            }
                          >
                            {emp.title}
                          </span>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              checked={managerId === emp.id}
                              onChange={() => setManagerId(emp.id)}
                              className="w-4 h-4 rounded text-primary focus:ring-primary border-primary/30"
                              type="checkbox"
                            />
                            <span className="text-xs font-medium">Manager</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => removeEmployee(emp.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            aria-label={`Remove ${emp.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-primary/10 flex items-center justify-end gap-3 bg-zinc-100/40 dark:bg-slate-800/30">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 h-11 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  toast({
                    title: "Department created",
                    description: departmentName.trim()
                      ? `${departmentName} • ${selectedCount} employee(s)`
                      : `${selectedCount} employee(s)`,
                  })
                }}
                className="px-6 h-11 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-colors flex items-center gap-2"
              >
                Create Department
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
