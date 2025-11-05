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

interface FoodSelectionFormProps {
  menu: WeeklyFoodMenuValues
  userId: string
  existingSelections?: Array<{
    dayOfWeek: string
    menuItemId: string | null
    notes: string | null
  }>
}

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const

const FoodSelectionForm = ({ menu, userId, existingSelections }: FoodSelectionFormProps) => {
  const { toast } = useToast()
  const [isSelectionOpen, setIsSelectionOpen] = useState(true)

  useEffect(() => {
    const now = new Date()
    const isOpen = now >= new Date(menu.selectionOpenDate) && now <= new Date(menu.selectionCloseDate)
    setIsSelectionOpen(isOpen)
  }, [menu.selectionOpenDate, menu.selectionCloseDate])

  // Group menu items by day
  const itemsByDay = menu.menuItems.reduce((acc, item) => {
    if (!acc[item.dayOfWeek]) {
      acc[item.dayOfWeek] = []
    }
    acc[item.dayOfWeek].push(item)
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

    try {
      const result = await createBulkFoodSelections(userId, menu.id!, values)

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
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{menu.vendor.name}</h2>
            <div className="space-y-1 text-sm text-gray-600">
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
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {isSelectionOpen ? 'Open for Selection' : 'Closed'}
            </span>
          </div>
        </div>

        {isDeadlineSoon && isSelectionOpen && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800 font-medium">
              Deadline approaching! Make your selections soon.
            </p>
          </div>
        )}
      </div>

      {!isSelectionOpen && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800 font-medium">
            Selection period has ended for this menu
          </p>
        </div>
      )}

      {/* Selection Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {DAYS_OF_WEEK.map((day, dayIndex) => {
            const dayItems = itemsByDay[day] || []

            if (dayItems.length === 0) return null

            return (
              <div key={day} className="border rounded-lg p-5 bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{day}</h3>

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
                          disabled={!isSelectionOpen}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a meal option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="null">No Selection</SelectItem>
                            {dayItems.map((item) => (
                              <SelectItem key={item.id} value={item.id!}>
                                {item.itemName}
                                {item.price && ` - ₦${item.price.toFixed(2)}`}
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
                        <FormLabel>Special Requests (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="E.g., No onions, extra pepper, etc."
                            className="resize-none"
                            rows={2}
                            disabled={!isSelectionOpen}
                          />
                        </FormControl>
                        <FormDescription>
                          Add any special dietary requirements or preferences
                        </FormDescription>
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
              <p className="text-sm text-gray-600 flex items-center">
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
