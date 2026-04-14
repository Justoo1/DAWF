/**
 * Date window for public calendar DB queries so we don't scan the full events / bookings tables.
 * Overlap semantics: include any event/booking that intersects [rangeStart, rangeEnd].
 */
export function getPublicCalendarQueryRange() {
  const rangeStart = new Date()
  rangeStart.setHours(0, 0, 0, 0)
  rangeStart.setFullYear(rangeStart.getFullYear() - 1)

  const rangeEnd = new Date()
  rangeEnd.setHours(23, 59, 59, 999)
  rangeEnd.setFullYear(rangeEnd.getFullYear() + 2)

  return { rangeStart, rangeEnd }
}
