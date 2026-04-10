"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminTableCard } from '@/components/admin/layout/AdminTableCard'
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader'
import DeleteConferenceRoomButton from '@/components/admin/DeleteConferenceRoomButton'
import {
  adminTableClassName,
  adminTbodyRowClass,
  adminTdClass,
  adminThClass,
  adminTheadRowClass,
} from '@/lib/admin-ui'
import { cn } from '@/lib/utils'
import { ConferenceRoomValues, ConferenceRoomBookingValues } from '@/lib/validation'
import { ConferenceRoomModal } from './ConferenceRoomModal'
import { AdminBookingModal } from './AdminBookingModal'
import { Plus, CalendarPlus, Pencil } from 'lucide-react'

interface ConferenceRoomsClientProps {
  rooms: ConferenceRoomValues[]
  bookings: ConferenceRoomBookingValues[] // From prisma include
  totalRooms: number
  totalBookings: number
  upcomingBookingsCount: number
  userId: string
}

export default function ConferenceRoomsClient({
  rooms,
  bookings,
  totalRooms,
  totalBookings,
  upcomingBookingsCount,
  userId
}: ConferenceRoomsClientProps) {
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<ConferenceRoomValues | undefined>(undefined)
  const [isEdit, setIsEdit] = useState(false)

  const handleAddRoom = () => {
    setSelectedRoom(undefined)
    setIsEdit(false)
    setIsRoomModalOpen(true)
  }

  const handleEditRoom = (room: ConferenceRoomValues) => {
    setSelectedRoom(room)
    setIsEdit(true)
    setIsRoomModalOpen(true)
  }

  const handleAddBooking = () => {
    setIsBookingModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Conference Rooms"
        description="Manage rooms and review recent bookings."
        action={
          <div className="flex gap-2">
             <Button onClick={handleAddBooking} variant="outline" className="shadow-sm">
              <CalendarPlus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
            <Button onClick={handleAddRoom} className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add New Room
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/50 shadow-sm ring-1 ring-border/30 font-inter">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Total Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {totalRooms}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm ring-1 ring-border/30 font-inter">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {totalBookings}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm ring-1 ring-border/30 font-inter">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-[#10A074]">
              {upcomingBookingsCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <AdminTableCard title="Rooms">
        {rooms.length > 0 ? (
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
              {rooms.map((room) => {
                const amenities: string[] = room.amenities ? JSON.parse(room.amenities) : []
                return (
                  <tr key={room.id} className={adminTbodyRowClass}>
                    <td className={adminTdClass}>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-800 dark:text-slate-200">{room.name}</p>
                        {room.description ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 font-medium">
                            {room.description}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className={cn(adminTdClass, "text-center")}>
                      <span className="inline-flex items-center rounded-xl bg-[#10A074]/10 px-3 py-1 text-xs font-bold text-[#10A074]">
                        {room.capacity}
                      </span>
                    </td>
                    <td className={cn(adminTdClass, "hidden md:table-cell")}>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {room.location || "—"}
                      </span>
                    </td>
                    <td className={cn(adminTdClass, "hidden lg:table-cell")}>
                      {amenities.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {amenities.slice(0, 4).map((amenity, index) => (
                            <Badge
                              key={`${amenity}-${index}`}
                              variant="secondary"
                              className="rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none px-2 py-0 text-[11px] font-bold"
                            >
                              {amenity}
                            </Badge>
                          ))}
                          {amenities.length > 4 ? (
                            <Badge variant="outline" className="rounded-lg text-[10px] font-bold px-1.5 py-0">
                              +{amenities.length - 4}
                            </Badge>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className={cn(adminTdClass, "text-right")}>
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5"
                          onClick={() => handleEditRoom(room)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DeleteConferenceRoomButton roomId={room.id!} roomName={room.name} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
             <p className="text-slate-400 font-medium tracking-tight">No conference rooms found.</p>
             <Button onClick={handleAddRoom} variant="outline" className="mt-4 rounded-xl font-bold uppercase tracking-widest text-[11px] h-10">
                Add your first room
             </Button>
          </div>
        )}
      </AdminTableCard>

      <AdminTableCard title="Recent Bookings">
        {bookings.length > 0 ? (
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
              {bookings.slice(0, 10).map((booking) => {
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
                        <p className="truncate font-bold text-slate-800 dark:text-slate-200">{booking.title}</p>
                        {booking.purpose ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 font-medium">
                            {booking.purpose}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className={cn(adminTdClass, "hidden md:table-cell")}>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{booking.room.name}</span>
                    </td>
                    <td className={cn(adminTdClass, "hidden lg:table-cell")}>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">
                          {booking.user.name}
                        </p>
                        <p className="truncate text-[10px] font-black text-[#10A074] uppercase tracking-tighter">
                          {booking.user.department || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className={cn(adminTdClass, "hidden lg:table-cell")}>
                      <span className="text-[12px] font-medium text-slate-500">
                        {new Date(booking.start).toLocaleDateString()}
                        <br />
                        <span className="text-[10px] opacity-70">
                           {new Date(booking.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(booking.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                    </td>
                    <td className={adminTdClass}>
                      <Badge
                        variant={statusVariant}
                        className={cn(
                          "font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-lg border-none",
                          booking.status === "APPROVED" && "bg-emerald-500 text-white hover:bg-emerald-600",
                          booking.status === "PENDING" && "bg-amber-500 text-white hover:bg-amber-600",
                          booking.status === "REJECTED" && "bg-rose-500 text-white hover:bg-rose-600"
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
          <div className="p-12 text-center text-slate-400 font-medium tracking-tight">
             No bookings found.
          </div>
        )}
      </AdminTableCard>

      <ConferenceRoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        room={selectedRoom}
        isEdit={isEdit}
      />

      <AdminBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        userId={userId}
        rooms={rooms}
      />
    </div>
  )
}
