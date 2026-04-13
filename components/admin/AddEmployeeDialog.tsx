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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  const [revealPasswordOpen, setRevealPasswordOpen] = useState(false)
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([])
  const [clients, setClients] = useState<{id: string, name: string}[]>([])
  const { toast } = useToast()

  const [generateInitialPassword, setGenerateInitialPassword] = useState(false)
  const [initialPassword, setInitialPassword] = useState('')

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

  const resetFormFields = () => {
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
    setGenerateInitialPassword(false)
    setInitialPassword('')
  }

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
    if (!generateInitialPassword && initialPassword.trim() && initialPassword.trim().length < 8) {
      toast({
        variant: 'destructive',
        title: 'Invalid password',
        description: 'Initial password must be at least 8 characters, or clear the field.',
      })
      return
    }
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
        generateInitialPassword,
        initialPassword: generateInitialPassword ? undefined : (initialPassword.trim() || undefined),
      })

      if (result.success) {
        setOpen(false)
        if (result.generatedPassword) {
          setRevealedPassword(result.generatedPassword)
          setRevealPasswordOpen(true)
        } else {
          toast({
            title: 'Success',
            description: 'Employee added. A verification email has been sent.',
          })
        }
        resetFormFields()
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
    <>
    <AlertDialog open={revealPasswordOpen} onOpenChange={(v) => {
      setRevealPasswordOpen(v)
      if (!v) setRevealedPassword(null)
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Temporary password (copy now)</AlertDialogTitle>
          <AlertDialogDescription>
            This password is shown only once. Share it with the employee through a secure channel.
            They will choose a new password after they verify their email and sign in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-md bg-muted px-3 py-2 font-mono text-sm break-all">
          {revealedPassword}
        </div>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (revealedPassword) {
                void navigator.clipboard.writeText(revealedPassword)
                toast({ title: 'Copied to clipboard' })
              }
            }}
          >
            Copy password
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

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
            Create an employee record and assign a client. They receive a verification email. You can set an initial password or generate one; otherwise they set a password from the email link.
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

            <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label htmlFor="generate-password" className="text-base">Generate temporary password</Label>
                <p className="text-xs text-muted-foreground max-w-md">
                  Creates a short random password to share with the employee. They must set a new password after first sign-in.
                </p>
              </div>
              <Switch
                id="generate-password"
                checked={generateInitialPassword}
                onCheckedChange={(checked) => {
                  setGenerateInitialPassword(checked)
                  if (checked) setInitialPassword('')
                }}
              />
            </div>

            {!generateInitialPassword && (
              <div className="space-y-2">
                <Label htmlFor="initial-password">Initial password (optional)</Label>
                <Input
                  id="initial-password"
                  type="password"
                  autoComplete="new-password"
                  className="h-11 rounded-lg"
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={initialPassword.trim() ? 8 : undefined}
                />
                <p className="text-xs text-muted-foreground">
                  If set, the employee uses this until they choose a new one. Leave empty if they will set a password only from the verification email.
                </p>
              </div>
            )}

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
    </>
  )
}
