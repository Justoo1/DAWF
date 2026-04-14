/** Shown during `/admin/*` navigations while the server page resolves (layout chrome stays interactive). */
export default function AdminLoading() {
  return (
    <div className="w-full max-w-[1550px] mx-auto px-4 py-6 sm:px-6 animate-in fade-in duration-200">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-72 max-w-full rounded-md bg-muted/70 animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-border/40 bg-card/50 ring-1 ring-border/20 animate-pulse"
          />
        ))}
      </div>
      <div className="mt-8 h-64 rounded-xl border border-border/40 bg-muted/30 animate-pulse" />
    </div>
  )
}
