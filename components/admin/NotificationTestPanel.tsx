'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  notifyUpcomingEvents,
  notifyActiveEvents,
  sendEngagementReminder,
} from '@/lib/actions/notification.actions'
import { Loader2, Bell, Calendar, Users } from 'lucide-react'

export default function NotificationTestPanel() {
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handleNotifyUpcoming = async () => {
    setLoading('upcoming')
    try {
      const result = await notifyUpcomingEvents()
      if (result.success) {
        toast({
          title: 'Upcoming Events Notifications Sent',
          description: `Sent ${result.notificationCount} notifications for ${result.eventCount} upcoming event(s).`,
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to send notifications',
          variant: 'destructive',
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleNotifyActive = async () => {
    setLoading('active')
    try {
      const result = await notifyActiveEvents()
      if (result.success) {
        toast({
          title: 'Active Events Notifications Sent',
          description: `Sent ${result.notificationCount} notifications for ${result.eventCount} active event(s).`,
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to send notifications',
          variant: 'destructive',
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleSendReminder = async () => {
    setLoading('reminder')
    try {
      const result = await sendEngagementReminder()
      if (result.success) {
        toast({
          title: 'Engagement Reminder Sent',
          description: `Sent ${result.count} reminder(s) to all active users.`,
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to send reminder',
          variant: 'destructive',
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Notifications</CardTitle>
        <CardDescription>
          Manually trigger notification sending to test the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-sm">Upcoming Events</h4>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Notify users about events starting within the next 24 hours
            </p>
            <Button
              onClick={handleNotifyUpcoming}
              disabled={loading !== null}
              className="w-full"
              variant="outline"
            >
              {loading === 'upcoming' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Send Upcoming Notifications
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold text-sm">Active Events</h4>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Notify users about events happening today
            </p>
            <Button
              onClick={handleNotifyActive}
              disabled={loading !== null}
              className="w-full"
              variant="outline"
            >
              {loading === 'active' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Send Active Notifications
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-600" />
              <h4 className="font-semibold text-sm">Engagement Reminder</h4>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Send reminder to all users to check the app
            </p>
            <Button
              onClick={handleSendReminder}
              disabled={loading !== null}
              className="w-full"
              variant="outline"
            >
              {loading === 'reminder' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Send Reminder
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> These notifications will be sent to all active users immediately.
            The automatic system sends these notifications based on the cron schedule configured in vercel.json.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
