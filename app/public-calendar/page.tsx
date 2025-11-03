import { Card } from '@/components/ui/card'
import { fetchAllEventsForCalendar } from '@/lib/actions/events.actions'
import PublicCalendar from '@/components/shared/PublicCalendar'
import Link from 'next/link'

const PublicCalendarPage = async () => {
  const data = await fetchAllEventsForCalendar()

  if (data.error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="bg-zinc-800/50 p-6">
          <p className="text-red-500">{data.error}</p>
        </Card>
      </div>
    )
  }

  if (!data.events) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="bg-zinc-800/50 p-6">
          <p className="text-zinc-300">No events found</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Company Calendar
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                View upcoming events and room bookings
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/sign-in"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Employee Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Calendar Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <PublicCalendar events={data.events} />
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-zinc-400 text-sm">
            <p>For more information or to book a conference room, please contact HR or login with your employee credentials.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicCalendarPage
