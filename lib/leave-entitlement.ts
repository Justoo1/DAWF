import { countLeaveWorkingDays, type HolidayRow } from "@/lib/leave-working-days"

export type LeaveAccrualType = "WORKING_DAYS" | "CALENDAR_DAYS"
export type LeaveProrationMode = "NONE" | "PRO_RATA_LEAVE_YEAR" | "PERIOD_ACCRUAL"
export type MidPeriodJoinRule =
  | "FULL_PERIOD_IF_ANY_OVERLAP"
  | "PRORATE_PARTIAL_PERIOD"
  | "NEXT_FULL_PERIOD_ONLY"

export type EntitlementPolicy = {
  defaultDays: number
  isUnlimited: boolean
  accrualType: LeaveAccrualType
  prorationMode: LeaveProrationMode
  leaveYearStartMonth: number
  periodsPerYear: number | null
  midPeriodJoinRule: MidPeriodJoinRule | null
}

export type EntitlementUser = {
  startDate: Date | null
  exitDate: Date | null
}

type EntitlementOptions = {
  year: number
  asOfDate?: Date
  holidays?: HolidayRow[]
}

function startOfUtcDay(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))
}

function endOfUtcDay(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 23, 59, 59, 999))
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setUTCDate(copy.getUTCDate() + days)
  return copy
}

function clampRange(start: Date, end: Date, clampStart: Date, clampEnd: Date): [Date, Date] | null {
  const effectiveStart = start > clampStart ? start : clampStart
  const effectiveEnd = end < clampEnd ? end : clampEnd
  if (effectiveStart > effectiveEnd) return null
  return [effectiveStart, effectiveEnd]
}

function countDaysInclusive(start: Date, end: Date, accrualType: LeaveAccrualType, holidays: HolidayRow[]): number {
  if (start > end) return 0
  if (accrualType === "WORKING_DAYS") {
    return countLeaveWorkingDays(start, end, holidays)
  }
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((startOfUtcDay(end).getTime() - startOfUtcDay(start).getTime()) / msPerDay) + 1
}

export function getLeaveYearBounds(year: number, leaveYearStartMonth: number): { start: Date; end: Date } {
  const normalizedMonth = Math.min(12, Math.max(1, leaveYearStartMonth))
  const start = new Date(Date.UTC(year, normalizedMonth - 1, 1, 0, 0, 0, 0))
  const nextYearStart = new Date(Date.UTC(year + 1, normalizedMonth - 1, 1, 0, 0, 0, 0))
  const end = addDays(nextYearStart, -1)
  return { start, end }
}

function computePeriodAccrual(policy: EntitlementPolicy, employmentStart: Date, employmentEnd: Date, holidays: HolidayRow[]): number {
  const periodsPerYear = policy.periodsPerYear && policy.periodsPerYear > 0 ? policy.periodsPerYear : 1
  const { start: leaveYearStart, end: leaveYearEnd } = getLeaveYearBounds(employmentStart.getUTCFullYear(), policy.leaveYearStartMonth)
  const yearDays = countDaysInclusive(leaveYearStart, leaveYearEnd, "CALENDAR_DAYS", [])
  const periodSizeDays = yearDays / periodsPerYear
  const perPeriodEntitlement = policy.defaultDays / periodsPerYear
  let accrued = 0

  for (let i = 0; i < periodsPerYear; i++) {
    const rawStart = addDays(leaveYearStart, Math.floor(i * periodSizeDays))
    const rawEnd = i === periodsPerYear - 1
      ? leaveYearEnd
      : addDays(leaveYearStart, Math.floor((i + 1) * periodSizeDays) - 1)

    if (rawEnd < employmentStart || rawStart > employmentEnd) {
      continue
    }

    const overlap = clampRange(rawStart, rawEnd, employmentStart, employmentEnd)
    if (!overlap) continue

    if (policy.midPeriodJoinRule === "NEXT_FULL_PERIOD_ONLY" && overlap[0].getTime() !== rawStart.getTime()) {
      continue
    }

    if (policy.midPeriodJoinRule === "PRORATE_PARTIAL_PERIOD") {
      const periodDays = countDaysInclusive(rawStart, rawEnd, policy.accrualType, holidays)
      const overlapDays = countDaysInclusive(overlap[0], overlap[1], policy.accrualType, holidays)
      if (periodDays > 0) accrued += perPeriodEntitlement * (overlapDays / periodDays)
      continue
    }

    accrued += perPeriodEntitlement
  }

  return accrued
}

export function computeAnnualEntitlement(
  policy: EntitlementPolicy,
  user: EntitlementUser,
  options: EntitlementOptions
): number | null {
  if (policy.isUnlimited) return null

  const holidays = options.holidays ?? []
  const { start: leaveYearStart, end: leaveYearEnd } = getLeaveYearBounds(options.year, policy.leaveYearStartMonth)
  const asOf = options.asOfDate ? endOfUtcDay(options.asOfDate) : leaveYearEnd
  const cappedYearEnd = asOf < leaveYearEnd ? asOf : leaveYearEnd

  if (!user.startDate) return policy.defaultDays

  const employmentStart = startOfUtcDay(user.startDate)
  const employmentEnd = user.exitDate ? endOfUtcDay(user.exitDate) : cappedYearEnd
  const eligibleRange = clampRange(leaveYearStart, cappedYearEnd, employmentStart, employmentEnd)
  if (!eligibleRange) return 0

  if (policy.prorationMode === "NONE") return policy.defaultDays

  if (policy.prorationMode === "PERIOD_ACCRUAL") {
    const accrued = computePeriodAccrual(policy, eligibleRange[0], eligibleRange[1], holidays)
    return Math.max(0, Number(accrued.toFixed(2)))
  }

  const totalDays = countDaysInclusive(leaveYearStart, leaveYearEnd, policy.accrualType, holidays)
  const eligibleDays = countDaysInclusive(eligibleRange[0], eligibleRange[1], policy.accrualType, holidays)
  if (totalDays <= 0) return 0
  const prorated = policy.defaultDays * (eligibleDays / totalDays)
  return Math.max(0, Number(prorated.toFixed(2)))
}
