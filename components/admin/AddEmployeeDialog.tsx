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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { createEmployee } from "@/lib/actions/users.action"
import { fetchDepartments } from "@/lib/actions/department.actions"
import { PlusCircle } from "lucide-react"
import { useEffect } from 'react'

export function AddEmployeeDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    dateOfBirth: '',
    startDate: '',
    role: 'EMPLOYEE',
    isActive: true,
    isContributor: true,
    exitDate: '',
    welfareContributionsBeforeExit: '',
  })

  useEffect(() => {
    if (open) {
      fetchDepartments().then(res => {
        if (res.success && res.departments) {
          setDepartments(res.departments.map(d => ({ id: d.id, name: d.name })));
        }
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createEmployee({
        name: formData.name,
        email: formData.email,
        department: (formData.department === "none" || !formData.department) ? undefined : formData.department,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        role: formData.role,
        isActive: formData.isActive,
        isContributor: formData.isContributor,
        exitDate: formData.exitDate ? new Date(formData.exitDate) : undefined,
        welfareContributionsBeforeExit: formData.welfareContributionsBeforeExit
          ? parseFloat(formData.welfareContributionsBeforeExit)
          : undefined,
      })

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Employee added successfully',
        })
        setOpen(false)
        // Reset form
        setFormData({
          name: '',
          email: '',
          department: '',
          dateOfBirth: '',
          startDate: '',
          role: 'EMPLOYEE',
          isActive: true,
          isContributor: true,
          exitDate: '',
          welfareContributionsBeforeExit: '',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to add employee',
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
        <Button className="gap-2 shadow-sm">
          <PlusCircle className="h-4 w-4" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(90vh,920px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[700px]">
        <DialogHeader className="border-b border-border/60 px-6 py-4 text-left">
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Manually add an employee record. This is useful for employees who have left the company
            and no longer have access to register themselves.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                className="h-11 rounded-lg"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                className="h-11 rounded-lg"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@example.com"
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger className="h-11 rounded-lg">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                className="h-11 rounded-lg"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Used for automatic birthday event generation</p>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Employment Start Date</Label>
              <Input
                id="startDate"
                type="date"
                className="h-11 rounded-lg"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Used for work anniversary event generation</p>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="h-11 rounded-lg">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="FOOD_COMMITTEE">Food Committee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active Employee</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            {/* Contributor Status */}
            <div className="flex items-center justify-between">
              <Label htmlFor="isContributor">Contributing to Welfare Fund</Label>
              <Switch
                id="isContributor"
                checked={formData.isContributor}
                onCheckedChange={(checked) => setFormData({ ...formData, isContributor: checked })}
              />
            </div>

            {/* Exit Date (for inactive employees) */}
            {!formData.isActive && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="exitDate">Exit Date</Label>
                  <Input
                    id="exitDate"
                    type="date"
                    className="h-11 rounded-lg"
                    value={formData.exitDate}
                    onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welfareContributions">Total Welfare Contributions Before Exit</Label>
                  <Input
                    id="welfareContributions"
                    type="number"
                    step="0.01"
                    min="0"
                    className="h-11 rounded-lg"
                    value={formData.welfareContributionsBeforeExit}
                    onChange={(e) => setFormData({ ...formData, welfareContributionsBeforeExit: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </>
            )}
            </div>
          </div>
          <DialogFooter className="border-t border-border/60 bg-muted/30 px-6 py-4 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
