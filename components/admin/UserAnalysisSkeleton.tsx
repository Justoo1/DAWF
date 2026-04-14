/** Placeholder while contribution analytics load on the admin dashboard. */
export function UserAnalysisSkeleton() {
  return (
    <div
      className="col-span-2 rounded-xl border border-border/50 bg-card/40 shadow-sm ring-1 ring-border/30 p-6 space-y-4 animate-pulse"
      aria-hidden
    >
      <div className="h-5 w-44 rounded bg-muted" />
      <div className="h-9 w-full max-w-xs rounded-md bg-muted" />
      <div className="h-56 w-full rounded-lg bg-muted/70" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="h-16 rounded-lg bg-muted/50" />
        <div className="h-16 rounded-lg bg-muted/50" />
        <div className="h-16 rounded-lg bg-muted/50" />
        <div className="h-16 rounded-lg bg-muted/50" />
      </div>
    </div>
  )
}
