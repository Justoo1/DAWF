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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createBulkContributions } from '@/lib/actions/contribution'
import { Loader, PlusCircle, Users } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface User {
  id: string
  name: string
  email: string
  isActive?: boolean
}

interface BulkContributionModalProps {
  users: User[]
}

export default function BulkContributionModal({ users }: BulkContributionModalProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [startMonth, setStartMonth] = useState('')
  const [endMonth, setEndMonth] = useState('')
  const [amount, setAmount] = useState('100')

  // Filter to only show active employees
  const activeUsers = users.filter(u => u.isActive !== false)

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedUsers(activeUsers.map(u => u.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedUsers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one employee',
        variant: 'destructive',
      })
      return
    }

    if (!startMonth || !endMonth) {
      toast({
        title: 'Error',
        description: 'Please select start and end months',
        variant: 'destructive',
      })
      return
    }

    const start = new Date(startMonth + '-01')
    const end = new Date(endMonth + '-01')

    if (start > end) {
      toast({
        title: 'Error',
        description: 'Start month must be before or equal to end month',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const result = await createBulkContributions(
        selectedUsers,
        start,
        end,
        parseFloat(amount)
      )

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: result.message,
        })
        setOpen(false)
        // Reset form
        setSelectedUsers([])
        setSelectAll(false)
        setStartMonth('')
        setEndMonth('')
        setAmount('100')
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create bulk contributions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Get current month in YYYY-MM format
  const currentMonth = new Date().toISOString().slice(0, 7)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Bulk Add Contributions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Add Contributions</DialogTitle>
          <DialogDescription>
            Add contributions for multiple employees across selected months. Each contribution will be GH₵{amount}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Month Range Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startMonth">Start Month</Label>
              <Input
                id="startMonth"
                type="month"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                max={currentMonth}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endMonth">End Month</Label>
              <Input
                id="endMonth"
                type="month"
                value={endMonth}
                onChange={(e) => setEndMonth(e.target.value)}
                max={currentMonth}
                required
              />
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Contribution Amount (GH₵)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <p className="text-sm text-gray-500">Default: GH₵100 per employee per month</p>
          </div>

          {/* Employee Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select Employees</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selectAll"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="selectAll" className="font-normal cursor-pointer">
                  Select All ({activeUsers.length})
                </Label>
              </div>
            </div>

            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
              {activeUsers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No active employees found</p>
              ) : (
                activeUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      id={user.id}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <Label
                      htmlFor={user.id}
                      className="flex-1 font-normal cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span>{user.name}</span>
                        <span className="text-sm text-gray-500">{user.email}</span>
                      </div>
                    </Label>
                  </div>
                ))
              )}
            </div>

            <p className="text-sm text-gray-500">
              Selected: {selectedUsers.length} active employee(s)
            </p>
          </div>

          {/* Summary */}
          {selectedUsers.length > 0 && startMonth && endMonth && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-900 mb-2">Summary</h4>
              <ul className="text-sm text-emerald-800 space-y-1">
                <li>
                  <Users className="inline h-4 w-4 mr-2" />
                  {selectedUsers.length} employee(s)
                </li>
                <li>
                  📅 From {new Date(startMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} to{' '}
                  {new Date(endMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </li>
                <li>
                  💰 GH₵{amount} per employee per month
                </li>
                <li className="font-semibold pt-2 border-t border-emerald-200 mt-2">
                  Total Contributions:{' '}
                  {(() => {
                    const start = new Date(startMonth + '-01')
                    const end = new Date(endMonth + '-01')
                    const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1
                    const total = selectedUsers.length * monthDiff * parseFloat(amount)
                    return `GH₵${total.toFixed(2)}`
                  })()}
                </li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedUsers.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Contributions'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
