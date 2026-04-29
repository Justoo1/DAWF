-- ==============================================================================
-- DESTRUCTIVE RESET — drops ALL objects in schema "public" (all data, tables,
-- _prisma_migrations, etc.) then recreates from prisma/schema.prisma.
--
-- PostgreSQL: DROP SCHEMA public CASCADE removes everything in that schema,
-- including all custom ENUM types (UserRole, NotificationType, …), domains,
-- and any other types defined in public — not only tables.
--
-- Types in other schemas (e.g. extensions in a separate schema) are untouched.
--
-- Do NOT run on production. Use only for local/dev reset or an empty throwaway DB.
--
-- Regenerate the DDL tail with:
--   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
-- ==============================================================================

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Recreate from Prisma (starts below)

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('EMPLOYEE', 'MANAGER', 'ADMIN', 'FOOD_COMMITTEE');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('BIRTHDAY', 'WORK_ANNIVERSARY', 'FUNERAL', 'CHILDBIRTH', 'MARRIAGE', 'OTHER', 'TEAM_BUILDING', 'TRAINING', 'MEETING', 'WORKSHOP', 'CONFERENCE', 'TOWN_HALL', 'CELEBRATION');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('WELFARE', 'COMPANY');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AttendeeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'MAYBE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('BIRTHDAY', 'FUNERAL', 'MARRIAGE', 'CHILDBIRTH', 'EMPLOYEE_DEPARTURE', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EVENT_UPCOMING', 'EVENT_ACTIVE', 'EVENT_CREATED', 'CONTRIBUTION_ADDED', 'EXPENSE_ADDED', 'REMINDER', 'ANNOUNCEMENT', 'ROOM_BOOKING_CREATED', 'ROOM_BOOKING_PENDING', 'ROOM_BOOKING_APPROVED', 'ROOM_BOOKING_REJECTED', 'LEAVE_REQUEST_PENDING', 'LEAVE_REQUEST_APPROVED', 'LEAVE_REQUEST_REJECTED', 'FOOD_MENU_PUBLISHED', 'FOOD_SELECTION_REMINDER', 'FOOD_SELECTION_CONFIRMED', 'FOOD_SELECTION_DEADLINE');

-- CreateEnum
CREATE TYPE "MenuStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'SENT');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AccrualType" AS ENUM ('WORKING_DAYS', 'CALENDAR_DAYS');

-- CreateEnum
CREATE TYPE "LeaveProrationMode" AS ENUM ('NONE', 'PRO_RATA_LEAVE_YEAR', 'PERIOD_ACCRUAL');

-- CreateEnum
CREATE TYPE "MidPeriodJoinRule" AS ENUM ('FULL_PERIOD_IF_ANY_OVERLAP', 'PRORATE_PARTIAL_PERIOD', 'NEXT_FULL_PERIOD_ONLY');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "phoneNumber" TEXT NOT NULL DEFAULT '',
    "clientId" TEXT NOT NULL,
    "department" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isContributor" BOOLEAN NOT NULL DEFAULT true,
    "canApproveBookings" BOOLEAN NOT NULL DEFAULT false,
    "dateOfBirth" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "exitDate" TIMESTAMP(3),
    "welfareContributionsBeforeExit" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "category" "EventCategory" NOT NULL DEFAULT 'WELFARE',
    "title" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailNotificationSent" BOOLEAN NOT NULL DEFAULT false,
    "maxAttendees" INTEGER,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrencePattern" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendees" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AttendeeStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conference_rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "location" TEXT,
    "amenities" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conference_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conference_room_bookings" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "purpose" TEXT,
    "attendeeCount" INTEGER,
    "rejectionReason" TEXT,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conference_room_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "type" "ExpenseType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "recipient" TEXT NOT NULL,
    "description" TEXT,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'APPROVED',
    "userId" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policies" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "linkUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT,
    "contributionId" TEXT,
    "expenseId" INTEGER,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "category" TEXT,
    "vendorId" TEXT NOT NULL,
    "isSpecialOrder" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_food_menus" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "weekEndDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "selectionOpenDate" TIMESTAMP(3) NOT NULL,
    "selectionCloseDate" TIMESTAMP(3) NOT NULL,
    "status" "MenuStatus" NOT NULL DEFAULT 'DRAFT',
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_food_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_menu_items" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "foodId" TEXT,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_selections" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "menuItemId" TEXT,
    "userId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_selections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "managerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultDays" INTEGER NOT NULL,
    "isUnlimited" BOOLEAN NOT NULL DEFAULT false,
    "accrualType" "AccrualType" NOT NULL DEFAULT 'WORKING_DAYS',
    "prorationMode" "LeaveProrationMode" NOT NULL DEFAULT 'NONE',
    "leaveYearStartMonth" INTEGER NOT NULL DEFAULT 1,
    "periodsPerYear" INTEGER,
    "midPeriodJoinRule" "MidPeriodJoinRule",
    "isFlexible" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "daysAllocated" DOUBLE PRECISION NOT NULL,
    "daysUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL,

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "days" DOUBLE PRECISION NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "reinstatementReason" TEXT,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_holidays" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_holidays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_name_key" ON "clients"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_clientId_idx" ON "users"("clientId");

-- CreateIndex
CREATE INDEX "contributions_userId_year_month_idx" ON "contributions"("userId", "year", "month");

-- CreateIndex
CREATE INDEX "contributions_year_quarter_idx" ON "contributions"("year", "quarter");

-- CreateIndex
CREATE INDEX "events_type_year_month_idx" ON "events"("type", "year", "month");

-- CreateIndex
CREATE INDEX "events_year_quarter_idx" ON "events"("year", "quarter");

-- CreateIndex
CREATE INDEX "events_category_status_idx" ON "events"("category", "status");

-- CreateIndex
CREATE INDEX "event_attendees_userId_status_idx" ON "event_attendees"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendees_eventId_userId_key" ON "event_attendees"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "conference_rooms_name_key" ON "conference_rooms"("name");

-- CreateIndex
CREATE INDEX "conference_room_bookings_roomId_start_end_idx" ON "conference_room_bookings"("roomId", "start", "end");

-- CreateIndex
CREATE INDEX "conference_room_bookings_userId_status_idx" ON "conference_room_bookings"("userId", "status");

-- CreateIndex
CREATE INDEX "conference_room_bookings_start_end_status_idx" ON "conference_room_bookings"("start", "end", "status");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "policies_slug_key" ON "policies"("slug");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "food_vendors_name_key" ON "food_vendors"("name");

-- CreateIndex
CREATE INDEX "foods_vendorId_idx" ON "foods"("vendorId");

-- CreateIndex
CREATE INDEX "foods_isActive_idx" ON "foods"("isActive");

-- CreateIndex
CREATE INDEX "foods_isSpecialOrder_idx" ON "foods"("isSpecialOrder");

-- CreateIndex
CREATE INDEX "weekly_food_menus_vendorId_weekStartDate_idx" ON "weekly_food_menus"("vendorId", "weekStartDate");

-- CreateIndex
CREATE INDEX "weekly_food_menus_status_selectionCloseDate_idx" ON "weekly_food_menus"("status", "selectionCloseDate");

-- CreateIndex
CREATE INDEX "food_menu_items_menuId_dayOfWeek_displayOrder_idx" ON "food_menu_items"("menuId", "dayOfWeek", "displayOrder");

-- CreateIndex
CREATE INDEX "food_menu_items_foodId_idx" ON "food_menu_items"("foodId");

-- CreateIndex
CREATE INDEX "food_selections_menuId_dayOfWeek_idx" ON "food_selections"("menuId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "food_selections_userId_idx" ON "food_selections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "food_selections_menuId_userId_dayOfWeek_key" ON "food_selections"("menuId", "userId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE INDEX "leave_balances_userId_year_idx" ON "leave_balances"("userId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_userId_policyId_year_key" ON "leave_balances"("userId", "policyId", "year");

-- CreateIndex
CREATE INDEX "leave_requests_userId_status_idx" ON "leave_requests"("userId", "status");

-- CreateIndex
CREATE INDEX "leave_requests_policyId_idx" ON "leave_requests"("policyId");

-- CreateIndex
CREATE UNIQUE INDEX "public_holidays_name_key" ON "public_holidays"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conference_room_bookings" ADD CONSTRAINT "conference_room_bookings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "conference_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conference_room_bookings" ADD CONSTRAINT "conference_room_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "food_vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_food_menus" ADD CONSTRAINT "weekly_food_menus_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "food_vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_menu_items" ADD CONSTRAINT "food_menu_items_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "weekly_food_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_menu_items" ADD CONSTRAINT "food_menu_items_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_selections" ADD CONSTRAINT "food_selections_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "weekly_food_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_selections" ADD CONSTRAINT "food_selections_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "food_menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_selections" ADD CONSTRAINT "food_selections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "leave_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "leave_policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

