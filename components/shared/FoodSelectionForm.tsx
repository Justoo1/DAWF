"use client"

import { BulkFoodSelectionCreateSchema } from '@/lib/validation'
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
  FormDescription
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from '@/hooks/use-toast'
import { createBulkFoodSelections } from '@/lib/actions/foodSelection.actions'
import { useState, useEffect } from 'react'
import { WeeklyFoodMenuValues, FoodMenuItemValues } from '@/lib/validation'
import { Calendar, Clock } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface FoodSelectionFormProps {
  menu: WeeklyFoodMenuValues
  userId: string
  existingSelections?: Array<{
    dayOfWeek: string
    menuItemId: string | null
    notes: string | null
  }>
  approvedLeaves?: Array<{
    startDate: Date
    endDate: Date
  }>
}

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const

const FoodSelectionForm = ({ menu, userId, existingSelections, approvedLeaves = [] }: FoodSelectionFormProps) => {
  const { toast } = useToast()
  const [isSelectionOpen, setIsSelectionOpen] = useState(true)
  const [showSpecialOrders, setShowSpecialOrders] = useState(false)

  useEffect(() => {
    const now = new Date()
    const isOpen = now >= new Date(menu.selectionOpenDate) && now <= new Date(menu.selectionCloseDate)
    setIsSelectionOpen(isOpen)
  }, [menu.selectionOpenDate, menu.selectionCloseDate])

  // Helper to check if a day is on leave
  const checkIsOnLeave = (day: typeof DAYS_OF_WEEK[number]) => {
    const dayIndex = DAYS_OF_WEEK.indexOf(day)
    const weekStart = new Date(menu.weekStartDate)
    const targetDate = new Date(weekStart)
    targetDate.setDate(weekStart.getDate() + dayIndex)
    // Clear time for date-only comparison
    targetDate.setHours(0, 0, 0, 0)

    return approvedLeaves.some(leave => {
      const start = new Date(leave.startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(leave.endDate)
      end.setHours(23, 59, 59, 999)
      return targetDate >= start && targetDate <= end
    })
  }

  // Group menu items by day and filter by special order preference
  const itemsByDay = menu.menuItems.reduce((acc, item) => {
    // Filter based on showSpecialOrders toggle
    const itemFood = item.food
    const isSpecialOrderItem = itemFood?.isSpecialOrder || false

    // Only include items that match the current filter
    if (isSpecialOrderItem === showSpecialOrders) {
      if (!acc[item.dayOfWeek]) {
        acc[item.dayOfWeek] = []
      }
      acc[item.dayOfWeek].push(item)
    }
    return acc
  }, {} as Record<string, FoodMenuItemValues[]>)

  // Prepare default values from existing selections
  const defaultSelections = DAYS_OF_WEEK.map((day) => {
    const existing = existingSelections?.find((s) => s.dayOfWeek === day)
    return {
      dayOfWeek: day,
      menuItemId: existing?.menuItemId || null,
      notes: existing?.notes || ''
    }
  })

  const form = useForm<z.infer<typeof BulkFoodSelectionCreateSchema>>({
    resolver: zodResolver(BulkFoodSelectionCreateSchema),
    defaultValues: {
      menuId: menu.id!,
      selections: defaultSelections
    }
  })

  async function onSubmit(values: z.infer<typeof BulkFoodSelectionCreateSchema>) {
    if (!isSelectionOpen) {
      toast({
        variant: 'destructive',
        title: 'Selection Closed',
        description: 'The selection period has ended'
      })
      return
    }

    // Filter out selections for days on leave just in case
    const filteredSelections = values.selections.map(s => {
        if (checkIsOnLeave(s.dayOfWeek)) {
            return { ...s, menuItemId: null, notes: 'ON LEAVE' }
        }
        return s
    })

    try {
      const result = await createBulkFoodSelections(userId, menu.id!, { ...values, selections: filteredSelections })

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error
        })
      } else {
        toast({
          title: 'Success',
          description: 'Your food selections have been saved!'
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong'
      })
      console.error(error)
    }
  }

  const deadlineDate = new Date(menu.selectionCloseDate)
  const isDeadlineSoon = (deadlineDate.getTime() - Date.now()) < 24 * 60 * 60 * 1000

  return (
    <div className="space-y-6">
      {/* Menu Information Card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800/30">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 dark:text-zinc-100">{menu.vendor.name}</h2>
            <div className="space-y-1 text-sm text-gray-600 dark:text-zinc-400">
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Week: {new Date(menu.weekStartDate).toLocaleDateString()} - {new Date(menu.weekEndDate).toLocaleDateString()}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Deadline: {deadlineDate.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                isSelectionOpen
                  ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
              }`}
            >
              {isSelectionOpen ? 'Open for Selection' : 'Closed'}
            </span>
          </div>
        </div>

        {isDeadlineSoon && isSelectionOpen && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3 dark:bg-yellow-950/20 dark:border-yellow-800/30">
            <p className="text-sm text-yellow-800 font-medium dark:text-yellow-400">
              Deadline approaching! Make your selections soon.
            </p>
          </div>
        )}
      </div>

      {/* Special Order Toggle */}
      <div className="bg-white border rounded-lg p-4 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="special-order-toggle" className="text-base font-medium">
              {showSpecialOrders ? 'Special Orders' : 'Regular Orders'}
            </Label>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {showSpecialOrders
                ? 'Showing special dietary options (e.g., veggie-only meals)'
                : 'Showing regular menu items'}
            </p>
          </div>
          <Switch
            id="special-order-toggle"
            checked={showSpecialOrders}
            onCheckedChange={setShowSpecialOrders}
            disabled={!isSelectionOpen}
          />
        </div>
      </div>

      {!isSelectionOpen && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center dark:bg-red-950/20 dark:border-red-800/30">
          <p className="text-red-800 font-medium dark:text-red-400">
            Selection period has ended for this menu
          </p>
        </div>
      )}

      {/* Selection Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {DAYS_OF_WEEK.map((day, dayIndex) => {
            const dayItems = itemsByDay[day] || []
            const isOnLeave = checkIsOnLeave(day)

            if (dayItems.length === 0 && !isOnLeave) return null

            return (
              <div key={day} className={`border rounded-lg p-5 bg-white shadow-sm transition-opacity dark:bg-zinc-900 dark:border-zinc-800 ${isOnLeave ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-zinc-100">{day}</h3>
                  {isOnLeave && (
                    <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/30">
                      On Leave
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`selections.${dayIndex}.menuItemId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Your Meal</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || undefined}
                          disabled={!isSelectionOpen || isOnLeave}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isOnLeave ? "Restricted during leave" : "Choose a meal option"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="null">No Selection</SelectItem>
                            {dayItems.map((item) => (
                              <SelectItem key={item.id} value={item.id!}>
                                {item.itemName}
                                {item.price && ` - ₵${item.price.toFixed(2)}`}
                                {item.description && (
                                  <span className="text-xs text-gray-500 dark:text-zinc-400 block">
                                    {item.description}
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isOnLeave && (
                          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-1.5 flex items-center gap-1.5">
                             Selection is disabled as you have an approved leave for this day.
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`selections.${dayIndex}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={isOnLeave ? "Disabled on leave" : "E.g., No onions, extra pepper, etc."}
                            className="resize-none"
                            rows={2}
                            disabled={!isSelectionOpen || isOnLeave}
                          />
                        </FormControl>
                        {!isOnLeave && (
                          <FormDescription>
                            Add any special dietary requirements or preferences
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )
          })}

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || !isSelectionOpen}
              className="min-w-[150px]"
            >
              {form.formState.isSubmitting
                ? 'Saving...'
                : existingSelections && existingSelections.length > 0
                ? 'Update Selections'
                : 'Save Selections'
              }
            </Button>
            {existingSelections && existingSelections.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-zinc-400 flex items-center">
                You can update your selections until the deadline
              </p>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}

export default FoodSelectionForm
