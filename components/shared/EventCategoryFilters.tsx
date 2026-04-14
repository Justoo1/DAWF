"use client"

import { cn } from "@/lib/utils"

export type EventFilter = "all" | "welfare" | "company" | "bookings"

const OPTIONS: { id: EventFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "welfare", label: "Welfare" },
  { id: "company", label: "Company" },
  { id: "bookings", label: "Room bookings" },
]

interface EventCategoryFiltersProps {
  value: EventFilter
  onChange: (next: EventFilter) => void
  className?: string
  /** Smaller padding for tight toolbars */
  size?: "default" | "sm"
}

export function EventCategoryFilters({
  value,
  onChange,
  className,
  size = "default",
}: EventCategoryFiltersProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      role="tablist"
      aria-label="Filter events by category"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              size === "sm" ? "px-3 py-1 text-[11px]" : "px-4 py-1.5 text-xs",
              active
                ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500/40"
                : "bg-muted/70 text-muted-foreground ring-1 ring-border/60 hover:bg-muted hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
