import BookingApprovalCard from '@/components/shared/BookingApprovalCard'
import { Card } from '@/components/ui/card'
import { fetchPendingBookings } from '@/lib/actions/conferenceRoom.actions'
import { fetchUser } from '@/lib/actions/users.action'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

const ApprovalsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect('/sign-in')
  }

  const userData = await fetchUser(session.user.email)
  if (!userData.success || !userData.user) {
    redirect('/sign-in')
  }

  // Check if user has booking approval permission
  if (!userData.user.canApproveBookings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="bg-zinc-800/50 p-6 max-w-md">
          <h1 className="text-xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-zinc-400">
            You do not have permission to access this page. Only users with booking approval permission can view and manage booking approvals.
          </p>
        </Card>
      </div>
    )
  }

  const bookingsData = await fetchPendingBookings()

  if (bookingsData.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500">{bookingsData.error}</p>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-7xl space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
          Booking Approvals
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base">
          Review and approve or reject pending conference room bookings
        </p>
      </div>

      {bookingsData.bookings && bookingsData.bookings.length > 0 ? (
        <div className="space-y-4">
          {bookingsData.bookings.map((booking) => (
            <BookingApprovalCard
              key={booking.id}
              booking={booking}
              approverId={userData.user.id}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-zinc-800/50 p-8 text-center">
          <p className="text-zinc-400 text-lg">No pending bookings to review</p>
          <p className="text-zinc-500 text-sm mt-2">
            All conference room bookings have been processed
          </p>
        </Card>
      )}
    </main>
  )
}

export default ApprovalsPage
