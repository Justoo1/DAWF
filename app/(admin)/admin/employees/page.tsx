import Employees from "@/components/admin/Employees"
import QuickActions from "@/components/admin/QuickActions"
import { fetchUsers } from "@/lib/actions/users.action"

interface EmployeesPageProps {
  searchParams: Promise<{
    page?: string
  }>
}

const EmployeesPage = async({ searchParams }: EmployeesPageProps) => {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const pageSize = 10

  const employees = await fetchUsers(currentPage, pageSize)
  if (!employees.success) {
    return <div>Error: {employees.error}</div>
  }else if(!employees.users){
    return <div>No users found</div>
  }
  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <QuickActions />
      <Employees
        employees={employees.users}
        pagination={employees.pagination!}
      />
    </main>
  )
}

export default EmployeesPage
