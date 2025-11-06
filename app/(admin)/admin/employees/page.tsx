import Employees from "@/components/admin/Employees"
import QuickActions from "@/components/admin/QuickActions"
import { fetchUsers, fetchUser } from "@/lib/actions/users.action"
import { AddEmployeeDialog } from "@/components/admin/AddEmployeeDialog"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

interface EmployeesPageProps {
  searchParams: Promise<{
    page?: string
  }>
}

const EmployeesPage = async({ searchParams }: EmployeesPageProps) => {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const pageSize = 10

  // Get current user's role
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
  const isFoodCommittee = currentUserResult.user.role === 'FOOD_COMMITTEE'

  const employees = await fetchUsers(currentPage, pageSize)
  if (!employees.success) {
    return <div>Error: {employees.error}</div>
  }else if(!employees.users){
    return <div>No users found</div>
  }
  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <QuickActions />
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <AddEmployeeDialog />
        </div>
      )}
      <Employees
        employees={employees.users}
        pagination={employees.pagination!}
        isAdmin={isAdmin}
        isFoodCommittee={isFoodCommittee}
      />
    </main>
  )
}

export default EmployeesPage
