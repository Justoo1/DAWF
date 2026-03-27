import {
  BadgeCheck,
  Bell,
  Building2,
  CreditCard,
  Megaphone,
  MoreHorizontal,
  Search,
  Terminal,
} from "lucide-react"
import CreateDepartmentModal from "@/components/admin/CreateDepartmentModal"

const mockDepartments = [
  {
    id: "engineering",
    name: "Engineering",
    icon: Terminal,
    manager: "Alex Rivers",
    employees: 124,
    status: "Active",
    tone: "primary" as const,
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: Megaphone,
    manager: "Sarah Jenkins",
    employees: 42,
    status: "Active",
    tone: "primary" as const,
  },
  {
    id: "hr",
    name: "Human Resources",
    icon: BadgeCheck,
    manager: "Michael Chen",
    employees: 18,
    status: "Active",
    tone: "primary" as const,
  },
  {
    id: "finance",
    name: "Finance & Accounts",
    icon: CreditCard,
    manager: "Elena Rodriguez",
    employees: 31,
    status: "Active",
    tone: "primary" as const,
  },
]

export default function LeaveDepartmentsPage() {
  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-zinc-100 dark:bg-zinc-950 p-8 lg:p-12">
      <div className="max-w-7xl mx-auto w-full">
        <header className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Departments</h2>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  className="pl-10 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-primary/10 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Search departments..."
                  type="text"
                />
              </div>

              <CreateDepartmentModal />

              <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-slate-800" />

              <button
                type="button"
                className="h-10 w-10 rounded-full bg-white dark:bg-zinc-900 border border-primary/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
              <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        <div className="mt-8 mb-6 flex flex-col gap-1">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Organizational Units
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Overview and management of all active company departments
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-primary/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/40 border-b border-primary/10">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Department Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Manager
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Employees
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {mockDepartments.map((dept) => {
                  const Icon = dept.icon
                  return (
                    <tr
                      key={dept.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {dept.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full border border-primary/10 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                            {dept.manager
                              .split(" ")
                              .slice(0, 2)
                              .map((p) => p[0])
                              .join("")}
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            {dept.manager}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">{dept.employees}</span>
                          <div className="flex -space-x-2">
                            <div className="h-5 w-5 rounded-full border border-white dark:border-zinc-900 bg-slate-200 dark:bg-slate-800" />
                            <div className="h-5 w-5 rounded-full border border-white dark:border-zinc-900 bg-slate-200 dark:bg-slate-800" />
                            <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold border border-white dark:border-zinc-900">
                              +{Math.max(0, dept.employees - 2)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                          {dept.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          aria-label="Department actions"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-primary/10 flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing {mockDepartments.length} departments</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-1 border border-primary/10 rounded text-sm text-slate-600 dark:text-slate-400 hover:bg-zinc-50 dark:hover:bg-zinc-950/30 disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button
                type="button"
                className="px-3 py-1 border border-primary/10 rounded text-sm text-slate-600 dark:text-slate-400 hover:bg-zinc-50 dark:hover:bg-zinc-950/30"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest">Total Depts</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">12</h4>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-primary/10 rounded-xl p-6 flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-950/40 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Total Employees
              </p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">452</h4>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-primary/10 rounded-xl p-6 flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-950/40 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Active Managers
              </p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">12</h4>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
