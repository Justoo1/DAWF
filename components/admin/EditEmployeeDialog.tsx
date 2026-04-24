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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
import { Calendar, Info, Mail, Pencil, Phone, User } from 'lucide-react'
import { RequiredMark } from '@/components/ui/required-mark'
import { useRouter } from 'next/navigation'
import {
  EmployeeSaveSuccessDialog,
  type EmployeeSaveSummary,
} from '@/components/admin/EmployeeSaveSuccessDialog'
import { EmailVerificationSentDialog } from '@/components/admin/EmailVerificationSentDialog'
import { buildEmployeeSaveSummary } from '@/components/admin/build-employee-save-summary'
import { EDIT_EMPLOYEE_EMAIL_CHANGE_DETAILS } from '@/lib/admin-employee-copy'

function sanitizePersonName(value: string) {
  return value.replace(/\d/g, '')
}

function sanitizePhoneInput(value: string) {
  return value.replace(/[^\d\s\-+().]/g, '')
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
    employmentType: e.employmentType ?? 'FULL_TIME',
    isActive: e.isActive ?? true,
    isContributor:
      e.employmentType === 'CONTRACT'
        ? false
        : (e.isContributor ?? true),
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
  const [departments, setDepartments] = useState<
    { id: string; name: string; clientId: string; clientName: string | null }[]
  >([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [clientsReady, setClientsReady] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [successSummary, setSuccessSummary] = useState<EmployeeSaveSummary | null>(
    null
  )
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState<string | null>(
    null
  )
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [verifyDialogEmail, setVerifyDialogEmail] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeFormSchema),
    defaultValues: editEmployeeEmptyValues,
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
        setDepartments(
          res.departments.map((d) => ({
            id: d.id,
            name: d.name,
            clientId: d.clientId,
            clientName: d.clientName,
          }))
        )
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

  /** Only active clients are listed; clear field if current assignment is inactive. */
  useEffect(() => {
    if (!open || !clientsReady) return
    const cid = form.getValues('clientId')
    if (cid && !clients.some((c) => c.id === cid)) {
      form.setValue('clientId', '', { shouldValidate: true })
    }
  }, [open, clients, clientsReady, form])

  useEffect(() => {
    if (open && employee) {
      form.reset(defaultsFromEmployee(employee))
    }
  }, [open, employee, form])

  /** Keep client in sync with department when department list is loaded. */
  useEffect(() => {
    if (!open || departments.length === 0) return
    const dep = form.getValues('department')
    if (dep && dep !== 'none') {
      const d = departments.find((x) => x.name === dep)
      if (d) {
        form.setValue('clientId', d.clientId, { shouldValidate: true })
      }
    }
  }, [open, departments, form])

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
        employmentType: values.employmentType,
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
          clients.find((c) => c.id === values.clientId)?.name ?? '—'
        setSuccessSummary(buildEmployeeSaveSummary(values, clientName))
        setPendingVerifyEmail(
          result.emailChanged ? values.email.trim() : null
        )
        setSuccessOpen(true)
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

  const watchedEmail = form.watch('email')
  const emailChangePending =
    !!employee &&
    watchedEmail?.trim().toLowerCase() !==
      employee.email?.trim().toLowerCase()

  return (
    <>
      <EmployeeSaveSuccessDialog
        open={successOpen}
        onOpenChange={(v) => {
          setSuccessOpen(v)
          if (!v) {
            setSuccessSummary(null)
            const next = pendingVerifyEmail
            setPendingVerifyEmail(null)
            if (next) {
              setVerifyDialogEmail(next)
              setVerifyDialogOpen(true)
            }
          }
        }}
        variant="edit"
        summary={successSummary}
      />
      <EmailVerificationSentDialog
        open={verifyDialogOpen}
        onOpenChange={(v) => {
          setVerifyDialogOpen(v)
          if (!v) setVerifyDialogEmail('')
        }}
        email={verifyDialogEmail}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,920px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[700px]">
        <DialogHeader className="border-b border-border/60 px-6 py-4 text-left">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit employee
            </DialogTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-fit shrink-0 gap-1.5 text-xs"
                >
                  <Info className="h-3.5 w-3.5" />
                  About email updates
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm leading-relaxed" align="end">
                <p>{EDIT_EMPLOYEE_EMAIL_CHANGE_DETAILS}</p>
              </PopoverContent>
            </Popover>
          </div>
          <DialogDescription>
            Update employee details and work email.
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
                      {emailChangePending ? (
                        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
                          You are changing this person&apos;s email. After you save,
                          we will send a verification link to the new address and
                          sign them out everywhere until they confirm it.
                        </p>
                      ) : null}
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
                        onValueChange={(v) => {
                          field.onChange(v)
                          if (v === 'none' || !v) {
                            form.setValue('clientId', '', {
                              shouldValidate: true,
                            })
                          } else {
                            const d = departments.find((x) => x.name === v)
                            if (d) {
                              form.setValue('clientId', d.clientId, {
                                shouldValidate: true,
                              })
                            }
                          }
                        }}
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
                              {dept.clientName
                                ? `${dept.name} (${dept.clientName})`
                                : dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Choosing a department sets the client automatically.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => {
                    const deptName = form.watch('department')
                    const fromDept =
                      deptName && deptName !== 'none'
                        ? departments.find((d) => d.name === deptName)
                        : undefined
                    const displayName =
                      clients.find((c) => c.id === field.value)?.name ??
                      fromDept?.clientName ??
                      ''

                    return (
                      <FormItem>
                        <FormLabel className="inline-flex items-center gap-1">
                          Client
                          <RequiredMark />
                        </FormLabel>
                        {fromDept ? (
                          <FormControl>
                            <Input
                              readOnly
                              disabled
                              value={displayName}
                              className="h-11 cursor-not-allowed rounded-lg bg-muted text-muted-foreground"
                              aria-readonly
                            />
                          </FormControl>
                        ) : (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
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
                        )}
                        {fromDept ? (
                          <p className="text-xs text-muted-foreground">
                            Client is determined by the department you selected.
                          </p>
                        ) : null}
                        <FormMessage />
                      </FormItem>
                    )
                  }}
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
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="inline-flex items-center gap-1">
                        Employment type
                        <RequiredMark />
                      </FormLabel>
                      <Select
                        onValueChange={(v) => {
                          field.onChange(v)
                          if (v === "CONTRACT") {
                            form.setValue("isContributor", false, {
                              shouldValidate: true,
                            })
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FULL_TIME">Full time</SelectItem>
                          <SelectItem value="CONTRACT">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Contract employees are not eligible for welfare fund
                        contributions.
                      </p>
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
                      <div className="space-y-1 pr-4">
                        <FormLabel className="!mt-0">
                          Contributing to Welfare Fund
                        </FormLabel>
                        {form.watch("employmentType") === "CONTRACT" ? (
                          <p className="text-xs text-muted-foreground">
                            Not applicable for contract staff.
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Full-time employees may opt out of contributions.
                          </p>
                        )}
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={
                            form.watch("employmentType") === "CONTRACT"
                          }
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
                          <FormLabel>Exit Date (optional)</FormLabel>
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
    </>
  )
}
