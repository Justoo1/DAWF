"use client"

// import { useMemo } from 'react'
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
} from "@/components/ui/form"
import { RequiredMark } from "@/components/ui/required-mark"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// import { createContribution } from '@/app/actions/contribution'
import { useToast } from '@/hooks/use-toast'
import { createContribution, updateContribution } from '@/lib/actions/contribution'
import { ContributionValues } from '@/lib/validation'

const contributionSchema = z.object({
  userId: z.string().min(1, "User is required"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  month: z.string(),
  year: z.coerce.number().min(2020, "Year must be 2020 or later"),
  quarter: z.coerce.number().int().min(1).max(4),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).default('PENDING')
})

interface ContributionFormProps {
  employees: { id: string, name: string }[]
  contribution?: ContributionValues
  update?: boolean
}

const ContributionForm = ({ employees, contribution, update }: ContributionFormProps) => {
  const {toast} = useToast()

  const form = useForm<z.infer<typeof contributionSchema>>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: 100,
      month: contribution ? contribution.month.toISOString().slice(0, 7) : new Date().toISOString().slice(0, 7),
      status: contribution ? contribution.status : 'PENDING',
      year: contribution ? contribution.year : new Date().getFullYear(),
      quarter: contribution ? contribution.quarter : Math.ceil((new Date().getMonth() + 1) / 3),
      userId : contribution ? contribution.userId : ''
    },
    mode: "onChange",
    reValidateMode: "onChange",
  })

  // const selectedMonth = form.watch('month')

  // const calculatedQuarter = useMemo(() => {
  //   const month = new Date(selectedMonth).getMonth() + 1
  //   return Math.ceil(month / 3)
  // }, [selectedMonth])

  async function onSubmit(values: z.infer<typeof contributionSchema>) {

    try {
        const data = {
            ...values,
            month: new Date(values.month),
        }
      
      if(update) {
        const result = await updateContribution(contribution!.id!, data)
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error
        })
      } else {
        toast({
          title: 'Success',
          variant: 'default',
          color: 'green',
          description: 'Contribution updated successfully'
        })
        form.reset()
      }
      }else {
        const result = await createContribution(data)
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error
        })
      } else {
        toast({
          title: 'Success',
          description: 'Contribution added successfully'
        })
        form.reset()
      }
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="inline-flex items-center gap-1">
                Employee
                <RequiredMark />
              </FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-11 rounded-lg">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent >
                  {employees.map((employee) => (
                    <SelectItem 
                      key={employee.id} 
                      value={employee.id}
                    >
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="inline-flex items-center gap-1">
                  Amount
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    placeholder="Contribution Amount" 
                    className="h-11 rounded-lg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="inline-flex items-center gap-1">
                  Month
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input 
                    type="month" 
                    {...field} 
                    className="h-11 rounded-lg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="inline-flex items-center gap-1">
                  Year
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    min={2020}
                    max={new Date().getFullYear()}
                    className="h-11 rounded-lg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quarter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="inline-flex items-center gap-1">
                  Quarter
                  <RequiredMark />
                </FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(Number(value))} 
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="h-11 rounded-lg">
                      <SelectValue placeholder="Select Quarter" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                    <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                    <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                    <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-11 rounded-lg">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="h-11 rounded-lg shadow-sm"
          disabled={form.formState.isSubmitting}
        >
          {update ? form.formState.isSubmitting ? 'Updating...' : 'Update' : form.formState.isSubmitting ? 'Adding...' : 'Add'}
        </Button>
      </form>
    </Form>
  )
}

export default ContributionForm;