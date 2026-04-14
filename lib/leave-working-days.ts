/**
 * Working-day counts for leave: Mon–Fri in UTC, aligned with `<input type="date">`
 * (`new Date("yyyy-MM-dd")` is UTC midnight). Public holidays exclude additional days.
 */
export type HolidayRow = {
  date: Date
  isRecurring: boolean
}

export function countLeaveWorkingDays(start: Date, end: Date, holidays: HolidayRow[]): number {
  if (start.getTime() > end.getTime()) return 0

  const recurringMonthDay = new Set(
    holidays
      .filter((h) => h.isRecurring)
      .map((h) => `${h.date.getUTCMonth()}-${h.date.getUTCDate()}`)
  )
  const fixedUtcDay = new Set(
    holidays
      .filter((h) => !h.isRecurring)
      .map(
        (h) =>
          `${h.date.getUTCFullYear()}-${h.date.getUTCMonth()}-${h.date.getUTCDate()}`
      )
  )

  let count = 0
  let cur = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate()
  )
  const endTime = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate()
  )

  while (cur <= endTime) {
    const cd = new Date(cur)
    const dow = cd.getUTCDay()
    if (dow !== 0 && dow !== 6) {
      const yy = cd.getUTCFullYear()
      const mm = cd.getUTCMonth()
      const dd = cd.getUTCDate()
      const fixedHit = fixedUtcDay.has(`${yy}-${mm}-${dd}`)
      const recurringHit = recurringMonthDay.has(`${mm}-${dd}`)
      if (!fixedHit && !recurringHit) count++
    }
    cur += 86_400_000
  }

  return count
}
