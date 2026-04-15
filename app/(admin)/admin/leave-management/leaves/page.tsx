import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { fetchLeaveRequests } from "@/lib/actions/leave.actions"
import { fetchUser } from "@/lib/actions/users.action"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import AdminAllLeavesTable from "@/components/admin/AdminAllLeavesTable"

export default async function AdminLeavesOverviewPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.email) redirect("/sign-in")

  const [result, userRes] = await Promise.all([
    fetchLeaveRequests(session.user.id),
    fetchUser(session.user.email),
  ])

  const requests = result.success ? (result.requests ?? []) : []
  const role = userRes.success && userRes.user ? userRes.user.role : "EMPLOYEE"

  const scopeDescription =
    role === "ADMIN"
      ? "You are viewing leave records across the organization."
      : role === "MANAGER"
        ? "You are viewing leave for employees in departments you manage."
        : "You are viewing leave records available for your role."

  return (
    <main className="admin-main">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col">
            <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
              <Link
                href="/admin"
                className="transition-colors hover:text-[#10A074] dark:hover:text-emerald-400"
              >
                Admin Dashboard
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-400 dark:text-zinc-600" />
              <span className="font-bold text-[#10A074] dark:text-emerald-400">Leave Management</span>
            </nav>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-zinc-100">
              All leave
            </h1>
          </div>
        </header>

        <AdminAllLeavesTable initialRequests={requests} />
      </div>
    </main>
  )
}
