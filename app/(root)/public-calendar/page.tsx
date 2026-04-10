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
        
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 py-6 md:px-12 relative z-10 overflow-hidden">
        {/* Hero Section - High Fidelity Treatment */}
        <div className="flex flex-col items-center justify-center text-center mb-10 px-2 gap-4">
          <div className="space-y-4 flex flex-col items-center">
            {/* Animated Live Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,160,116,0.5)]" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Live Schedule</span>
            </div>
            
            <div className="space-y-4 max-w-2xl">
                <div className="h-[1px] w-12 bg-emerald-500 mx-auto opacity-50" />
                <p className="text-muted-foreground font-bold tracking-[0.1em] text-[10px] md:text-[11px] uppercase leading-relaxed mx-auto opacity-80">
                    A comprehensive view of <span className="text-foreground">upcoming welfare events</span> <br className="hidden md:block"/> 
                    and <span className="text-foreground">conference room availability</span>
                </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <PublicCalendar events={data.events} />
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-4">
                <span className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">DevOps Africa ltd</span>
                <div className="w-1 h-1 rounded-full bg-border" />
                <span className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">Welfare Program 2026</span>
            </div>
        </div>
      </main>
    </div>
  )
}

export default PublicCalendarPage
