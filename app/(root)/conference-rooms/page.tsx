import ConferenceRoomsClient from '@/components/shared/ConferenceRoomsClient'
import { fetchAllConferenceRooms, fetchUserBookings } from '@/lib/actions/conferenceRoom.actions'
import { fetchUser } from '@/lib/actions/users.action'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

const ConferenceRoomsPage = async () => {
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

  const roomsData = await fetchAllConferenceRooms()
  const bookingsData = await fetchUserBookings(userData.user.id)

  if (roomsData.error) {
    return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 md:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="text-destructive font-semibold">Error: {roomsData.error}</div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 md:p-10">
      <ConferenceRoomsClient 
        userId={userData.user.id}
        rooms={roomsData.rooms || []}
        bookings={bookingsData.success && bookingsData.bookings ? bookingsData.bookings : []}
      />
    </main>
  )
}

export default ConferenceRoomsPage
