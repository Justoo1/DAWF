import { AddEmployeeDialog } from "@/components/admin/AddEmployeeDialog"
import EmployeeLeaveActions from "@/components/admin/EmployeeLeaveActions"
import { fetchUser, fetchUsers } from "@/lib/actions/users.action"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { AdminPageContent } from "@/components/admin/layout/AdminPageContent"
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader"
import { ManageEmployeesToolbar } from "@/components/admin/layout/ManageEmployeesToolbar"
import { AdminTableCard } from "@/components/admin/layout/AdminTableCard"
import { AdminPaginationBar } from "@/components/admin/layout/AdminPaginationBar"
import {
  adminTableClassName,
  adminTbodyRowClass,
  adminTdClass,
  adminThClass,
  adminTheadRowClass,
} from "@/lib/admin-ui"
import { cn } from "@/lib/utils"

interface ManageEmployeesPageProps {
  searchParams: Promise<{
    page?: string
  }>
}



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
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Manage Employees"
          description="Leave balances, requests, and employee directory."
          action={
            isAdmin ? (
              <div className="[&_button]:shadow-sm">
                <AddEmployeeDialog />
              </div>
            ) : null
          }
        />

        <ManageEmployeesToolbar departments={departments} />

        <AdminTableCard
          title="Employees"
          footer={
            <AdminPaginationBar
              page={currentPage}
              totalPages={totalPages}
              totalCount={employeesResult.pagination?.totalCount ?? employees.length}
              pageSize={pageSize}
              entityLabel="employees"
              hrefTemplate="/admin/manage-employees?page={page}"
            />
          }
        >
          <table className={adminTableClassName()}>
            <thead>
              <tr className={adminTheadRowClass}>
                <th className={adminThClass}>Employee Name</th>
                <th className={cn(adminThClass, "hidden w-44 md:table-cell")}>
                  Department
                </th>
                <th
                  className={cn(
                    adminThClass,
                    "hidden w-56 text-center lg:table-cell"
                  )}
                >
                  Leave Requested
                </th>
                <th
                  className={cn(adminThClass, "hidden w-56 xl:table-cell")}
                >
                  Latest / Upcoming Leave
                </th>
                <th className={cn(adminThClass, "w-16 text-right")}>Actions</th>
              </tr>
            </thead>
            <tbody>
                {employees.map((employee) => {
                  const initials = (employee.name || employee.email || "?")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((s) => s[0]?.toUpperCase())
                    .join("")
                  const isActive = !!employee.isActive

                  return (
                    <tr key={employee.id} className={adminTbodyRowClass}>
                      <td className={adminTdClass}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {employee.name || "Unnamed"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={cn(adminTdClass, "hidden md:table-cell")}>
                        <span className="inline-flex max-w-full rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-tight text-primary">
                          {employee.department || "N/A"}
                        </span>
                      </td>
                      <td
                        className={cn(adminTdClass, "hidden text-center lg:table-cell")}
                      >
                        <div className="inline-flex items-center gap-2">
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            00
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Total days
                          </span>
                        </div>
                      </td>
                      <td className={cn(adminTdClass, "hidden xl:table-cell")}>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            —
                          </p>
                          <div>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                isActive
                                  ? "bg-primary/15 text-primary"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={cn(adminTdClass, "text-right")}>
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
        </AdminTableCard>
      </AdminPageContent>
    </main>
  )
}
