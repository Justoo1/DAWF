'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Notification } from '@prisma/client'
import {
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/actions/notification.actions'
import { formatDistanceToNow } from 'date-fns'
import { Bell } from 'lucide-react'
import NotificationDetailDialog from './NotificationDetailDialog'

interface NotificationsViewProps {
  userId: string
}

export default function NotificationsView({ userId }: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const loadNotifications = async () => {
    setLoading(true)
    const result = await fetchUserNotifications(userId, 100)
    if (result.success && result.notifications) {
      setNotifications(result.notifications)
      setUnreadCount(result.unreadCount || 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id)
    }
    setSelectedNotification(notification)
    setDetailDialogOpen(true)
    await loadNotifications()
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(userId)
    await loadNotifications()
  }

  const handleDialogClose = () => {
    setDetailDialogOpen(false)
    setSelectedNotification(null)
  }

  const handleDeleteSuccess = async () => {
    setDetailDialogOpen(false)
    setSelectedNotification(null)
    await loadNotifications()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'EVENT_UPCOMING':
      case 'EVENT_ACTIVE':
      case 'EVENT_CREATED':
        return '📅'
      case 'CONTRIBUTION_ADDED':
        return '💰'
      case 'EXPENSE_ADDED':
        return '💸'
      case 'REMINDER':
        return '🔔'
      case 'ANNOUNCEMENT':
        return '📢'
      case 'ROOM_BOOKING_PENDING':
      case 'ROOM_BOOKING_APPROVED':
      case 'ROOM_BOOKING_REJECTED':
      case 'ROOM_BOOKING_CREATED':
        return '🏢'
      default:
        return '📬'
    }
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading notifications...</div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">All Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="bg-red-500">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No notifications yet</p>
            <p className="text-sm mt-2">When you receive notifications, they&#39;ll appear here</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                {!notification.isRead && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                )}

                <div className="flex items-start gap-4 pl-6">
                  <div className="text-3xl mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    View details →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedNotification && (
        <NotificationDetailDialog
          notification={selectedNotification}
          open={detailDialogOpen}
          onClose={handleDialogClose}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </>
  )
}
