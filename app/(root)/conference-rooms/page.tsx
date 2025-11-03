import BookingForm from '@/components/shared/BookingForm'
import { Card } from '@/components/ui/card'
import { fetchAllConferenceRooms, fetchUserBookings } from '@/lib/actions/conferenceRoom.actions'
import { fetchUser } from '@/lib/actions/users.action'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'

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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500">{roomsData.error}</p>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-7xl space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
        Conference Room Booking
      </h1>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Booking Form */}
        <Card className="bg-zinc-800/50 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Book a Room</h2>
          <BookingForm userId={userData.user.id} rooms={roomsData.rooms || []} />
        </Card>

        {/* Available Rooms List */}
        <Card className="bg-zinc-800/50 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Available Rooms</h2>
          <div className="space-y-4">
            {roomsData.rooms && roomsData.rooms.length > 0 ? (
              roomsData.rooms.map((room) => (
                <div
                  key={room.id}
                  className="p-4 bg-zinc-700/50 rounded-lg border border-zinc-600"
                >
                  <h3 className="text-base font-semibold text-white">{room.name}</h3>
                  <div className="mt-2 space-y-1 text-sm text-zinc-300">
                    <p>Capacity: {room.capacity} people</p>
                    {room.location && <p>Location: {room.location}</p>}
                    {room.description && <p className="text-zinc-400">{room.description}</p>}
                    {room.amenities && (
                      <div className="mt-2">
                        <p className="font-medium">Amenities:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {JSON.parse(room.amenities).map((amenity: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-zinc-600 rounded-md text-xs"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-400 italic">No conference rooms available</p>
            )}
          </div>
        </Card>
      </div>

      {/* User's Bookings */}
      <Card className="bg-zinc-800/50 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">My Bookings</h2>
        <div className="space-y-3">
          {bookingsData.success && bookingsData.bookings && bookingsData.bookings.length > 0 ? (
            bookingsData.bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 bg-zinc-700/50 rounded-lg border border-zinc-600"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-semibold text-white">{booking.title}</h3>
                    <p className="text-sm text-zinc-300 mt-1">{booking.room.name}</p>
                    <div className="mt-2 space-y-1 text-sm text-zinc-400">
                      <p>Start: {formatDateTime(booking.start).dateTime}</p>
                      <p>End: {formatDateTime(booking.end).dateTime}</p>
                      {booking.purpose && <p>Purpose: {booking.purpose}</p>}
                      {booking.attendeeCount && <p>Attendees: {booking.attendeeCount}</p>}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'APPROVED'
                        ? 'bg-green-600 text-white'
                        : booking.status === 'PENDING'
                        ? 'bg-yellow-600 text-white'
                        : booking.status === 'REJECTED'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-zinc-400 italic">You have no bookings yet</p>
          )}
        </div>
      </Card>
    </main>
  )
}

export default ConferenceRoomsPage
