import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users } from "lucide-react"
import { fetchContributions } from "@/lib/actions/contribution"
import { fetchUpcomingEvents } from "@/lib/actions/events.actions"
import { fetchExpenses } from "@/lib/actions/expenses"
import { fetchMembers } from "@/lib/actions/users.action"

export async function AdminDashboardStats() {
  const [contributionsData, eventsData, expensesData, membersData] = await Promise.all([
    fetchContributions(1, 10, false),
    fetchUpcomingEvents(),
    fetchExpenses(),
    fetchMembers(),
  ])

  return (
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
          <CardTitle className="text-sm font-semibold text-muted-foreground">Total Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">{membersData.totalMembers}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            +{membersData.newMembersThisMonth} new this month ({membersData.percentageChange}% growth)
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground">Upcoming Events</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">{eventsData.totalEvents}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            {Object.entries(eventsData.eventTypes || {})
              .map(([type, count]) => `${count} ${type}${count > 1 ? "s" : ""}`)
              .join(", ")}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground">Total Expenses</CardTitle>
          <span className="text-sm font-semibold text-muted-foreground">₵</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {expensesData.totalExpenses?.toFixed(2)} GH¢
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{expensesData.percentageChange}% from last month</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function AdminDashboardStatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-28 rounded-xl border border-border/40 bg-card/50 ring-1 ring-border/20 animate-pulse"
        />
      ))}
    </div>
  )
}
