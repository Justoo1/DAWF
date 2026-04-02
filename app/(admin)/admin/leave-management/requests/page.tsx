import Link from "next/link"
import { ChevronRight, Search } from "lucide-react"
import { fetchLeaveRequests } from "@/lib/actions/leave.actions"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import LeaveRequestsTable from "@/components/admin/LeaveRequestsTable"

type TabKey = "pending" | "history" | "archived"

const tabs: { key: TabKey; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "history", label: "History" },
  { key: "archived", label: "Archived" },
]

const tabHref = (tab: TabKey) => `/admin/leave-management/requests?tab=${tab}`

interface LeaveRequestsPageProps {
  searchParams: Promise<{
    tab?: string
    from?: string
    to?: string
  }>
}

export default async function LeaveRequestsPage({ searchParams }: LeaveRequestsPageProps) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const params = await searchParams
  const currentTab = (params.tab as TabKey) || "pending"

  const result = await fetchLeaveRequests(session.user.id)
  const requests = (result.success ? (result.requests as any) : [])

  return (
    <main className="admin-main">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/admin" className="hover:text-[#10A074] transition-colors">
                Admin Dashboard
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className="text-[#10A074] font-bold">Leave Management</span>
            </nav>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">
              Leave Requests
            </h1>
            <p className="text-sm text-slate-500 font-medium">
                Review and manage employee leave applications.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            {tabs.map((t) => {
              const active = t.key === currentTab
              return (
                <Link
                  key={t.key}
                  href={tabHref(t.key)}
                  className={[
                    "px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                    active
                      ? "bg-white text-[#10A074] shadow-sm"
                      : "text-slate-500 hover:text-slate-700",
                  ].join(" ")}
                >
                  {t.label}
                </Link>
              )
            })}
          </div>
        </header>

        <LeaveRequestsTable initialRequests={requests} currentTab={currentTab} />
      </div>
    </main>
  )
}
