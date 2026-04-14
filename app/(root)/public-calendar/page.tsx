import { Card } from "@/components/ui/card"
import { fetchAllEventsForCalendar } from "@/lib/actions/events.actions"
import PublicCalendar from "@/components/shared/PublicCalendar"

const PublicCalendarPage = async () => {
  const data = await fetchAllEventsForCalendar()

  if (data.error) {
    return (
      <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center p-4">
        <Card className="bg-zinc-800/50 p-6 border-zinc-700">
          <p className="text-red-500">{data.error}</p>
        </Card>
      </div>
    )
  }

  if (!data.events) {
    return (
      <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center p-4">
        <Card className="bg-zinc-800/50 p-6 border-zinc-700">
          <p className="text-zinc-300">No events found</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-1 flex-col bg-background text-foreground transition-colors duration-500 selection:bg-emerald-500/30">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.06),transparent_55%)]"
        aria-hidden
      />

      <main className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col overflow-hidden px-4 py-8 sm:px-6 md:px-10">
        <header className="mb-8 space-y-3 text-center sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 backdrop-blur-sm">
            <span
              className="relative flex h-2 w-2"
              aria-hidden
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              Live schedule
            </span>
          </div>
          <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welfare events &amp; room availability
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            One place to see what&apos;s coming up—team welfare activities, company events, and who has
            booked conference rooms.
          </p>
        </header>

        <div className="flex-1 overflow-hidden">
          <PublicCalendar events={data.events} />
        </div>

        <footer className="mt-10 flex flex-col items-center gap-2 border-t border-border/50 pt-8 text-center">
          <p className="text-[11px] font-medium text-muted-foreground">
            DevOps Africa · Employee welfare
          </p>
        </footer>
      </main>
    </div>
  )
}

export default PublicCalendarPage
