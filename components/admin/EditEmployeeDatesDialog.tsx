'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { updateEmployeeDates } from "@/lib/actions/users.action"
import { CalendarIcon } from "lucide-react"

interface EditEmployeeDatesDialogProps {
  userId: string
  employeeName: string
  currentStartDate?: Date | null
  currentDateOfBirth?: Date | null
  currentExitDate?: Date | null
  isAdmin: boolean
}

export function EditEmployeeDatesDialog({
  userId,
  employeeName,
  currentStartDate,
  currentDateOfBirth,
  currentExitDate,
  isAdmin
}: EditEmployeeDatesDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const formatDateForInput = (date?: Date | null) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState({
    startDate: formatDateForInput(currentStartDate),
    dateOfBirth: formatDateForInput(currentDateOfBirth),
    exitDate: formatDateForInput(currentExitDate),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Only send dateOfBirth if user is admin
      const updateData: { startDate?: Date | null; dateOfBirth?: Date | null; exitDate?: Date | null } = {
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        exitDate: formData.exitDate ? new Date(formData.exitDate) : null,
      }

      // Only admins can update dateOfBirth
      if (isAdmin) {
        updateData.dateOfBirth = formData.dateOfBirth ? new Date(formData.dateOfBirth) : null
      }

      const result = await updateEmployeeDates(userId, updateData)

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Employee dates updated successfully',
        })
        setOpen(false)
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to update employee dates',
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1">
          <CalendarIcon className="h-4 w-4" />
          Edit Dates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee Dates</DialogTitle>
          <DialogDescription>
            {isAdmin
              ? `Update the employment start date, exit date, and date of birth for ${employeeName}.`
              : `Update the employment start date and exit date for ${employeeName}.`
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Date of Birth - Only visible to Admins */}
            {isAdmin && (
              <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
                <p className="text-xs text-gray-500">Used for automatic birthday event generation</p>
              </div>
            )}

            {/* Start Date - Visible to both Admins and Managers */}
            <div className="grid gap-2">
              <Label htmlFor="startDate">Employment Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <p className="text-xs text-gray-500">Used for work anniversary event generation</p>
            </div>

            {/* Exit Date - Visible to both Admins and Managers */}
            <div className="grid gap-2">
              <Label htmlFor="exitDate">Exit Date</Label>
              <Input
                id="exitDate"
                type="date"
                value={formData.exitDate}
                onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
              />
              <p className="text-xs text-gray-500">Date when employee left the company</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
