'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import WeeklyMenuForm from './WeeklyMenuForm'
import { FoodVendorValues, FoodValues } from '@/lib/validation'
import { useRouter } from 'next/navigation'

interface MenusClientProps {
  vendors: FoodVendorValues[]
  foods: FoodValues[]
  children: React.ReactNode
}

export function MenusClient({ vendors, foods, children }: MenusClientProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setOpen(false)
    router.refresh()
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <>
      <div className="flex items-center justify-end mb-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Menu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Weekly Food Menu</DialogTitle>
              <DialogDescription>
                Create a new weekly food menu for employees
              </DialogDescription>
            </DialogHeader>
            <WeeklyMenuForm
              vendors={vendors}
              foods={foods}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>
      {children}
    </>
  )
}
