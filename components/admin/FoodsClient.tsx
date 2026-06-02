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
import { Plus, Upload } from 'lucide-react'
import FoodForm from './FoodForm'
import { FoodsTable } from './FoodsTable'
import { FoodBulkUploadDialog } from './FoodBulkUploadDialog'
import { FoodValues, FoodVendorValues } from '@/lib/validation'
import { useRouter } from 'next/navigation'

interface FoodsClientProps {
  vendors: FoodVendorValues[]
  foods: FoodValues[]
}

export function FoodsClient({ vendors, foods }: FoodsClientProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setCreateOpen(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-6">
        <Button variant="outline" onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload from Excel
        </Button>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
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
                Add a new food item to the catalog. Optionally assign it to one or more vendors.
              </DialogDescription>
            </DialogHeader>
            <FoodForm
              vendors={vendors}
              onSuccess={handleSuccess}
              onCancel={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <FoodsTable initialFoods={foods} vendors={vendors} />

      <FoodBulkUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  )
}
