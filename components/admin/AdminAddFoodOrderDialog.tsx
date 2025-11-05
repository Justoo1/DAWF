"use client"

import { useState, useEffect } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from '@/hooks/use-toast'
import { UserPlus, Loader2, Check, ChevronsUpDown, X } from 'lucide-react'
import { WeeklyFoodMenuValues, FoodMenuItemValues } from '@/lib/validation'
import { cn } from "@/lib/utils"

interface Employee {
  id: string
  name: string
  email: string
  department: string | null
}

interface AdminAddFoodOrderDialogProps {
  menu: WeeklyFoodMenuValues
}

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const

const AdminFoodSelectionSchema = z.object({
  targetUserId: z.string().min(1, 'Please select an employee'),
  menuId: z.string(),
  selections: z.array(z.object({
    dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']),
    menuItemId: z.string().nullable(),
    notes: z.string().optional()
  }))
})

const AdminAddFoodOrderDialog = ({ menu }: AdminAddFoodOrderDialogProps) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeesWithoutSelections, setEmployeesWithoutSelections] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)

  // Group menu items by day
  const itemsByDay = menu.menuItems.reduce((acc, item) => {
    if (!acc[item.dayOfWeek]) {
      acc[item.dayOfWeek] = []
    }
    acc[item.dayOfWeek].push(item)
    return acc
  }, {} as Record<string, FoodMenuItemValues[]>)

  const defaultSelections = DAYS_OF_WEEK.map((day) => ({
    dayOfWeek: day,
    menuItemId: null,
    notes: ''
  }))

  const form = useForm<z.infer<typeof AdminFoodSelectionSchema>>({
    resolver: zodResolver(AdminFoodSelectionSchema),
    defaultValues: {
      targetUserId: '',
      menuId: menu.id!,
      selections: defaultSelections
    }
  })

  // Fetch employees when dialog opens
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true)
      try {
        const response = await fetch(`/api/food-orders/admin-add?menuId=${menu.id}`)
        if (response.ok) {
          const data = await response.json()
          setEmployees(data.allUsers || [])
          setEmployeesWithoutSelections(data.users || [])
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load employees'
          })
        }
      } catch (error) {
        console.error('Error fetching employees:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load employees'
        })
      } finally {
        setLoadingEmployees(false)
      }
    }

    if (open) {
      fetchEmployees()
    }
  }, [open, menu.id, toast])

  async function onSubmit(values: z.infer<typeof AdminFoodSelectionSchema>) {
    try {
      const response = await fetch('/api/food-orders/admin-add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to save selections'
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Food selections have been added successfully!'
      })

      setOpen(false)
      form.reset()

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error submitting:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong'
      })
    }
  }

  return (
    <>
      <Button variant="default" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4 mr-2" />
        Add Order for Employee
      </Button>

      {/* Slide-over Panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setOpen(false)}
          />

          {/* Slide-over Content */}
          <div className="fixed inset-y-0 right-0 w-full max-w-3xl bg-white shadow-xl z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-start justify-between z-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add Food Order for Employee</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Select an employee and their food choices for the week. This is useful for employees who forgot to select or cannot access the app.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {loadingEmployees ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Employee Selection */}
              <FormField
                control={form.control}
                name="targetUserId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select Employee</FormLabel>
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen} modal={false}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={comboboxOpen}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? employees.find((emp) => emp.id === field.value)?.name +
                                (employees.find((emp) => emp.id === field.value)?.department
                                  ? ` (${employees.find((emp) => emp.id === field.value)?.department})`
                                  : '')
                              : "Search and select employee..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[500px] p-0"
                        align="start"
                        style={{ zIndex: 9999 }}
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search employee by name or department..."
                          />
                          <CommandList>
                            <CommandEmpty>No employee found.</CommandEmpty>

                            {employeesWithoutSelections.length > 0 && (
                              <CommandGroup heading="Employees without selections">
                                {employeesWithoutSelections.map((emp) => (
                                  <CommandItem
                                    key={emp.id}
                                    value={`${emp.name} ${emp.department || ''} ${emp.id}`}
                                    onSelect={(currentValue) => {
                                      const selectedEmployee = employeesWithoutSelections.find(
                                        e => `${e.name} ${e.department || ''} ${e.id}`.toLowerCase() === currentValue.toLowerCase()
                                      )
                                      if (selectedEmployee) {
                                        form.setValue("targetUserId", selectedEmployee.id)
                                        setComboboxOpen(false)
                                      }
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        emp.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{emp.name}</span>
                                      {emp.department && (
                                        <span className="text-xs text-muted-foreground">
                                          {emp.department}
                                        </span>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}

                            {employees.length > 0 && (
                              <CommandGroup heading="All employees">
                                {employees.map((emp) => (
                                  <CommandItem
                                    key={emp.id}
                                    value={`${emp.name} ${emp.department || ''} ${emp.id}`}
                                    onSelect={(currentValue) => {
                                      const selectedEmployee = employees.find(
                                        e => `${e.name} ${e.department || ''} ${e.id}`.toLowerCase() === currentValue.toLowerCase()
                                      )
                                      if (selectedEmployee) {
                                        form.setValue("targetUserId", selectedEmployee.id)
                                        setComboboxOpen(false)
                                      }
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        emp.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{emp.name}</span>
                                      {emp.department && (
                                        <span className="text-xs text-muted-foreground">
                                          {emp.department}
                                        </span>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Search by name or department to quickly find an employee
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Daily Selections */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-700">Weekly Food Selections</h3>
                {DAYS_OF_WEEK.map((day, dayIndex) => {
                  const dayItems = itemsByDay[day] || []
                  if (dayItems.length === 0) return null

                  return (
                    <div key={day} className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium mb-3 text-gray-800">{day}</h4>

                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name={`selections.${dayIndex}.menuItemId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Meal Selection</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || undefined}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a meal" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="null">No Selection</SelectItem>
                                  {dayItems.map((item) => (
                                    <SelectItem key={item.id} value={item.id!}>
                                      {item.itemName}
                                      {item.description && (
                                        <span className="text-xs text-gray-500 block">
                                          {item.description}
                                        </span>
                                      )}
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
                          name={`selections.${dayIndex}.notes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Any special requests..."
                                  className="resize-none"
                                  rows={2}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="min-w-[120px]"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Selections'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
              </div>
          </form>
        </Form>
      )}
    </div>
  </div>
        </>
      )}
    </>
  )
}

export default AdminAddFoodOrderDialog
