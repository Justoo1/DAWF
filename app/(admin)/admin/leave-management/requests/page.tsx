import Link from "next/link"
import { ChevronRight, Filter, Search } from "lucide-react"
import LeaveRequestActions from "@/components/admin/LeaveRequestActions"
import LeaveRequestDateRangePicker from "@/components/admin/LeaveRequestDateRangePicker"
import RequestLeaveModal from "@/components/admin/RequestLeaveModal"

type TabKey = "pending" | "history" | "archived"

const tabs: { key: TabKey; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "history", label: "History" },
  { key: "archived", label: "Archived" },
]

const tabHref = (tab: TabKey) => `/admin/leave-management/requests?tab=${tab}`

const mockRequests = [
  {
    id: "1",
    employeeInitials: "SJ",
    employeeName: "Sarah Jenkins",
    employeeRole: "Product Designer",
    leaveType: "Annual Leave",
    leaveTypeTone: "blue" as const,
    durationLabel: "5 Days",
    start: "Oct 25, 2023",
    end: "Oct 30, 2023",
    note: "Requested for family vacation in Italy...",
  },
  {
    id: "2",
    employeeInitials: "MT",
    employeeName: "Marcus Thorne",
    employeeRole: "Backend Dev",
    leaveType: "Sick Leave",
    leaveTypeTone: "amber" as const,
    durationLabel: "2 Days",
    start: "Oct 14, 2023",
    end: "Oct 15, 2023",
    note: "Flu symptoms, resting as per doctor advice.",
  },
  {
    id: "3",
    employeeInitials: "EK",
    employeeName: "Elena Kostic",
    employeeRole: "Marketing Lead",
    leaveType: "Annual Leave",
    leaveTypeTone: "blue" as const,
    durationLabel: "1 Day",
    start: "Nov 02, 2023",
    end: "Nov 02, 2023",
    note: "Personal errand afternoon leave.",
  },
]

interface LeaveRequestsPageProps {
  searchParams: Promise<{
    tab?: string
    from?: string
    to?: string
  }>
}

export default async function LeaveRequestsPage({ searchParams }: LeaveRequestsPageProps) {
  const params = await searchParams
  const currentTab = (params.tab as TabKey) || "pending"

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-zinc-100 dark:bg-zinc-950 p-8 lg:p-12">
      <div className="max-w-7xl mx-auto w-full">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/admin" className="hover:text-primary transition-colors">
                Admin Dashboard
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className="text-primary font-medium">Leave Management</span>
            </nav>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Manage Request
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                className="w-full pl-10 pr-4 py-2 bg-primary/5 border border-primary/10 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none dark:bg-zinc-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                placeholder="Search requests..."
                type="text"
              />
            </div>
            <button className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/5 text-slate-600 hover:bg-primary/10 transition-colors dark:text-slate-300">
              <span className="sr-only">Notifications</span>
              <span className="inline-flex">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current">
                  <path
                    d="M15 17H9m9-1V11a6 6 0 10-12 0v5l-2 2h16l-2-2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </div>
        </header>

        <section className="mb-8 flex flex-col gap-6">
          <div className="flex items-center border-b border-primary/10">
            {tabs.map((t) => {
              const active = t.key === currentTab
              return (
                <Link
                  key={t.key}
                  href={tabHref(t.key)}
                  className={[
                    "px-6 py-3 text-sm border-b-2 -mb-px transition-colors",
                    active
                      ? "font-bold text-primary border-primary"
                      : "font-medium text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-200",
                  ].join(" ")}
                >
                  {t.label}
                </Link>
              )
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Date Range
              </label>
              <LeaveRequestDateRangePicker initialFrom={params.from} initialTo={params.to} />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Leave Type
              </label>
              <select className="bg-white dark:bg-zinc-900 border border-primary/10 rounded-lg px-3 py-2 text-sm focus:ring-primary/20">
                <option>All Types</option>
                <option>Sick Leave</option>
                <option>Annual Leave</option>
                <option>Maternity Leave</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:col-span-3">
              <button className="h-[42px] px-6 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
                <Filter className="h-4 w-4" />
                Apply Filters
              </button>
              <RequestLeaveModal />
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-900 rounded-lg border border-primary/10 shadow-sm overflow-visible">
          <div className="w-full">
            <table className="w-full table-auto text-left border-collapse">
              <thead>
                <tr className="bg-primary/5 border-b border-primary/10">
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="hidden md:table-cell px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="hidden lg:table-cell px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center w-36">
                    Duration
                  </th>
                  <th className="hidden xl:table-cell px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Start/End Date
                  </th>
                  <th className="hidden xl:table-cell px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Manager&apos;s Note
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {mockRequests.map((row) => {
                  const tone =
                    row.leaveTypeTone === "amber"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  return (
                    <tr key={row.id} className="hover:bg-primary/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
                            {row.employeeInitials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                              {row.employeeName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{row.employeeRole}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tone}`}>
                          {row.leaveType}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4">
                        <div className="flex items-center justify-center">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {row.durationLabel}
                          </span>
                        </div>
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4">
                        <div className="text-xs leading-relaxed">
                          <p className="text-slate-700 dark:text-slate-200 font-medium">{row.start}</p>
                          <p className="text-slate-400">{row.end}</p>
                        </div>
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4">
                        <p className="text-xs text-slate-500 max-w-[220px] truncate">{row.note}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
                          <LeaveRequestActions requestId={row.id} employeeName={row.employeeName} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 flex items-center justify-between bg-primary/5 border-t border-primary/10">
            <p className="text-xs text-slate-500 font-medium">
              Showing {mockRequests.length} of {mockRequests.length} {currentTab} requests
            </p>
            <div className="flex items-center gap-1">
              <button
                className="h-8 w-8 rounded border border-primary/10 flex items-center justify-center text-slate-400 disabled:opacity-50"
                disabled
              >
                <span className="sr-only">Previous</span>
                <span className="inline-flex">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
              <button className="h-8 w-8 rounded bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                1
              </button>
              <button className="h-8 w-8 rounded border border-primary/10 flex items-center justify-center text-xs font-bold hover:bg-primary/5">
                2
              </button>
              <button className="h-8 w-8 rounded border border-primary/10 flex items-center justify-center text-slate-600 hover:bg-primary/5">
                <span className="sr-only">Next</span>
                <span className="inline-flex">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
