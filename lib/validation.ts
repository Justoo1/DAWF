import { z } from 'zod'

// User Schema
export const UserSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  department: z.string().optional(),
  role: z.enum(['EMPLOYEE', 'MANAGER', 'ADMIN', 'FOOD_COMMITTEE']).default('EMPLOYEE'),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})
export type User = Omit<z.infer<typeof UserSchema>,  "password" | "department"> & {
  clerkId?: string | null
  department?: string | null
  password: string | null
}

export type UserValues = Omit<z.infer<typeof UserSchema>, 'password' | "department"> & {
  contributionsCount: number,
  department: string | null
  eventsCount: number,
  expensesCount: number,
  totalAmountContributed: number,
  totalContributionMonths: number,
  isActive?: boolean
  isContributor?: boolean
  canApproveBookings?: boolean
  dateOfBirth?: Date | null
  startDate?: Date | null
  exitDate?: Date | null
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
  type: z.enum([
    'BIRTHDAY', 'WORK_ANNIVERSARY', 'FUNERAL', 'CHILDBIRTH', 'MARRIAGE', 'OTHER',
    'TEAM_BUILDING', 'TRAINING', 'MEETING', 'WORKSHOP',
    'CONFERENCE', 'TOWN_HALL', 'CELEBRATION'
  ]),
  category: z.enum(['WELFARE', 'COMPANY']).default('WELFARE'),
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  start: z.string().transform((str) => new Date(str)),
  end: z.string().transform((str) => new Date(str)),
  year: z.number().int().min(2020, { message: "Year must be 2020 or later" }),
  month: z.number().int().min(1, { message: "Month must be 1-12" }),
  quarter: z.number().int().min(1).max(4),
  description: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
  maxAttendees: z.number().int().positive().optional(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional()
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

export type EventValues = Omit<z.infer<typeof EventSchema>, "description" | "location" | "maxAttendees" | "recurrencePattern"> & {
  description: string | null,
  location: string | null,
  maxAttendees: number | null,
  recurrencePattern: string | null
}

export const EventCreateSchema = z.object({
  type: z.enum([
    'BIRTHDAY', 'WORK_ANNIVERSARY', 'FUNERAL', 'CHILDBIRTH', 'MARRIAGE', 'OTHER',
    'TEAM_BUILDING', 'TRAINING', 'MEETING', 'WORKSHOP',
    'CONFERENCE', 'TOWN_HALL', 'CELEBRATION'
  ]),
  category: z.enum(['WELFARE', 'COMPANY']).default('WELFARE'),
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  start: z.string(),
  end: z.string(),
  year: z.number().int().min(2024, { message: "Year must be 2020 or later" }),
  month: z.number().int().min(1, { message: "Month must be 1-12" }),
  quarter: z.number().int().min(1).max(4),
  description: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
  maxAttendees: z.number().int().positive().optional(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional()
})

// Conference Room Schemas
export const ConferenceRoomSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Room name must be at least 2 characters" }),
  capacity: z.number().int().positive({ message: "Capacity must be positive" }),
  location: z.string().optional(),
  amenities: z.string().optional(), // JSON array as string
  isActive: z.boolean().default(true),
  description: z.string().optional()
})
export type ConferenceRoom = z.infer<typeof ConferenceRoomSchema>

// Type for Conference Room from database (with null instead of undefined)
export type ConferenceRoomValues = Omit<ConferenceRoom, 'description' | 'location' | 'amenities'> & {
  description: string | null,
  location: string | null,
  amenities: string | null,
  createdAt?: Date,
  updatedAt?: Date
}

export const ConferenceRoomBookingSchema = z.object({
  id: z.string().optional(),
  roomId: z.string(),
  userId: z.string(),
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  start: z.string().transform((str) => new Date(str)),
  end: z.string().transform((str) => new Date(str)),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).default('PENDING'),
  purpose: z.string().optional(),
  attendeeCount: z.number().int().positive().optional(),
  rejectionReason: z.string().optional(),
  approvedBy: z.string().optional()
})
export type ConferenceRoomBooking = z.infer<typeof ConferenceRoomBookingSchema>

export const ConferenceRoomBookingCreateSchema = z.object({
  roomId: z.string(),
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  start: z.string(),
  end: z.string(),
  purpose: z.string().optional(),
  attendeeCount: z.number().int().positive().optional()
}).refine((data) => {
  const start = new Date(data.start)
  const end = new Date(data.end)
  return end > start
}, {
  message: "End time must be after start time",
  path: ["end"]
})

export type ConferenceRoomBookingValues = Omit<ConferenceRoomBooking, 'description' | 'purpose' | 'attendeeCount'> & {
  description: string | null,
  purpose: string | null,
  attendeeCount: number | null,
  room: ConferenceRoom
}

// Event Attendee Schema
export const EventAttendeeSchema = z.object({
  id: z.string().optional(),
  eventId: z.string(),
  userId: z.string(),
  status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'MAYBE']).default('PENDING')
})
export type EventAttendee = z.infer<typeof EventAttendeeSchema>

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

// ============================================
// FOOD ORDERING SCHEMAS
// ============================================

// Food Vendor Schema
export const FoodVendorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Vendor name must be at least 2 characters" }),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  description: z.string().optional(),
  isActive: z.boolean().default(true)
})
export type FoodVendor = z.infer<typeof FoodVendorSchema>

export const FoodVendorCreateSchema = FoodVendorSchema.omit({ id: true })

export type FoodVendorValues = Omit<FoodVendor, 'contactName' | 'phone' | 'email' | 'description'> & {
  contactName: string | null
  phone: string | null
  email: string | null
  description: string | null
  createdAt: Date
  updatedAt: Date
}

// Food Schema
export const FoodSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Food name must be at least 2 characters" }),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  category: z.string().optional(),
  vendorId: z.string(),
  isSpecialOrder: z.boolean().default(false),
  isActive: z.boolean().default(true)
})
export type Food = z.infer<typeof FoodSchema>

export const FoodCreateSchema = FoodSchema.omit({ id: true })

export type FoodValues = Omit<Food, 'description' | 'price' | 'category'> & {
  description: string | null
  price: number | null
  category: string | null
  createdAt: Date
  updatedAt: Date
  vendor?: FoodVendorValues
}

// Food Menu Item Schema
export const FoodMenuItemSchema = z.object({
  id: z.string().optional(),
  menuId: z.string(),
  foodId: z.string().optional(),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']),
  itemName: z.string().min(2, { message: "Item name must be at least 2 characters" }),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  isAvailable: z.boolean().default(true),
  displayOrder: z.number().int().default(0)
})
export type FoodMenuItem = z.infer<typeof FoodMenuItemSchema>

export const FoodMenuItemCreateSchema = FoodMenuItemSchema.omit({ id: true, menuId: true }).extend({
  foodId: z.string().optional()
})

export type FoodMenuItemValues = Omit<FoodMenuItem, 'description' | 'price' | 'foodId'> & {
  description: string | null
  price: number | null
  foodId: string | null
  createdAt: Date
  food?: (FoodValues & {
    vendor?: FoodVendorValues
  }) | null
}

// Weekly Food Menu Schema
export const WeeklyFoodMenuSchema = z.object({
  id: z.string().optional(),
  vendorId: z.string(),
  weekStartDate: z.string().transform((str) => new Date(str)),
  weekEndDate: z.string().transform((str) => new Date(str)),
  isActive: z.boolean().default(true),
  selectionOpenDate: z.string().transform((str) => new Date(str)),
  selectionCloseDate: z.string().transform((str) => new Date(str)),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'SENT']).default('DRAFT'),
  notificationSent: z.boolean().default(false),
  reminderSent: z.boolean().default(false),
  createdBy: z.string()
})
export type WeeklyFoodMenu = z.infer<typeof WeeklyFoodMenuSchema>

export const WeeklyFoodMenuCreateSchema = z.object({
  vendorId: z.string(),
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  selectionOpenDate: z.string(),
  selectionCloseDate: z.string(),
  menuItems: z.array(FoodMenuItemCreateSchema).min(1, { message: "At least one menu item is required" })
}).refine((data) => {
  const start = new Date(data.weekStartDate)
  const end = new Date(data.weekEndDate)
  return end > start
}, {
  message: "Week end date must be after start date",
  path: ["weekEndDate"]
}).refine((data) => {
  const openDate = new Date(data.selectionOpenDate)
  const closeDate = new Date(data.selectionCloseDate)
  return closeDate > openDate
}, {
  message: "Selection close date must be after open date",
  path: ["selectionCloseDate"]
})

export type WeeklyFoodMenuValues = Omit<WeeklyFoodMenu, 'weekStartDate' | 'weekEndDate' | 'selectionOpenDate' | 'selectionCloseDate'> & {
  weekStartDate: Date
  weekEndDate: Date
  selectionOpenDate: Date
  selectionCloseDate: Date
  createdAt: Date
  updatedAt: Date
  vendor: FoodVendorValues
  menuItems: FoodMenuItemValues[]
  _count?: {
    selections: number
  }
}

// Food Selection Schema
export const FoodSelectionSchema = z.object({
  id: z.string().optional(),
  menuId: z.string(),
  menuItemId: z.string().optional().nullable(),
  userId: z.string(),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']),
  notes: z.string().optional()
})
export type FoodSelection = z.infer<typeof FoodSelectionSchema>

export const FoodSelectionCreateSchema = z.object({
  menuId: z.string(),
  menuItemId: z.string().optional().nullable(),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']),
  notes: z.string().max(200, { message: "Notes must be less than 200 characters" }).optional()
})

export const BulkFoodSelectionCreateSchema = z.object({
  menuId: z.string(),
  selections: z.array(z.object({
    dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']),
    menuItemId: z.string().optional().nullable(),
    notes: z.string().max(200).optional()
  }))
})

export type FoodSelectionValues = Omit<FoodSelection, 'menuItemId' | 'notes'> & {
  menuItemId: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string
    email: string
    department: string | null
  }
  menuItem: FoodMenuItemValues | null
}