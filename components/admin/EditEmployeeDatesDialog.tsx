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
import { RequiredMark } from "@/components/ui/required-mark"
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
        <Button
          type="button"
          variant="ghost"
          className="h-9 w-full justify-start gap-2 rounded-lg px-2 text-sm font-medium text-popover-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <CalendarIcon className="h-4 w-4 shrink-0" aria-hidden />
          Edit dates
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(90vh,920px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[500px]">
        <DialogHeader className="border-b border-border/60 px-6 py-4 text-left">
          <DialogTitle>Edit Employee Dates</DialogTitle>
          <DialogDescription>
            {isAdmin
              ? `Update the employment start date, exit date, and date of birth for ${employeeName}.`
              : `Update the employment start date and exit date for ${employeeName}.`
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <div className="grid gap-4">
              {/* Date of Birth - Only visible to Admins */}
              {isAdmin && (
                <div className="grid gap-2">
                  <Label htmlFor="dateOfBirth" className="inline-flex items-center gap-1">
                    Date of Birth
                    <RequiredMark />
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    className="h-11 rounded-lg"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Used for automatic birthday event generation</p>
                </div>
              )}

              {/* Start Date - Visible to both Admins and Managers */}
              <div className="grid gap-2">
                <Label htmlFor="startDate" className="inline-flex items-center gap-1">
                  Employment Start Date
                  <RequiredMark />
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  className="h-11 rounded-lg"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Used for work anniversary event generation</p>
              </div>

              {/* Exit Date - Visible to both Admins and Managers */}
              <div className="grid gap-2">
                <Label htmlFor="exitDate">Exit Date</Label>
                <Input
                  id="exitDate"
                  type="date"
                  className="h-11 rounded-lg"
                  value={formData.exitDate}
                  onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Date when employee left the company</p>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-border/60 bg-muted/30 px-6 py-4 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 shadow-sm">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
