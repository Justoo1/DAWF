import NotificationTestPanel from '@/components/admin/NotificationTestPanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminPageContent } from '@/components/admin/layout/AdminPageContent'
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader'

export default function NotificationsManagementPage() {
  return (
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Notifications"
          description="Test and manage the notification system."
        />

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Notification system information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-sm font-medium text-foreground">Active Events Notifications</span>
                <span className="text-xs text-muted-foreground">Daily at 8:00 AM</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-sm font-medium text-foreground">Upcoming Events Notifications</span>
                <span className="text-xs text-muted-foreground">Daily at 9:00 AM</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-sm font-medium text-foreground">Engagement Reminders</span>
                <span className="text-xs text-muted-foreground">Weekly (Mondays at 9:00 AM)</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-sm font-medium text-foreground">Auto-trigger on Events</span>
                <span className="text-xs font-semibold text-primary">Enabled</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-sm font-medium text-foreground">Auto-trigger on Contributions</span>
                <span className="text-xs font-semibold text-primary">Enabled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Auto-trigger on Expenses</span>
                <span className="text-xs font-semibold text-primary">Enabled</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>Supported notification categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-sm font-medium text-foreground">Event Notifications</p>
                  <p className="text-xs text-muted-foreground">Created, upcoming, and active events</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">💰</span>
                <div>
                  <p className="text-sm font-medium text-foreground">Contribution Updates</p>
                  <p className="text-xs text-muted-foreground">New contributions recorded</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">💸</span>
                <div>
                  <p className="text-sm font-medium text-foreground">Expense Notifications</p>
                  <p className="text-xs text-muted-foreground">Disbursements and expenses</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">🔔</span>
                <div>
                  <p className="text-sm font-medium text-foreground">Engagement Reminders</p>
                  <p className="text-xs text-muted-foreground">Keep users active in the system</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">📢</span>
                <div>
                  <p className="text-sm font-medium text-foreground">Announcements</p>
                  <p className="text-xs text-muted-foreground">Custom admin messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <NotificationTestPanel />
        </div>
      </AdminPageContent>
    </main>
  )
}
