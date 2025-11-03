import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar } from 'lucide-react'
import { fetchContributions } from '@/lib/actions/contribution'
import { fetchUpcomingEvents } from '@/lib/actions/events.actions'
import { fetchExpenses } from '@/lib/actions/expenses'
import { fetchMembers, fetchUserWithContributions } from '@/lib/actions/users.action'
import { auth } from "@/lib/auth"
import { redirect } from 'next/navigation'
import UserAnalysis from '@/components/admin/User-analysis'
import QuickActions from "@/components/admin/QuickActions"
import { headers } from "next/headers"
import { canAccessAdmin } from '@/lib/permissions'

const Dashboard = async () => {
  // const { userId } = await auth()
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session){
    redirect('/')
  }

  const [contributionsData, eventsData, expensesData, membersData, userData] = await Promise.all([
    fetchContributions(),
    fetchUpcomingEvents(),
    fetchExpenses(),
    fetchMembers(),
    fetchUserWithContributions(session.user.email),
  ])

  // Check if user has admin or manager role
  if (!userData.user || !canAccessAdmin(userData.user.role as 'EMPLOYEE' | 'MANAGER' | 'ADMIN')){
    redirect('/')
  }
  
  return (
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard Overview</h2>
          <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                <span className="h-4 w-4 text-muted-foreground">₵</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contributionsData.totalContributions?.toFixed(2)} GH¢</div>
                <p className="text-xs text-muted-foreground">{contributionsData.percentageChange}% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{membersData.totalMembers}</div>
                <p className="text-xs text-muted-foreground">
                  +{membersData.newMembersThisMonth} new this month ({membersData.percentageChange}% growth)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventsData.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  {Object.entries(eventsData.eventTypes || {})
                    .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
                    .join(', ')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <span className="h-4 w-4 text-muted-foreground">₵</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expensesData.totalExpenses?.toFixed(2)} GH¢</div>
                <p className="text-xs text-muted-foreground">{expensesData.percentageChange}% from last month</p>
              </CardContent>
            </Card>
          </div>
          {userData.success && (
              <UserAnalysis userData={userData.user} showRecentContributions />
            )}
          <QuickActions />
        </main>
  )
}

export default Dashboard;
