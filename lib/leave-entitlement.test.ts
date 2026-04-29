import test from "node:test"
import assert from "node:assert/strict"
import { computeAnnualEntitlement } from "@/lib/leave-entitlement"

const basePolicy = {
  defaultDays: 20,
  isUnlimited: false,
  accrualType: "CALENDAR_DAYS" as const,
  prorationMode: "NONE" as const,
  leaveYearStartMonth: 1,
  periodsPerYear: null,
  midPeriodJoinRule: null,
}

test("returns full default days when no proration", () => {
  const total = computeAnnualEntitlement(basePolicy, { startDate: new Date("2026-01-01"), exitDate: null }, { year: 2026 })
  assert.equal(total, 20)
})

test("prorates by join date in leave year", () => {
  const total = computeAnnualEntitlement(
    { ...basePolicy, prorationMode: "PRO_RATA_LEAVE_YEAR" },
    { startDate: new Date("2026-04-01"), exitDate: null },
    { year: 2026 }
  )
  assert.equal(total, 15.07)
})

test("supports fiscal leave year start month", () => {
  const total = computeAnnualEntitlement(
    { ...basePolicy, prorationMode: "PRO_RATA_LEAVE_YEAR", leaveYearStartMonth: 4 },
    { startDate: new Date("2026-07-01"), exitDate: null },
    { year: 2026 }
  )
  assert.equal(total, 15.01)
})

test("accrues quarterly from employment overlap", () => {
  const total = computeAnnualEntitlement(
    {
      ...basePolicy,
      defaultDays: 20,
      prorationMode: "PERIOD_ACCRUAL",
      periodsPerYear: 4,
      midPeriodJoinRule: "FULL_PERIOD_IF_ANY_OVERLAP",
    },
    { startDate: new Date("2026-04-01"), exitDate: null },
    { year: 2026 }
  )
  assert.equal(total, 15)
})

test("supports partial period proration", () => {
  const total = computeAnnualEntitlement(
    {
      ...basePolicy,
      defaultDays: 20,
      prorationMode: "PERIOD_ACCRUAL",
      periodsPerYear: 4,
      midPeriodJoinRule: "PRORATE_PARTIAL_PERIOD",
    },
    { startDate: new Date("2026-05-15"), exitDate: null },
    { year: 2026 }
  )
  assert.equal(total, 12.61)
})

test("returns null for unlimited policies", () => {
  const total = computeAnnualEntitlement(
    { ...basePolicy, isUnlimited: true },
    { startDate: new Date("2026-06-01"), exitDate: null },
    { year: 2026 }
  )
  assert.equal(total, null)
})
