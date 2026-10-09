/** Normalises a capacity such as "8-15" or "8 -15" to "8 - 15"; a single number is left as-is. */
export function formatCapacity(capacity: string | number): string {
  return String(capacity)
    .trim()
    .replace(/\s*[-–]\s*/, " - ")
}

/**
 * Room descriptions often start with a hand-typed seats line ("Seats up to 8 people", "Seats 8-15 people").
 * Rebuild that line from the capacity so every room reads "Seats N - N people".
 */
export function formatRoomDescription(
  description: string | null | undefined,
  capacity: string | number
): string | null {
  if (!description) return null
  if (/^\s*seats\b/i.test(description)) return `Seats ${formatCapacity(capacity)} people`
  return description
}
