export function UsercardDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl p-4 space-y-6 animate-pulse" aria-hidden>
      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-24 w-24 rounded-lg bg-muted" />
            <div className="space-y-2 flex-1">
              <div className="h-7 w-48 rounded bg-muted" />
              <div className="h-4 w-64 rounded bg-muted/80" />
              <div className="h-4 w-56 rounded bg-muted/80" />
            </div>
          </div>
          <div className="h-40 w-full rounded-xl bg-muted/60" />
        </div>
        <div className="h-72 rounded-xl bg-muted/50" />
      </div>
    </div>
  )
}
