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
import FoodForm from './FoodForm'
import { FoodsTable } from './FoodsTable'
import { FoodValues, FoodVendorValues } from '@/lib/validation'
import { useRouter } from 'next/navigation'

interface FoodsClientProps {
  vendors: FoodVendorValues[]
  foods: FoodValues[]
}

export function FoodsClient({ vendors, foods }: FoodsClientProps) {
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
              Create New Food
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Food Item</DialogTitle>
              <DialogDescription>
                Add a new food item to the system
              </DialogDescription>
            </DialogHeader>
            <FoodForm
              vendors={vendors}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      <FoodsTable initialFoods={foods} vendors={vendors} />
    </>
  )
}
