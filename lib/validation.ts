import { z } from 'zod'

// User Schema
export const UserSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  department: z.string().optional(),
  role: z.enum(['EMPLOYEE', 'ADMIN']).default('EMPLOYEE'),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})
export type User = Omit<z.infer<typeof UserSchema>,  "password" | "department"> & {
  clerkId?: string | null
  department?: string | null
  password: string | null
}

export type UserValues = Omit<z.infer<typeof UserSchema>, 'password' | "department"> & {
  contributionsCount: number,
  department?: string | null
  eventsCount: number,
  expensesCount: number,
  totalAmountContributed: number,
  totalContributionMonths: number,
  isActive?: boolean
}

// Contribution Schema
export const ContributionSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  amount: z.number().positive({ message: "Amount must be positive" }),
  month: z.date(),
  year: z.number().int().min(2020, { message: "Year must be 2020 or later" }),
  quarter: z.number().int().min(1).max(4),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).default('PENDING')
})
export type Contribution = z.infer<typeof ContributionSchema>

// Event Schema
export const EventSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  type: z.enum(['BIRTHDAY', 'FUNERAL', 'CHILDBIRTH', 'MARRIAGE', 'OTHER']),
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  start: z.string().transform((str) => new Date(str)),
  end: z.string().transform((str) => new Date(str)),
  year: z.number().int().min(2020, { message: "Year must be 2020 or later" }),
  month: z.number().int().min(1, { message: "Month must be 1-12" }),
  quarter: z.number().int().min(1).max(4),
  description: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE')
})
export type Event = z.infer<typeof EventSchema>

// Expense Schema
export const ExpenseSchema = z.object({
  id: z.number().int().optional(),
  type: z.enum(['BIRTHDAY', 'FUNERAL', 'MARRIAGE', 'CHILDBIRTH', 'EMPLOYEE_DEPARTURE', 'OTHER']),
  amount: z.number().positive({ message: "Amount must be positive" }),
  date: z.preprocess((val) => new Date(val as string), z.date()),
  recipient: z.string().min(2, { message: "Recipient name is required" }),
  description: z.string().nullable().optional(),
  approvedBy: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('APPROVED')
})
export type Expense = z.infer<typeof ExpenseSchema>

// Form Validation Schemas
export const UserCreateSchema = UserSchema.omit({ id: true })
export const ContributionCreateSchema = ContributionSchema.omit({ id: true })
export const ExpenseCreateSchema = ExpenseSchema.omit({ id: true })

export const contrubitionData = z.object({
  ...ContributionSchema.shape,
});

export type ContributionValues = z.infer<typeof contrubitionData> & {
  user: User
};

export type ExpenseValue = Omit<z.infer<typeof ExpenseSchema>, "approvedBy" | "userId">& {
  user: User | null,
  approvedBy: string | null,
  userId: string | null
}

export type EventValues = Omit<z.infer<typeof EventSchema>, "description" | "location"> & {
  description: string | null,
  location: string | null
}

export const EventCreateSchema = z.object({
  type: z.enum(['BIRTHDAY', 'FUNERAL', 'CHILDBIRTH', 'MARRIAGE', 'OTHER']),
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  start: z.string(),
  end: z.string(),
  year: z.number().int().min(2024, { message: "Year must be 2020 or later" }),
  month: z.number().int().min(1, { message: "Month must be 1-12" }),
  quarter: z.number().int().min(1).max(4),
  description: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE')
})

export const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  })
})

export const signupSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})