'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  updateEmployeeProfile,
  revalidateUserPath,
} from '@/lib/actions/users.action'
import { fetchDepartments } from '@/lib/actions/department.actions'
import { fetchClients } from '@/lib/actions/clients.actions'
import {
  editEmployeeFormSchema,
  editEmployeeEmptyValues,
  type EditEmployeeFormValues,
  type UserValues,
} from '@/lib/validation'
import { Calendar, Mail, Pencil, Phone, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

function sanitizePersonName(value: string) {
  return value.replace(/\d/g, '')
}

function sanitizePhoneInput(value: string) {
  return value.replace(/[^\d\s\-+().]/g, '')
}

function RequiredMark() {
  return (
    <span className="text-red-600 font-semibold leading-none" aria-hidden>
      *
    </span>
  )
}

function toYmd(d: Date | string | null | undefined): string {
  if (d == null) return ''
  const x = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(x.getTime())) return ''
  return x.toISOString().split('T')[0]
}

function defaultsFromEmployee(e: UserValues): EditEmployeeFormValues {
  const parts = (e.name || '').trim().split(/\s+/).filter(Boolean)
  const firstName = (e.firstName?.trim() || parts[0] || '').trim()
  const lastName = (
    e.lastName?.trim() ||
    (parts.length > 1 ? parts.slice(1).join(' ') : '')
  ).trim()

  const w = e.welfareContributionsBeforeExit
  return {
    firstName,
    lastName,
    phoneNumber: e.phoneNumber?.trim() || '',
    email: e.email?.trim() || '',
    clientId: e.clientId || '',
    department: e.department?.trim() || 'none',
    dateOfBirth: toYmd(e.dateOfBirth),
    startDate: toYmd(e.startDate),
    role: (e.role as EditEmployeeFormValues['role']) || 'EMPLOYEE',
    isActive: e.isActive ?? true,
    isContributor: e.isContributor ?? true,
    exitDate: toYmd(e.exitDate),
    welfareContributionsBeforeExit:
      w != null && !Number.isNaN(Number(w)) ? String(w) : '',
  }
}

type EditEmployeeDialogProps = {
  employee: UserValues | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditEmployeeDialog({
  employee,
  open,
  onOpenChange,
}: EditEmployeeDialogProps) {
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>(
    []
  )
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeFormSchema),
    defaultValues: editEmployeeEmptyValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    if (open) {
      void fetchDepartments().then((res) => {
        if (res.success && res.departments) {
          setDepartments(res.departments.map((d) => ({ id: d.id, name: d.name })))
        }
      })
      void fetchClients().then((res) => {
        if (res.success && res.clients) {
          setClients([...res.clients])
        }
      })
    }
  }, [open])

  useEffect(() => {
    if (open && employee) {
      form.reset(defaultsFromEmployee(employee))
    }
  }, [open, employee, form])

  const handleSubmit = async (values: EditEmployeeFormValues) => {
    if (!employee?.id) return
    setLoading(true)
    try {
      const result = await updateEmployeeProfile(employee.id, {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        clientId: values.clientId,
        department:
          values.department === 'none' || !values.department?.trim()
            ? undefined
            : values.department,
        dateOfBirth: values.dateOfBirth?.trim()
          ? new Date(values.dateOfBirth)
          : undefined,
        startDate: values.startDate?.trim()
          ? new Date(values.startDate)
          : undefined,
        role: values.role,
        isActive: values.isActive,
        isContributor: values.isContributor,
        exitDate: values.exitDate?.trim()
          ? new Date(values.exitDate)
          : undefined,
        welfareContributionsBeforeExit: values.welfareContributionsBeforeExit?.trim()
          ? parseFloat(values.welfareContributionsBeforeExit)
          : undefined,
      })

      if (result.success) {
        toast({
          title: 'Saved',
          description: result.emailChanged
            ? 'Email updated. A verification link was sent to the new address; previous sessions for this employee were signed out.'
            : 'Employee updated successfully.',
        })
        onOpenChange(false)
        revalidateUserPath('/admin/employees')
        router.refresh()
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to update employee',
        })
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong'
      toast({ variant: 'destructive', title: 'Error', description: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,920px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[700px]">
        <DialogHeader className="border-b border-border/60 px-6 py-4 text-left">
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit employee
          </DialogTitle>
          <DialogDescription>
            Update profile and email. Changing email clears verification until they
            confirm the new address, ends their sessions, and sends a new
            verification message. Google sign-in only works if their Google account
            uses the same email.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="inline-flex items-center gap-1">
                          First name
                          <RequiredMark />
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-11 rounded-lg"
                            leftIcon={<User className="h-4 w-4" />}
                            autoComplete="given-name"
                            inputMode="text"
                            {...field}
                            onChange={(e) =>
                              field.onChange(sanitizePersonName(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="inline-flex items-center gap-1">
                          Last name
                          <RequiredMark />
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-11 rounded-lg"
                            leftIcon={<User className="h-4 w-4" />}
                            autoComplete="family-name"
                            inputMode="text"
                            {...field}
                            onChange={(e) =>
                              field.onChange(sanitizePersonName(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="inline-flex items-center gap-1">
                        Phone number
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          className="h-11 rounded-lg"
                          leftIcon={<Phone className="h-4 w-4" />}
                          autoComplete="tel"
                          inputMode="tel"
                          {...field}
                          onChange={(e) =>
                            field.onChange(sanitizePhoneInput(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="inline-flex items-center gap-1">
                        Work email
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          className="h-11 rounded-lg"
                          leftIcon={<Mail className="h-4 w-4" />}
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="inline-flex items-center gap-1">
                        Client
                        <RequiredMark />
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="inline-flex items-center gap-1">
                        Date of Birth
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="h-11 rounded-lg"
                          rightIcon={<Calendar className="h-4 w-4" />}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="inline-flex items-center gap-1">
                        Employment Start Date
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="h-11 rounded-lg"
                          rightIcon={<Calendar className="h-4 w-4" />}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EMPLOYEE">Employee</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="FOOD_COMMITTEE">
                            Food Committee
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <FormLabel className="!mt-0">Active Employee</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isContributor"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <FormLabel className="!mt-0">
                        Contributing to Welfare Fund
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!form.watch('isActive') && (
                  <>
                    <FormField
                      control={form.control}
                      name="exitDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="inline-flex items-center gap-1">
                            Exit Date
                            <RequiredMark />
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="h-11 rounded-lg"
                              rightIcon={<Calendar className="h-4 w-4" />}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="welfareContributionsBeforeExit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Total Welfare Contributions Before Exit
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              className="h-11 rounded-lg"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </div>
            <DialogFooter className="border-t border-border/60 bg-muted/30 px-6 py-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
