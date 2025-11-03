import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchAllConferenceRooms, fetchAllBookings } from '@/lib/actions/conferenceRoom.actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const ConferenceRoomsAdminPage = async () => {
  const roomsData = await fetchAllConferenceRooms()
  const bookingsData = await fetchAllBookings()

  if (roomsData.error) {
    return <div>Error: {roomsData.error}</div>
  }

  const upcomingBookings = bookingsData.success
    ? bookingsData.bookings?.filter(
        (booking) =>
          new Date(booking.start) > new Date() &&
          (booking.status === 'APPROVED' || booking.status === 'PENDING')
      )
    : []

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Conference Room Management</h1>
          <Link href="/admin/conference-rooms/add">
            <Button>Add New Room</Button>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roomsData.totalRooms || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookingsData.totalBookings || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingBookings?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Conference Rooms List */}
        <Card>
          <CardHeader>
            <CardTitle>Conference Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roomsData.rooms && roomsData.rooms.length > 0 ? (
                roomsData.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex justify-between items-start p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{room.name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>Capacity: {room.capacity} people</p>
                        {room.location && <p>Location: {room.location}</p>}
                        {room.description && <p>{room.description}</p>}
                        {room.amenities && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {JSON.parse(room.amenities).map((amenity: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-200 rounded-md text-xs"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/conference-rooms/${room.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No conference rooms found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookingsData.success && bookingsData.bookings && bookingsData.bookings.length > 0 ? (
                bookingsData.bookings.slice(0, 10).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex justify-between items-start p-3 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold">{booking.title}</h4>
                      <p className="text-sm text-gray-600">{booking.room.name}</p>
                      <p className="text-sm text-gray-500">
                        By: {booking.user.name} ({booking.user.department || 'N/A'})
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.start).toLocaleString()} -{' '}
                        {new Date(booking.end).toLocaleString()}
                      </p>
                      {booking.purpose && (
                        <p className="text-sm text-gray-500">Purpose: {booking.purpose}</p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : booking.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No bookings found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default ConferenceRoomsAdminPage
