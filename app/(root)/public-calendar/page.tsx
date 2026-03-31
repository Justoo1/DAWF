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
    <div className="flex w-full flex-1 flex-col text-white">
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Company Calendar
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              View upcoming events and room bookings
            </p>
          </div>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors shrink-0"
          >
            Employee Login
          </Link>
        </div>

        <div className="flex-1 min-h-0">
          <PublicCalendar events={data.events} />
        </div>

        <p className="text-center text-zinc-500 text-sm mt-10 pt-6 border-t border-zinc-800">
          For more information or to book a conference room, please contact HR or login with your employee credentials.
        </p>
      </main>
    </div>
  )
}

export default PublicCalendarPage
