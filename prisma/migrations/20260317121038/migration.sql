-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('WELFARE', 'COMPANY');

-- CreateEnum
CREATE TYPE "AttendeeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'MAYBE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EVENT_UPCOMING', 'EVENT_ACTIVE', 'EVENT_CREATED', 'CONTRIBUTION_ADDED', 'EXPENSE_ADDED', 'REMINDER', 'ANNOUNCEMENT', 'ROOM_BOOKING_CREATED', 'ROOM_BOOKING_PENDING', 'ROOM_BOOKING_APPROVED', 'ROOM_BOOKING_REJECTED', 'FOOD_MENU_PUBLISHED', 'FOOD_SELECTION_REMINDER', 'FOOD_SELECTION_CONFIRMED', 'FOOD_SELECTION_DEADLINE');

-- CreateEnum
CREATE TYPE "MenuStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'SENT');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventType" ADD VALUE 'WORK_ANNIVERSARY';
ALTER TYPE "EventType" ADD VALUE 'TEAM_BUILDING';
ALTER TYPE "EventType" ADD VALUE 'TRAINING';
ALTER TYPE "EventType" ADD VALUE 'MEETING';
ALTER TYPE "EventType" ADD VALUE 'WORKSHOP';
ALTER TYPE "EventType" ADD VALUE 'CONFERENCE';
ALTER TYPE "EventType" ADD VALUE 'TOWN_HALL';
ALTER TYPE "EventType" ADD VALUE 'CELEBRATION';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'FOOD_COMMITTEE';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "category" "EventCategory" NOT NULL DEFAULT 'WELFARE',
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxAttendees" INTEGER,
ADD COLUMN     "recurrencePattern" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "canApproveBookings" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "exitDate" TIMESTAMP(3),
ADD COLUMN     "isContributor" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "welfareContributionsBeforeExit" DOUBLE PRECISION;

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
CREATE INDEX "events_category_status_idx" ON "events"("category", "status");

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conference_room_bookings" ADD CONSTRAINT "conference_room_bookings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "conference_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conference_room_bookings" ADD CONSTRAINT "conference_room_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
