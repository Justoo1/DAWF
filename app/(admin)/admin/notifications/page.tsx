import NotificationTestPanel from '@/components/admin/NotificationTestPanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotificationsManagementPage() {
  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Notifications Management</h2>
        <p className="text-gray-600 mt-1">Test and manage notification system</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Notification system information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm font-medium">Active Events Notifications</span>
              <span className="text-xs text-gray-500">Daily at 8:00 AM</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm font-medium">Upcoming Events Notifications</span>
              <span className="text-xs text-gray-500">Daily at 9:00 AM</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm font-medium">Engagement Reminders</span>
              <span className="text-xs text-gray-500">Weekly (Mondays at 9:00 AM)</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-sm font-medium">Auto-trigger on Events</span>
              <span className="text-xs text-green-600 font-semibold">Enabled</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-sm font-medium">Auto-trigger on Contributions</span>
              <span className="text-xs text-green-600 font-semibold">Enabled</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Auto-trigger on Expenses</span>
              <span className="text-xs text-green-600 font-semibold">Enabled</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>Supported notification categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <div>
                <p className="text-sm font-medium">Event Notifications</p>
                <p className="text-xs text-gray-500">Created, upcoming, and active events</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💰</span>
              <div>
                <p className="text-sm font-medium">Contribution Updates</p>
                <p className="text-xs text-gray-500">New contributions recorded</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💸</span>
              <div>
                <p className="text-sm font-medium">Expense Notifications</p>
                <p className="text-xs text-gray-500">Disbursements and expenses</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <div>
                <p className="text-sm font-medium">Engagement Reminders</p>
                <p className="text-xs text-gray-500">Keep users active in the system</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📢</span>
              <div>
                <p className="text-sm font-medium">Announcements</p>
                <p className="text-xs text-gray-500">Custom admin messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <NotificationTestPanel />
      </div>
    </main>
  )
}
