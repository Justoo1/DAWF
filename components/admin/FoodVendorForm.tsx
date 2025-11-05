"use client"

import { FoodVendorSchema } from '@/lib/validation'
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
import { useToast } from '@/hooks/use-toast'
import { createFoodVendor, updateFoodVendor } from '@/lib/actions/foodVendor.actions'
import { useRouter } from 'next/navigation'

interface FoodVendorFormProps {
  vendor?: z.infer<typeof FoodVendorSchema> & { id: string }
  isEdit?: boolean
}

const FoodVendorForm = ({ vendor, isEdit }: FoodVendorFormProps) => {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof FoodVendorSchema>>({
    resolver: zodResolver(FoodVendorSchema),
    defaultValues: {
      name: vendor?.name || "",
      contactName: vendor?.contactName || "",
      phone: vendor?.phone || "",
      email: vendor?.email || "",
      description: vendor?.description || "",
      isActive: vendor?.isActive ?? true
    }
  })

  async function onSubmit(values: z.infer<typeof FoodVendorSchema>) {
    try {
      let result
      if (isEdit && vendor?.id) {
        result = await updateFoodVendor(vendor.id, values)
      } else {
        result = await createFoodVendor(values)
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
          description: `Vendor ${isEdit ? 'updated' : 'created'} successfully`
        })
        form.reset()
        router.push('/admin/food-management/vendors')
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Mama's Kitchen"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., John Doe"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder="+234 xxx xxx xxxx"
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
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="vendor@example.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Brief description about the vendor..."
                  className="resize-none"
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Optional information about the vendor&apos;s specialty, location, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="min-w-[120px]"
          >
            {form.formState.isSubmitting
              ? (isEdit ? 'Updating...' : 'Creating...')
              : (isEdit ? 'Update Vendor' : 'Create Vendor')
            }
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

export default FoodVendorForm
