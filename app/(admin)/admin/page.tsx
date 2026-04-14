import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar } from 'lucide-react'
import { fetchContributions } from '@/lib/actions/contribution'
import { fetchUpcomingEvents } from '@/lib/actions/events.actions'
import { fetchExpenses } from '@/lib/actions/expenses'
import { fetchAdminShellUser, fetchMembers } from '@/lib/actions/users.action'
import { auth } from "@/lib/auth"
import { redirect } from 'next/navigation'
import QuickActions from "@/components/admin/QuickActions"
import { headers } from "next/headers"
import { canAccessAdmin } from '@/lib/permissions'
import { AdminPageContent } from "@/components/admin/layout/AdminPageContent"
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader"
import { Suspense } from 'react'
import { UserAnalysisSection } from '@/components/admin/UserAnalysisSection'
import { UserAnalysisSkeleton } from '@/components/admin/UserAnalysisSkeleton'

const Dashboard = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session){
    redirect('/')
  }

  const shell = await fetchAdminShellUser(session.user.email)
  if (!shell.success || !shell.user) {
    redirect('/')
  }

  if (!canAccessAdmin(shell.user.role as 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'FOOD_COMMITTEE')){
    redirect('/')
  }

  if (shell.user.role === 'FOOD_COMMITTEE') {
    redirect('/admin/food-management/vendors')
  }

  const [contributionsData, eventsData, expensesData, membersData] = await Promise.all([
    fetchContributions(1,10,false),
    fetchUpcomingEvents(),
    fetchExpenses(),
    fetchMembers(),
  ])

  return (
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Dashboard"
          description="Overview of contributions, members, events, and expenses."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Total Contributions
              </CardTitle>
              <span className="text-sm font-semibold text-muted-foreground">₵</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {contributionsData.totalContributions?.toFixed(2)} GH¢
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {contributionsData.percentageChange}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {membersData.totalMembers}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                +{membersData.newMembersThisMonth} new this month ({membersData.percentageChange}% growth)
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Upcoming Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {eventsData.totalEvents}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {Object.entries(eventsData.eventTypes || {})
                  .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
                  .join(', ')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Total Expenses
              </CardTitle>
              <span className="text-sm font-semibold text-muted-foreground">₵</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {expensesData.totalExpenses?.toFixed(2)} GH¢
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {expensesData.percentageChange}% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Suspense fallback={<UserAnalysisSkeleton />}>
          <UserAnalysisSection email={session.user.email} />
        </Suspense>
        <QuickActions />
      </AdminPageContent>
    </main>
  )
}

export default Dashboard;
