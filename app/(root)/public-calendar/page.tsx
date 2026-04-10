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
    <div className="flex w-full flex-1 flex-col text-white bg-zinc-950 min-h-screen">
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 py-12 md:px-12">
        {/* Hero Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
              Company Calendar
            </h1>
            <p className="text-zinc-500 font-medium tracking-wide">
              View upcoming events and room bookings
            </p>
          </div>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center px-10 py-3 rounded-xl bg-[#10A074] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#10A074]/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,160,116,0.2)]"
          >
            Employee Login
          </Link>
        </div>

        <div className="flex-1">
          <PublicCalendar events={data.events} />
        </div>

        <div className="mt-20 pt-10 border-t border-zinc-900 flex flex-col items-center gap-4 text-center">
            <p className="text-zinc-600 text-sm max-w-2xl leading-relaxed">
            For more information or to book a conference room, please contact HR or login with your employee credentials to access the internal dashboard.
            </p>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">DevOps Africa ltd</span>
                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                <span className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">Welfare Program 2026</span>
            </div>
        </div>
      </main>
    </div>
  )
}

export default PublicCalendarPage
