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
import { FoodVendorValues, FoodValues } from '@/lib/validation'

interface MenuData {
  id: string
  vendorId: string
  weekStartDate: Date
  weekEndDate: Date
  selectionOpenDate: Date
  selectionCloseDate: Date
  menuItems: Array<{
    dayOfWeek: string
    foodId?: string | null
    itemName: string
    description: string | null
    price: number | null
    isAvailable: boolean
    displayOrder: number
  }>
}

interface WeeklyMenuFormProps {
  vendors: FoodVendorValues[]
  foods: FoodValues[]
  userId: string
  menu?: MenuData
  isEdit?: boolean
}

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const

const WeeklyMenuForm = ({ vendors, foods, userId, menu, isEdit }: WeeklyMenuFormProps) => {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState<typeof DAYS_OF_WEEK[number]>('MONDAY')
  const [selectedVendorId, setSelectedVendorId] = useState<string>(menu?.vendorId || "")

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
        foodId: item.foodId || undefined,
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

  // Filter foods based on selected vendor
  const availableFoods = foods.filter(food => food.vendorId === selectedVendorId)

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "menuItems"
  })

  const addMenuItem = (day: typeof DAYS_OF_WEEK[number]) => {
    append({
      dayOfWeek: day,
      foodId: undefined,
      itemName: "",
      description: "",
      price: undefined,
      isAvailable: true,
      displayOrder: fields.filter((f) => f.dayOfWeek === day).length
    })
  }

  const handleFoodSelect = (index: number, foodId: string) => {
    const selectedFood = foods.find(f => f.id === foodId)
    if (selectedFood) {
      form.setValue(`menuItems.${index}.foodId`, foodId)
      form.setValue(`menuItems.${index}.itemName`, selectedFood.name)
      form.setValue(`menuItems.${index}.description`, selectedFood.description || "")
      form.setValue(`menuItems.${index}.price`, selectedFood.price || undefined)
    }
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
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    setSelectedVendorId(value)
                  }}
                  defaultValue={field.value}
                >
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
                <FormDescription>
                  Select a vendor first to see available food items
                </FormDescription>
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

                  <FormField
                    control={form.control}
                    name={`menuItems.${item.index}.foodId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Food *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleFoodSelect(item.index, value)
                          }}
                          value={field.value || ""}
                          disabled={!selectedVendorId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedVendorId ? "Select a food item" : "Select vendor first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableFoods.length > 0 ? (
                              availableFoods.map((food) => (
                                <SelectItem key={food.id} value={food.id!}>
                                  {food.name} {food.price ? `- $${food.price.toFixed(2)}` : ''}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-1 text-sm text-gray-500">No foods available for this vendor</div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`menuItems.${item.index}.itemName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Name (Auto-filled) *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Select a food above"
                              disabled
                              className="bg-gray-50"
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
                          <FormLabel>Price (Auto-filled)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              placeholder="0.00"
                              disabled
                              className="bg-gray-50"
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
                        <FormLabel>Description (Auto-filled)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Select a food to see description..."
                            className="resize-none bg-gray-50"
                            rows={2}
                            disabled
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
