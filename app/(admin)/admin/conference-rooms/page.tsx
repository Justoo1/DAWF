import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchAllConferenceRooms, fetchAllBookings } from '@/lib/actions/conferenceRoom.actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import DeleteConferenceRoomButton from '@/components/admin/DeleteConferenceRoomButton'
import { Badge } from '@/components/ui/badge'
import { AdminPageContent } from '@/components/admin/layout/AdminPageContent'
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader'
import { AdminTableCard } from '@/components/admin/layout/AdminTableCard'
import {
  adminTableClassName,
  adminTbodyRowClass,
  adminTdClass,
  adminThClass,
  adminTheadRowClass,
} from '@/lib/admin-ui'
import { cn } from '@/lib/utils'

const ConferenceRoomsAdminPage = async () => {
  const roomsData = await fetchAllConferenceRooms()
  const bookingsData = await fetchAllBookings()

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

  const upcomingBookings = bookingsData.success
    ? bookingsData.bookings?.filter(
        (booking) =>
          new Date(booking.start) > new Date() &&
          (booking.status === 'APPROVED' || booking.status === 'PENDING')
      )
    : []

  return (
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Conference Rooms"
          description="Manage rooms and review recent bookings."
          action={
            <Link href="/admin/conference-rooms/add">
              <Button className="shadow-sm">Add New Room</Button>
            </Link>
          }
        />

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Total Rooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {roomsData.totalRooms || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {bookingsData.totalBookings || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Upcoming Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {upcomingBookings?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <AdminTableCard title="Rooms">
          {roomsData.rooms && roomsData.rooms.length > 0 ? (
            <table className={adminTableClassName()}>
              <thead>
                <tr className={adminTheadRowClass}>
                  <th className={adminThClass}>Room</th>
                  <th className={cn(adminThClass, "w-28 text-center")}>Capacity</th>
                  <th className={cn(adminThClass, "hidden md:table-cell")}>Location</th>
                  <th className={cn(adminThClass, "hidden lg:table-cell")}>Amenities</th>
                  <th className={cn(adminThClass, "w-28 text-right")}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roomsData.rooms.map((room) => {
                  const amenities: string[] = room.amenities ? JSON.parse(room.amenities) : []
                  return (
                    <tr key={room.id} className={adminTbodyRowClass}>
                      <td className={adminTdClass}>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">{room.name}</p>
                          {room.description ? (
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {room.description}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className={cn(adminTdClass, "text-center")}>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          {room.capacity}
                        </span>
                      </td>
                      <td className={cn(adminTdClass, "hidden md:table-cell")}>
                        <span className="text-sm text-muted-foreground">
                          {room.location || "—"}
                        </span>
                      </td>
                      <td className={cn(adminTdClass, "hidden lg:table-cell")}>
                        {amenities.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {amenities.slice(0, 6).map((amenity, index) => (
                              <Badge
                                key={`${amenity}-${index}`}
                                variant="secondary"
                                className="rounded-full"
                              >
                                {amenity}
                              </Badge>
                            ))}
                            {amenities.length > 6 ? (
                              <Badge variant="outline" className="rounded-full">
                                +{amenities.length - 6}
                              </Badge>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className={cn(adminTdClass, "text-right")}>
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/conference-rooms/${room.id}/edit`}>
                            <Button variant="outline" size="sm" className="shadow-sm">
                              Edit
                            </Button>
                          </Link>
                          <DeleteConferenceRoomButton roomId={room.id} roomName={room.name} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">No conference rooms found.</div>
          )}
        </AdminTableCard>

        <AdminTableCard title="Recent Bookings">
          {bookingsData.success && bookingsData.bookings && bookingsData.bookings.length > 0 ? (
            <table className={adminTableClassName()}>
              <thead>
                <tr className={adminTheadRowClass}>
                  <th className={adminThClass}>Booking</th>
                  <th className={cn(adminThClass, "hidden md:table-cell")}>Room</th>
                  <th className={cn(adminThClass, "hidden lg:table-cell")}>Requested By</th>
                  <th className={cn(adminThClass, "hidden lg:table-cell")}>Time</th>
                  <th className={cn(adminThClass, "w-28")}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookingsData.bookings.slice(0, 10).map((booking) => {
                  const statusLabel = booking.status === "REJECTED" ? "DECLINED" : booking.status
                  const statusVariant: "default" | "secondary" | "destructive" | "outline" =
                    booking.status === "APPROVED"
                      ? "default"
                      : booking.status === "PENDING"
                        ? "secondary"
                        : booking.status === "REJECTED"
                          ? "destructive"
                          : "outline"
                  return (
                    <tr key={booking.id} className={adminTbodyRowClass}>
                      <td className={adminTdClass}>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">{booking.title}</p>
                          {booking.purpose ? (
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {booking.purpose}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className={cn(adminTdClass, "hidden md:table-cell")}>
                        <span className="text-sm text-muted-foreground">{booking.room.name}</span>
                      </td>
                      <td className={cn(adminTdClass, "hidden lg:table-cell")}>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {booking.user.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {booking.user.department || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className={cn(adminTdClass, "hidden lg:table-cell")}>
                        <span className="text-sm text-muted-foreground">
                          {new Date(booking.start).toLocaleString()} – {new Date(booking.end).toLocaleString()}
                        </span>
                      </td>
                      <td className={adminTdClass}>
                        <Badge
                          variant={statusVariant}
                          className={cn(
                            "font-normal",
                            booking.status === "APPROVED" && "bg-primary/15 text-primary hover:bg-primary/15",
                            booking.status === "PENDING" && "bg-amber-500/15 text-amber-700 hover:bg-amber-500/15",
                            booking.status === "REJECTED" && "bg-destructive/15 text-destructive hover:bg-destructive/15"
                          )}
                        >
                          {statusLabel}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">No bookings found.</div>
          )}
        </AdminTableCard>
      </AdminPageContent>
    </main>
  )
}

export default ConferenceRoomsAdminPage
