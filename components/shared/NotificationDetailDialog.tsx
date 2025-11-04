'use client'

import { useState } from 'react'
import { Notification } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2, ExternalLink } from 'lucide-react'
import { deleteNotification } from '@/lib/actions/notification.actions'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface NotificationDetailDialogProps {
  notification: Notification
  open: boolean
  onClose: () => void
  onDeleteSuccess: () => void
}

export default function NotificationDetailDialog({
  notification,
  open,
  onClose,
  onDeleteSuccess,
}: NotificationDetailDialogProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const getNotificationTypeLabel = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteNotification(notification.id)
      setDeleteDialogOpen(false)
      onDeleteSuccess()
    } catch (error) {
      console.error('Failed to delete notification:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className="text-4xl">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl mb-2">
                  {notification.title}
                </DialogTitle>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {getNotificationTypeLabel(notification.type)}
                  </span>
                  <span>•</span>
                  <span>
                    {format(new Date(notification.createdAt), 'PPpp')}
                  </span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <DialogDescription className="text-base text-gray-700 leading-relaxed py-4">
            {notification.message}
          </DialogDescription>

          {notification.linkUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Related link:</p>
              <Link
                href={notification.linkUrl}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                onClick={onClose}
              >
                <ExternalLink className="h-4 w-4" />
                View related content
              </Link>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center sm:justify-between">
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
