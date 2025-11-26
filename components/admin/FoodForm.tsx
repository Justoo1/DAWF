"use client"

import { FoodCreateSchema } from '@/lib/validation'
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast'
import { createFood, updateFood } from '@/lib/actions/food.actions'
import { useRouter } from 'next/navigation'
import { FoodVendorValues } from '@/lib/validation'

interface FoodData {
  id: string
  name: string
  description: string | null
  price: number | null
  category: string | null
  vendorId: string
  isSpecialOrder: boolean
}

interface FoodFormProps {
  vendors: FoodVendorValues[]
  food?: FoodData
  isEdit?: boolean
}

const FoodForm = ({ vendors, food, isEdit }: FoodFormProps) => {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof FoodCreateSchema>>({
    resolver: zodResolver(FoodCreateSchema),
    defaultValues: food ? {
      name: food.name,
      description: food.description || "",
      price: food.price || undefined,
      category: food.category || "",
      vendorId: food.vendorId,
      isSpecialOrder: food.isSpecialOrder || false,
      isActive: true
    } : {
      name: "",
      description: "",
      price: undefined,
      category: "",
      vendorId: "",
      isSpecialOrder: false,
      isActive: true
    }
  })

  async function onSubmit(values: z.infer<typeof FoodCreateSchema>) {
    try {
      let result
      if (isEdit && food?.id) {
        result = await updateFood(food.id, values)
      } else {
        result = await createFood(values)
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
          description: `Food item ${isEdit ? 'updated' : 'created'} successfully`
        })
        router.push('/admin/food-management/foods')
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
        <FormField
          control={form.control}
          name="vendorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor *</FormLabel>
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

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Food Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Jollof Rice with Chicken"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Main Course, Soup, Side Dish"
                />
              </FormControl>
              <FormDescription>
                Group similar foods together
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
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
              <FormDescription>
                Default price for this food item
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe the food item..."
                  className="resize-none"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isSpecialOrder"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Special Order
                </FormLabel>
                <FormDescription>
                  Mark this as a special order (e.g., veggie-only, special dietary requirements)
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="min-w-[120px]"
          >
            {isEdit
              ? form.formState.isSubmitting ? 'Updating...' : 'Update Food'
              : form.formState.isSubmitting ? 'Creating...' : 'Create Food'}
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

export default FoodForm
