'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createExpenses, updateExpense } from '@/lib/actions/expenses'
import { ExpenseStatus, ExpenseType } from '@prisma/client'
import { ExpenseValue } from '@/lib/validation'

const ExpenseCreateSchema = z.object({
  type: z.enum(['BIRTHDAY', 'FUNERAL', 'MARRIAGE', 'CHILDBIRTH', 'EMPLOYEE_DEPARTURE', 'OTHER']),
  amount: z.number(),
  date: z.preprocess((val) => new Date(val as string), z.date()),
  recipient: z.string(),
  description: z.string().optional(),
  approvedBy: z.string().optional(),
  userId: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('APPROVED')
})

const ExpensesFormSchema = z.object({
  expenses: z.array(ExpenseCreateSchema)
})

type ExpensesFormValues = z.infer<typeof ExpensesFormSchema>

interface AddExpensesPageProps { 
    employees: { id: string, name: string }[]
    expense?: ExpenseValue,
    hideRemoveButton?: boolean
    hideAddButton?: boolean
    update?: boolean
    expenseId?: number
}

const AddExpensesPage = ({ employees, expense, hideRemoveButton, hideAddButton, update, expenseId }: AddExpensesPageProps) => {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const { control, handleSubmit, formState: { errors } } = useForm<ExpensesFormValues>({
    resolver: zodResolver(ExpensesFormSchema),
    defaultValues: {
      expenses: [
        {
          type: expense ? expense.type  : ExpenseType.BIRTHDAY,
          amount: expense ? expense.amount : 0,
          date: expense ? expense.date : new Date(),
          recipient: expense ? expense.recipient : '',
          description: expense ? expense.description! : '',
          approvedBy: 'Welfare Team',
          userId: expense ? expense.userId! : '',
          status: expense ? expense.status : ExpenseStatus.APPROVED
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "expenses"
  })

  const onSubmit = async (data: ExpensesFormValues) => {
    setSubmitStatus('loading')
    try {
      if(update){
        await updateExpense(expenseId!, data.expenses[0])
        setSubmitStatus('success')
      }else{
        await createExpenses(data.expenses)
      setSubmitStatus('success')
      }
    } catch (error) {
      console.error('Failed to submit expenses:', error)
      setSubmitStatus('error')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Expenses</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-md space-y-2">
            <Controller
              name={`expenses.${index}.userId`}
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-11 rounded-lg">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.expenses?.[index]?.userId && <p className="text-red-500">{errors.expenses[index]?.userId?.message}</p>}
            
            <Controller
              name={`expenses.${index}.type`}
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-11 rounded-lg">
                    <SelectValue placeholder="Select expense type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BIRTHDAY">Birthday</SelectItem>
                    <SelectItem value="FUNERAL">Funeral</SelectItem>
                    <SelectItem value="MARRIAGE">Marriage</SelectItem>
                    <SelectItem value="CHILDBIRTH">Childbirth</SelectItem>
                    <SelectItem value="EMPLOYEE_DEPARTURE">Employee Departure</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.expenses?.[index]?.type && <p className="text-red-500">{errors.expenses[index]?.type?.toString()}</p>}

            <Controller
              name={`expenses.${index}.amount`}
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="Amount"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="h-11 rounded-lg"
                />
              )}
            />
            {errors.expenses?.[index]?.amount && <p className="text-red-500">{errors.expenses[index]?.amount?.message}</p>}

            <Controller
              name={`expenses.${index}.date`}
              control={control}
              render={({ field }) => (
                <Input
                  type="date"
                  {...field}
                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  className="h-11 rounded-lg"
                />
              )}
            />
            {errors.expenses?.[index]?.date && <p className="text-red-500">{errors.expenses[index]?.date?.message}</p>}

            <Controller
              name={`expenses.${index}.recipient`}
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Recipient"
                  {...field}
                  className="h-11 rounded-lg"
                />
              )}
            />
            {errors.expenses?.[index]?.recipient && <p className="text-red-500">{errors.expenses[index]?.recipient?.message}</p>}

            <Controller
              name={`expenses.${index}.description`}
              control={control}
              render={({ field }) => (
                <Textarea
                  placeholder="Description (optional)"
                  {...field}
                  className="resize-none rounded-lg min-h-[120px]"
                />
              )}
            />

            {!hideRemoveButton && <Button type="button" variant="destructive" onClick={() => remove(index)}>Remove</Button>}
          </div>
        ))}
        <div className="flex gap-3">
          {!hideAddButton && (<Button type="button" onClick={() => append({
            type: ExpenseType.BIRTHDAY,
            amount: 0,
            date: new Date(),
            recipient: '',
            description: '',
            approvedBy: '',
            userId: '',
            status: ExpenseStatus.APPROVED
          })}>
            Add Expense
          </Button>)}
          <Button type="submit" disabled={submitStatus === 'loading'} className="h-11 rounded-lg shadow-sm">
            {submitStatus === 'loading' ? 'Submitting...' : 'Submit Expenses'}
          </Button>
        </div>
        {submitStatus === 'success' && <p className="text-green-500">Expenses submitted successfully!</p>}
        {submitStatus === 'error' && <p className="text-red-500">Failed to submit expenses. Please try again.</p>}
      </form>
    </div>
  )
}

export default AddExpensesPage
