import { cn } from "@/lib/utils"

/** Red asterisk for required fields — use next to label text for consistent admin/forms styling. */
export function RequiredMark({ className }: { className?: string }) {
  return (
    <span
      className={cn("text-red-600 font-semibold leading-none", className)}
      aria-hidden
    >
      *
    </span>
  )
}
