-- Create departments table and leave management tables.

-- Departments
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "managerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");
CREATE INDEX "departments_clientId_idx" ON "departments"("clientId");
ALTER TABLE "departments" ADD CONSTRAINT "departments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "departments" ADD CONSTRAINT "departments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Leave management enums
CREATE TYPE "AccrualType" AS ENUM ('WORKING_DAYS', 'CALENDAR_DAYS');
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- Leave policies
CREATE TABLE "leave_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultDays" INTEGER NOT NULL,
    "isUnlimited" BOOLEAN NOT NULL DEFAULT false,
    "accrualType" "AccrualType" NOT NULL DEFAULT 'WORKING_DAYS',
    "isFlexible" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "leave_policies_pkey" PRIMARY KEY ("id")
);

-- Leave balances
CREATE TABLE "leave_balances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "daysAllocated" DOUBLE PRECISION NOT NULL,
    "daysUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL,
    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "leave_balances_userId_policyId_year_key" ON "leave_balances"("userId", "policyId", "year");
CREATE INDEX "leave_balances_userId_year_idx" ON "leave_balances"("userId", "year");
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "leave_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Leave requests
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
CREATE INDEX "leave_requests_userId_status_idx" ON "leave_requests"("userId", "status");
CREATE INDEX "leave_requests_policyId_idx" ON "leave_requests"("policyId");
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "leave_policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Public holidays
CREATE TABLE "public_holidays" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "public_holidays_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "public_holidays_name_key" ON "public_holidays"("name");
