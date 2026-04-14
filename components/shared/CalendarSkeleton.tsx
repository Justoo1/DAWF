/** Placeholder while FullCalendar chunk loads (large client-only dependency). */
export function CalendarSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={
        className ??
        "flex h-[min(640px,70vh)] min-h-[480px] animate-pulse flex-col rounded-2xl border border-border/60 bg-muted/40 p-4"
      }
      aria-hidden
    >
      <div className="mb-4 flex justify-between gap-2">
        <div className="h-9 w-24 rounded-lg bg-muted" />
        <div className="h-9 flex-1 max-w-[200px] rounded-lg bg-muted mx-auto" />
        <div className="h-9 w-20 rounded-lg bg-muted" />
      </div>
      <div className="grid flex-1 grid-cols-7 gap-px rounded-lg bg-border/40 p-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="min-h-[3rem] rounded bg-background/60" />
        ))}
      </div>
    </div>
  )
}
