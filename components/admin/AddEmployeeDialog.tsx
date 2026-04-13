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
import { fetchClients } from "@/lib/actions/clients.actions"
import { Calendar, Mail, Phone, PlusCircle, User } from "lucide-react"
import { useEffect } from 'react'

export function AddEmployeeDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([])
  const [clients, setClients] = useState<{id: string, name: string}[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    clientId: '',
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
      fetchClients().then(res => {
        if (res.success && res.clients) {
          setClients([...res.clients]);
        }
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createEmployee({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        clientId: formData.clientId,
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
          description: 'Employee added. A verification email has been sent.',
        })
        setOpen(false)
        setFormData({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          email: '',
          clientId: '',
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
            Create an employee record and assign a client. The employee will receive an email to verify their address before they can use the app.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name *</Label>
                <Input
                  id="firstName"
                  required
                  className="h-11 rounded-lg"
                  leftIcon={<User className="h-4 w-4" />}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Jane"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name *</Label>
                <Input
                  id="lastName"
                  required
                  className="h-11 rounded-lg"
                  leftIcon={<User className="h-4 w-4" />}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                required
                className="h-11 rounded-lg"
                leftIcon={<Phone className="h-4 w-4" />}
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+233 …"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                className="h-11 rounded-lg"
                leftIcon={<Mail className="h-4 w-4" />}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane.doe@devopsafricalimited.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select
                required
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
                <SelectTrigger className="h-11 rounded-lg">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                className="h-11 rounded-lg"
                rightIcon={<Calendar className="h-4 w-4" />}
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Used for automatic birthday event generation</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Employment Start Date</Label>
              <Input
                id="startDate"
                type="date"
                className="h-11 rounded-lg"
                rightIcon={<Calendar className="h-4 w-4" />}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Used for work anniversary event generation</p>
            </div>

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

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active Employee</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isContributor">Contributing to Welfare Fund</Label>
              <Switch
                id="isContributor"
                checked={formData.isContributor}
                onCheckedChange={(checked) => setFormData({ ...formData, isContributor: checked })}
              />
            </div>

            {!formData.isActive && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="exitDate">Exit Date</Label>
                  <Input
                    id="exitDate"
                    type="date"
                    className="h-11 rounded-lg"
                    rightIcon={<Calendar className="h-4 w-4" />}
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
            <Button type="submit" disabled={loading || !formData.clientId}>
              {loading ? 'Adding...' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
