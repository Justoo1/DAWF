"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { useToast } from '@/hooks/use-toast'
import { deleteFoodMenu, revertMenuToDraft } from '@/lib/actions/foodMenu.actions'
import { useRouter } from 'next/navigation'
import { Trash2, Undo2 } from 'lucide-react'

interface MenuDeleteActionsProps {
  menuId: string
  menuTitle: string
  status: string
}

const MenuDeleteActions = ({ menuId, menuTitle, status }: MenuDeleteActionsProps) => {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [revertOpen, setRevertOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    setIsProcessing(true)
    try {
      const result = await deleteFoodMenu(menuId)

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error
        })
      } else {
        toast({
          title: 'Success',
          description: 'Menu deleted successfully'
        })
        setDeleteOpen(false)
        router.refresh()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong'
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRevert = async () => {
    setIsProcessing(true)
    try {
      const result = await revertMenuToDraft(menuId)

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error
        })
      } else {
        toast({
          title: 'Success',
          description: 'Menu reverted to draft. You can now edit or delete it.'
        })
        setRevertOpen(false)
        router.refresh()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong'
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // If status is DRAFT, show delete button
  if (status === 'DRAFT') {
    return (
      <>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Menu?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete the menu &quot;{menuTitle}&quot;. This action cannot be undone.
                All menu items will also be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isProcessing}
                className="bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  // For non-draft menus, show revert to draft button
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setRevertOpen(true)}
      >
        <Undo2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={revertOpen} onOpenChange={setRevertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert to Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revert &quot;{menuTitle}&quot; back to DRAFT status.
              <br /><br />
              <strong>Warning:</strong> If this menu has been published, reverting it will:
              <ul className="list-disc ml-6 mt-2">
                <li>Remove it from employee food selection</li>
                <li>Allow you to edit or delete it</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevert}
              disabled={isProcessing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isProcessing ? 'Reverting...' : 'Revert to Draft'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default MenuDeleteActions
