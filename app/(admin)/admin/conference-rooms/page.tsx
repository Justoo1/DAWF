import { fetchAllConferenceRooms, fetchAllBookings } from '@/lib/actions/conferenceRoom.actions'
import { AdminPageContent } from '@/components/admin/layout/AdminPageContent'
import ConferenceRoomsClient from '@/components/admin/ConferenceRoomsClient'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'
import { fetchUser } from '@/lib/actions/users.action'
import { redirect } from 'next/navigation'

const ConferenceRoomsAdminPage = async () => {
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

  const [roomsData, bookingsData] = await Promise.all([
    fetchAllConferenceRooms(),
    fetchAllBookings()
  ])

  if (roomsData.error) {
    return (
      <main className="admin-main">
        <AdminPageContent>
          <div className="rounded-xl border border-border/50 bg-card p-6 text-sm text-destructive shadow-sm ring-1 ring-border/30">
            Error: {roomsData.error}
          </div>
        </AdminPageContent>
      </main>
    )
  }

  const upcomingBookingsCount = bookingsData.success
    ? bookingsData.bookings?.filter(
        (booking: { start: Date; status: string }) =>
          new Date(booking.start) > new Date() &&
          (booking.status === 'APPROVED' || booking.status === 'PENDING')
      ).length || 0
    : 0

  return (
    <main className="admin-main">
      <AdminPageContent>
        <ConferenceRoomsClient 
          rooms={roomsData.rooms || []}
          bookings={bookingsData.bookings || []}
          totalRooms={roomsData.totalRooms || 0}
          totalBookings={bookingsData.totalBookings || 0}
          upcomingBookingsCount={upcomingBookingsCount}
          userId={userData.user.id}
        />
      </AdminPageContent>
    </main>
  )
}

export default ConferenceRoomsAdminPage
