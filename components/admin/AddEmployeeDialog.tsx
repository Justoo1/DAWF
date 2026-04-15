'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
import {
  addEmployeeDefaultValues,
  addEmployeeFormSchema,
  type AddEmployeeFormValues,
} from "@/lib/validation"
import { Calendar, Mail, Phone, PlusCircle, User } from "lucide-react"
import { RequiredMark } from "@/components/ui/required-mark"
import {
  EmployeeSaveSuccessDialog,
  type EmployeeSaveSummary,
} from "@/components/admin/EmployeeSaveSuccessDialog"
import { buildEmployeeSaveSummary } from "@/components/admin/build-employee-save-summary"

/** Strip digits so names stay letters-only (allows spaces, hyphens, apostrophes, unicode letters). */
function sanitizePersonName(value: string) {
  return value.replace(/\d/g, "")
}

/** Keep only characters allowed by phone validation: digits, space, + - ( ) . */
function sanitizePhoneInput(value: string) {
  return value.replace(/[^\d\s\-+().]/g, "")
}

export function AddEmployeeDialog() {
  const [open, setOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [successSummary, setSuccessSummary] = useState<EmployeeSaveSummary | null>(
    null
  )
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [clientsReady, setClientsReady] = useState(false)
  const { toast } = useToast()

  const form = useForm<AddEmployeeFormValues>({
    resolver: zodResolver(addEmployeeFormSchema),
    defaultValues: addEmployeeDefaultValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    if (!open) {
      setClientsReady(false)
      return
    }
    setClientsReady(false)
    void fetchDepartments().then((res) => {
      if (res.success && res.departments) {
        setDepartments(res.departments.map((d) => ({ id: d.id, name: d.name })))
      } else {
        setDepartments([])
      }
    })
    void fetchClients().then((res) => {
      const next =
        res.success && res.clients ? [...res.clients] : []
      setClients(next)
      setClientsReady(true)
    })
  }, [open])

  /** Drop selection if it is not an active client (e.g. stale UI or client was disabled). */
  useEffect(() => {
    if (!open || !clientsReady) return
    const cid = form.getValues('clientId')
    if (cid && !clients.some((c) => c.id === cid)) {
      form.setValue('clientId', '', { shouldValidate: true })
    }
  }, [open, clients, clientsReady, form])

  const handleSubmit = async (values: AddEmployeeFormValues) => {
    setLoading(true)
    try {
      const result = await createEmployee({
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        email: values.email,
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
        const clientName =
          clients.find((c) => c.id === values.clientId)?.name ?? "—"
        setSuccessSummary(buildEmployeeSaveSummary(values, clientName))
        setOpen(false)
        form.reset(addEmployeeDefaultValues)
        setSuccessOpen(true)
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
      <EmployeeSaveSuccessDialog
        open={successOpen}
        onOpenChange={(v) => {
          setSuccessOpen(v)
          if (!v) {
            setSuccessSummary(null)
          }
        }}
        variant="add"
        summary={successSummary}
      />

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) {
            form.reset(addEmployeeDefaultValues)
          }
        }}
      >
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
              Create an employee record and assign a client. They sign in with Google using this
              work email once their account is saved (same email as in Google Workspace).
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}
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
                              placeholder="Jane"
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
                              placeholder="Doe"
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
                            placeholder="+233 …"
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
                          Email
                          <RequiredMark />
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            className="h-11 rounded-lg"
                            leftIcon={<Mail className="h-4 w-4" />}
                            placeholder="jane.doe@company.com"
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
                        <Select onValueChange={field.onChange} value={field.value || ''}>
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
                        <p className="text-xs text-muted-foreground">Used for automatic birthday event generation</p>
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
                        <p className="text-xs text-muted-foreground">Used for work anniversary event generation</p>
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
                            <SelectItem value="FOOD_COMMITTEE">Food Committee</SelectItem>
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
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isContributor"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <FormLabel className="!mt-0">Contributing to Welfare Fund</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                            <FormLabel>Total Welfare Contributions Before Exit</FormLabel>
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
                  onClick={() => {
                    setOpen(false)
                    form.reset(addEmployeeDefaultValues)
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Employee'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
