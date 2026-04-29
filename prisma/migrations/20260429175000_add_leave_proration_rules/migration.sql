-- Add configurable leave proration/accrual policy rules.
CREATE TYPE "LeaveProrationMode" AS ENUM ('NONE', 'PRO_RATA_LEAVE_YEAR', 'PERIOD_ACCRUAL');
CREATE TYPE "MidPeriodJoinRule" AS ENUM ('FULL_PERIOD_IF_ANY_OVERLAP', 'PRORATE_PARTIAL_PERIOD', 'NEXT_FULL_PERIOD_ONLY');

ALTER TABLE "leave_policies"
  ADD COLUMN "prorationMode" "LeaveProrationMode" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "leaveYearStartMonth" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "periodsPerYear" INTEGER,
  ADD COLUMN "midPeriodJoinRule" "MidPeriodJoinRule";
