import { Card } from "@/components/ui/card"
import { fetchAllEventsForCalendar } from "@/lib/actions/events.actions"
import PublicCalendar from "@/components/shared/PublicCalendar"
import Link from "next/link"

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
    <div className="flex w-full flex-1 flex-col text-foreground bg-background min-h-screen transition-colors duration-500 selection:bg-emerald-500/30">
        {/* Subtle background decoration for light mode */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.03),transparent_50%)] pointer-events-none" />
        
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 py-12 md:px-12 relative z-10">
        {/* Hero Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-16 px-2">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live Schedule</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic leading-[0.9]">
              Company <span className="text-emerald-500 font-outline-2">Calendar</span>
            </h1>
            <p className="text-muted-foreground font-medium tracking-wide max-w-md">
              A comprehensive view of upcoming welfare events and conference room availability.
            </p>
          </div>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center px-10 py-4 rounded-2xl bg-[#10A074] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#10A074]/90 hover:scale-[1.02] transition-all shadow-[0_20px_40px_-15px_rgba(16,160,116,0.3)]"
          >
            Employee Login
          </Link>
        </div>

        <div className="flex-1">
          <PublicCalendar events={data.events} />
        </div>

        <div className="mt-24 pt-12 border-t border-border flex flex-col items-center gap-6 text-center">
            <p className="text-muted-foreground/60 text-xs max-w-2xl leading-relaxed font-medium">
            DAWF is committed to transparency and efficient resource management. This calendar is synchronized in real-time with internal scheduling systems.
            </p>
            <div className="flex items-center gap-4">
                <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">DevOps Africa ltd</span>
                <div className="w-1 h-1 rounded-full bg-border" />
                <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">Welfare Program 2026</span>
            </div>
        </div>
      </main>
    </div>
  )
}

export default PublicCalendarPage
