"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RequiredMark } from "@/components/ui/required-mark"
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
import { useToast } from "@/hooks/use-toast"
import { createFood, updateFood } from "@/lib/actions/food.actions"
import { useRouter } from "next/navigation"
import { FoodCreateSchema, FoodVendorValues, FoodVendorItemValues } from "@/lib/validation"

interface FoodFormProps {
  vendors: FoodVendorValues[]
  food?: {
    id: string
    name: string
    description: string | null
    category: string | null
    isSpecialOrder: boolean
    vendorItems: FoodVendorItemValues[]
  }
  isEdit?: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

type FormValues = z.infer<typeof FoodCreateSchema>

const FoodForm = ({ vendors, food, isEdit, onSuccess, onCancel }: FoodFormProps) => {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(FoodCreateSchema),
    defaultValues: food
      ? {
          name: food.name,
          description: food.description ?? "",
          category: food.category ?? "",
          isSpecialOrder: food.isSpecialOrder,
          isActive: true,
          vendorAssignments: food.vendorItems.map((vi) => ({
            vendorId: vi.vendorId,
            price: vi.price ?? undefined,
          })),
        }
      : {
          name: "",
          description: "",
          category: "",
          isSpecialOrder: false,
          isActive: true,
          vendorAssignments: [],
        },
    mode: "onChange",
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "vendorAssignments",
  })

  const assignedVendorIds = form.watch("vendorAssignments")?.map((a) => a.vendorId) ?? []
  const availableVendors = vendors.filter((v) => !assignedVendorIds.includes(v.id!))

  async function onSubmit(values: FormValues) {
    try {
      const result = isEdit && food?.id
        ? await updateFood(food.id, values)
        : await createFood(values)

      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error })
      } else {
        toast({
          title: "Success",
          description: `Food item ${isEdit ? "updated" : "created"} successfully`,
        })
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/admin/food-management/foods")
          router.refresh()
        }
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong" })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Food Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="inline-flex items-center gap-1">
                Food Name <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Jollof Rice with Chicken" className="h-11 rounded-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Main Course, Soup, Side Dish" className="h-11 rounded-lg" />
              </FormControl>
              <FormDescription>Group similar foods together</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
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
                  className="resize-none rounded-lg min-h-[100px]"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Special Order */}
        <FormField
          control={form.control}
          name="isSpecialOrder"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Special Order</FormLabel>
                <FormDescription>
                  Mark as a special order (e.g., veggie-only, special dietary requirements)
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Vendor Assignments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Vendor Assignments</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assign this food to one or more vendors with optional pricing
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={availableVendors.length === 0}
              onClick={() => append({ vendorId: "", price: undefined })}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Vendor
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-xs text-muted-foreground rounded-md border border-dashed px-4 py-3">
              No vendors assigned yet. Click &ldquo;Add Vendor&rdquo; to assign this food to a vendor.
            </p>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 items-start rounded-lg border p-3 bg-muted/30">
              <FormField
                control={form.control}
                name={`vendorAssignments.${index}.vendorId`}
                render={({ field: f }) => (
                  <FormItem className="flex-1">
                    <Select onValueChange={f.onChange} value={f.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-lg">
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors
                          .filter((v) => v.id === f.value || !assignedVendorIds.includes(v.id!))
                          .map((vendor) => (
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
                name={`vendorAssignments.${index}.price`}
                render={({ field: f }) => (
                  <FormItem className="w-32">
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Price (opt.)"
                        className="h-10 rounded-lg"
                        value={f.value ?? ""}
                        onChange={(e) =>
                          f.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-destructive hover:text-destructive shrink-0"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[120px]">
            {isEdit
              ? form.formState.isSubmitting ? "Updating..." : "Update Food"
              : form.formState.isSubmitting ? "Creating..." : "Create Food"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => (onCancel ? onCancel() : router.back())}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default FoodForm
