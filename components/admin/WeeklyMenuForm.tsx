"use client"

import { WeeklyFoodMenuCreateSchema } from '@/lib/validation'
import { useForm, useFieldArray } from "react-hook-form"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast'
import { createFoodMenu, updateFoodMenu } from '@/lib/actions/foodMenu.actions'
import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FoodVendorValues } from '@/lib/validation'

interface MenuData {
  id: string
  vendorId: string
  weekStartDate: Date
  weekEndDate: Date
  selectionOpenDate: Date
  selectionCloseDate: Date
  menuItems: Array<{
    dayOfWeek: string
    itemName: string
    description: string | null
    price: number | null
    isAvailable: boolean
    displayOrder: number
  }>
}

interface WeeklyMenuFormProps {
  vendors: FoodVendorValues[]
  userId: string
  menu?: MenuData
  isEdit?: boolean
}

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const

const WeeklyMenuForm = ({ vendors, userId, menu, isEdit }: WeeklyMenuFormProps) => {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState<typeof DAYS_OF_WEEK[number]>('MONDAY')

  const formatDateForInput = (date: Date) => {
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  const formatDateTimeForInput = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const form = useForm<z.infer<typeof WeeklyFoodMenuCreateSchema>>({
    resolver: zodResolver(WeeklyFoodMenuCreateSchema),
    defaultValues: menu ? {
      vendorId: menu.vendorId,
      weekStartDate: formatDateForInput(menu.weekStartDate),
      weekEndDate: formatDateForInput(menu.weekEndDate),
      selectionOpenDate: formatDateTimeForInput(menu.selectionOpenDate),
      selectionCloseDate: formatDateTimeForInput(menu.selectionCloseDate),
      menuItems: menu.menuItems.map(item => ({
        dayOfWeek: item.dayOfWeek as typeof DAYS_OF_WEEK[number],
        itemName: item.itemName,
        description: item.description || "",
        price: item.price || undefined,
        isAvailable: item.isAvailable,
        displayOrder: item.displayOrder
      }))
    } : {
      vendorId: "",
      weekStartDate: "",
      weekEndDate: "",
      selectionOpenDate: "",
      selectionCloseDate: "",
      menuItems: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "menuItems"
  })

  const addMenuItem = (day: typeof DAYS_OF_WEEK[number]) => {
    append({
      dayOfWeek: day,
      itemName: "",
      description: "",
      price: undefined,
      isAvailable: true,
      displayOrder: fields.filter((f) => f.dayOfWeek === day).length
    })
  }

  const getItemsForDay = (day: typeof DAYS_OF_WEEK[number]) => {
    return fields
      .map((field, index) => ({ ...field, index }))
      .filter((f) => f.dayOfWeek === day)
  }

  async function onSubmit(values: z.infer<typeof WeeklyFoodMenuCreateSchema>) {
    try {
      let result
      if (isEdit && menu?.id) {
        result = await updateFoodMenu(menu.id, values)
      } else {
        result = await createFoodMenu(values, userId)
      }

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error
        })
      } else {
        toast({
          title: 'Success',
          description: `Weekly menu ${isEdit ? 'updated' : 'created'} successfully`
        })
        if (!isEdit) {
          form.reset()
        }
        router.push('/admin/food-management/menus')
        router.refresh()
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>

          <FormField
            control={form.control}
            name="vendorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Food Vendor *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vendor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id!}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="weekStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Week Start Date (Monday) *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weekEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Week End Date (Friday) *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="selectionOpenDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selection Open Date *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    When employees can start selecting
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selectionCloseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selection Close Date *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Deadline for employee selections
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Menu Items by Day */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Weekly Menu Items</h3>

          {/* Day Tabs */}
          <div className="flex gap-2 border-b overflow-x-auto">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 font-medium whitespace-nowrap ${
                  selectedDay === day
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {day}
                {getItemsForDay(day).length > 0 && (
                  <span className="ml-2 text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                    {getItemsForDay(day).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Menu Items for Selected Day */}
          <div className="space-y-4">
            {getItemsForDay(selectedDay).length > 0 ? (
              getItemsForDay(selectedDay).map((item, idx) => (
                <div key={item.index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Item {idx + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(item.index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`menuItems.${item.index}.itemName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Jollof with Chicken"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`menuItems.${item.index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`menuItems.${item.index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe the dish..."
                            className="resize-none"
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-gray-500 mb-4">No menu items for {selectedDay}</p>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => addMenuItem(selectedDay)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item for {selectedDay}
            </Button>
          </div>
        </div>

        {/* Summary */}
        {fields.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Menu Summary</h4>
            <div className="grid grid-cols-5 gap-2 text-sm">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day}>
                  <p className="font-medium">{day}</p>
                  <p className="text-gray-600">{getItemsForDay(day).length} items</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || fields.length === 0}
            className="min-w-[120px]"
          >
            {isEdit
              ? form.formState.isSubmitting ? 'Updating...' : 'Update Menu'
              : form.formState.isSubmitting ? 'Creating...' : 'Create Menu'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default WeeklyMenuForm
