import Employees from "@/components/admin/Employees"
import { fetchUsers, fetchUser, fetchMembers } from "@/lib/actions/users.action"
import { AddEmployeeDialog } from "@/components/admin/AddEmployeeDialog"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { AdminPageContent } from "@/components/admin/layout/AdminPageContent"
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader"
import { AdminStatCard, AdminStatCardsWrapper } from "@/components/admin/layout/AdminStatCards"
import { Users, UserPlus, TrendingUp } from "lucide-react"

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
  const isManager = currentUserResult.user.role === 'MANAGER'
  const isFoodCommittee = currentUserResult.user.role === 'FOOD_COMMITTEE'

  const [employees, membersData] = await Promise.all([
    fetchUsers(currentPage, pageSize),
    fetchMembers()
  ])

  if (!employees.success) {
    return <div>Error: {employees.error}</div>
  }else if(!employees.users){
    return <div>No users found</div>
  }

  const { totalMembers = 0, newMembersThisMonth = 0, percentageChange = "0.0" } = membersData as { 
    totalMembers?: number; 
    newMembersThisMonth?: number; 
    percentageChange?: string 
  };
  const isPositiveGrowth = parseFloat(percentageChange) >= 0;

  return (
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Manage Employees"
          description="View and manage employee records, roles, and permissions."
          action={isAdmin ? <AddEmployeeDialog /> : null}
        />
        
        <AdminStatCardsWrapper>
          <AdminStatCard
            title="Total Workforce"
            value={totalMembers}
            icon={<Users size={20} strokeWidth={2.5} />}
          />
          <AdminStatCard
            title="New Hires"
            value={newMembersThisMonth}
            icon={<UserPlus size={20} strokeWidth={2.5} />}
            trend={`${newMembersThisMonth > 0 ? '+' : ''}${newMembersThisMonth}`}
            trendIsPositive={newMembersThisMonth > 0}
            trendLabel="joined this month"
          />
          <AdminStatCard
            title="Workforce Growth"
            value={`${isPositiveGrowth ? '+' : ''}${percentageChange}%`}
            icon={<TrendingUp size={20} strokeWidth={2.5} />}
            trend={`${isPositiveGrowth ? '+' : ''}${percentageChange}%`}
            trendIsPositive={isPositiveGrowth}
            trendLabel="from last month"
          />
        </AdminStatCardsWrapper>

        <Employees
          employees={employees.users}
          pagination={employees.pagination!}
          isAdmin={isAdmin}
          isManager={isManager}
          isFoodCommittee={isFoodCommittee}
        />
      </AdminPageContent>
    </main>
  )
}

export default EmployeesPage
