import { AddEmployeeDialog } from "@/components/admin/AddEmployeeDialog"
import EmployeeLeaveActions from "@/components/admin/EmployeeLeaveActions"
import { fetchUser, fetchUsers } from "@/lib/actions/users.action"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

interface ManageEmployeesPageProps {
  searchParams: Promise<{
    page?: string
  }>
}

const pageHref = (page: number) => `/admin/manage-employees?page=${page}`

export default async function ManageEmployeesPage({ searchParams }: ManageEmployeesPageProps) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const pageSize = 10

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return <div>Unauthorized: Please log in</div>
  }

  const currentUserResult = await fetchUser(session.user.email)
  if (!currentUserResult.success || !currentUserResult.user) {
    return <div>Error: Unable to fetch user data</div>
  }

  const isAdmin = currentUserResult.user.role === 'ADMIN'

  const employeesResult = await fetchUsers(currentPage, pageSize)
  if (!employeesResult.success) {
    return <div>Error: {employeesResult.error}</div>
  }
  if (!employeesResult.users) {
    return <div>No users found</div>
  }

  const totalPages = employeesResult.pagination?.totalPages || 1
  const employees = employeesResult.users

  const departments = Array.from(
    new Set(
      employees
        .map((u) => (u.department || '').trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-zinc-100 dark:bg-zinc-950 p-8 lg:p-12">
      <div className="max-w-7xl mx-auto w-full">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Manage Employees
          </h2>
          {isAdmin && (
            <div className="[&>button]:bg-primary [&>button]:text-primary-foreground [&>button:hover]:bg-primary/90">
              <AddEmployeeDialog />
            </div>
          )}
        </header>

        <section className="bg-white dark:bg-zinc-900 rounded-lg border border-primary/10 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[280px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 h-5 w-5" />
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-primary/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                placeholder="Search employees by name, ID or email..."
                type="text"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select className="appearance-none bg-zinc-50 dark:bg-zinc-950/40 border border-primary/10 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary outline-none cursor-pointer">
                  <option>All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept}>{dept}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▾
                </span>
              </div>

              <div className="relative">
                <select className="appearance-none bg-zinc-50 dark:bg-zinc-950/40 border border-primary/10 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary outline-none cursor-pointer">
                  <option>Status: Active</option>
                  <option>Status: Inactive</option>
                  <option>Status: All</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▾
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-900 rounded-lg border border-primary/10 shadow-sm overflow-visible">
          <div className="w-full">
            <table className="w-full table-auto text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/40 border-b border-primary/10">
                  <th className="px-4 lg:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Employee Name
                  </th>
                  <th className="hidden md:table-cell px-4 lg:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-44">
                    Department
                  </th>
                  <th className="hidden lg:table-cell px-4 lg:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-56 text-center">
                    Leave Requested
                  </th>
                  <th className="hidden xl:table-cell px-4 lg:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-56">
                    Latest / Upcoming Leave
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {employees.map((employee) => {
                  const initials = (employee.name || employee.email || "?")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((s) => s[0]?.toUpperCase())
                    .join("")
                  const isActive = !!employee.isActive

                  return (
                    <tr key={employee.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {employee.name || "Unnamed"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 lg:px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-tight">
                          {employee.department || "N/A"}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 lg:px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            00
                          </span>
                          <span className="text-xs text-slate-500">Total days</span>
                        </div>
                      </td>
                      <td className="hidden xl:table-cell px-4 lg:px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            —
                          </p>
                          <div>
                            <span
                              className={[
                                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                                isActive
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-slate-300",
                              ].join(" ")}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-right">
                        <EmployeeLeaveActions
                          employee={{
                            id: employee.id,
                            name: employee.name,
                            email: employee.email,
                            department: employee.department,
                            isActive: employee.isActive,
                          }}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-primary/10 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-700 dark:text-slate-200">{currentPage}</span> of{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={pageHref(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage <= 1}
                className={[
                  "p-1.5 rounded-lg border border-primary/10 bg-white dark:bg-zinc-900 text-slate-400 hover:text-primary transition-colors",
                  currentPage <= 1 ? "pointer-events-none opacity-50" : "",
                ].join(" ")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>

              {Array.from({ length: Math.min(3, totalPages) }).map((_, idx) => {
                const page = idx + 1
                const active = page === currentPage
                return (
                  <Link
                    key={page}
                    href={pageHref(page)}
                    className={[
                      "px-3 py-1.5 rounded-lg text-xs font-bold",
                      active ? "bg-primary text-primary-foreground" : "text-slate-600 dark:text-slate-400 hover:bg-primary/5",
                    ].join(" ")}
                  >
                    {page}
                  </Link>
                )
              })}

              <Link
                href={pageHref(Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage >= totalPages}
                className={[
                  "p-1.5 rounded-lg border border-primary/10 bg-white dark:bg-zinc-900 text-slate-400 hover:text-primary transition-colors",
                  currentPage >= totalPages ? "pointer-events-none opacity-50" : "",
                ].join(" ")}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
