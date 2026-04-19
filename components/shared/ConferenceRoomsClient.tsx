'use client'
import BookingForm from '@/components/shared/BookingForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, Building2, Users, Clock, CheckCircle2, XCircle, Clock4, Plus } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { type ConferenceRoomValues } from '@/lib/validation'

const statusStyles = {
  APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30',
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/30',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800/30'
}

const statusIcons = {
  APPROVED: CheckCircle2,
  PENDING: Clock4,
  REJECTED: XCircle
}

interface Booking {
  id: string
  title: string
  room: any
  start: Date | string
  end: Date | string
  purpose: string | null
  attendeeCount: number | null
  status: string
  rejectionReason: string | null
}

interface ConferenceRoomsClientProps {
  userId: string
  rooms: any[]
  bookings: any[]
}

const ConferenceRoomsClient = ({ userId, rooms, bookings }: ConferenceRoomsClientProps) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = useCallback(() => {
    setOpen(false)
    router.refresh()
  }, [router])

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header Section with Gradient Glow */}
      <div className="relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="relative flex items-center justify-between gap-4 bg-card/40 backdrop-blur-sm border border-border/50 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-4 rounded-2xl border border-emerald-500/20">
              <Building2 className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Conference Room Booking</h1>
              <p className="text-muted-foreground mt-1 font-medium">Book rooms for your meetings</p>
            </div>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-xl bg-[#10A074] hover:bg-[#0d8460] text-white font-bold shadow-md shadow-emerald-500/20 transition-all hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98]">
                <Plus className="h-4 w-4 mr-2" />
                Book a Room
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader className="mb-4 pb-2 border-b border-border/50">
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                  <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Book a Conference Room
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Fill in the details to book a room for your meeting
                </DialogDescription>
              </DialogHeader>
              <div className="pt-1">
                <BookingForm userId={userId} rooms={rooms as ConferenceRoomValues[]} onSuccess={handleSuccess} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Available Rooms List */}
        <Card className="border border-border/60 shadow-sm bg-card/60">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Available Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rooms && rooms.length > 0 ? (
                rooms.map((room: any) => (
                  <div
                    key={room.id}
                    className="group p-4 bg-card rounded-xl border border-border/40 hover:border-emerald-300 dark:hover:border-emerald-800/40 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-foreground flex-1">{room.name}</h3>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/70 text-[11px] font-semibold text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {room.capacity}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 text-xs">
                      {room.location && (
                        <p className="text-muted-foreground flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          {room.location}
                        </p>
                      )}
                      {room.description && (
                        <p className="text-muted-foreground leading-relaxed">{room.description}</p>
                      )}
                      {room.amenities && (
                        <div className="pt-1.5">
                          <div className="flex flex-wrap gap-1.5">
                            {JSON.parse(room.amenities).map((amenity: string, index: number) => (
                              <span
                                key={index}
                                className="px-2.5 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/30 dark:to-teal-950/30 text-emerald-800 dark:text-emerald-300 rounded-md text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800/30"
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
                <div className="text-center py-12 text-muted-foreground italic">
                  No conference rooms available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Bookings */}
        <Card className="border border-border/60 shadow-sm bg-card/60">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              My Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings && bookings.length > 0 ? (
                bookings.map((booking: any) => {
                  const StatusIcon = statusIcons[booking.status as keyof typeof statusIcons]
                  return (
                    <div
                      key={booking.id}
                      className="p-4 bg-card rounded-xl border border-border/40 hover:border-emerald-300 dark:hover:border-emerald-800/40 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-foreground truncate flex-1">{booking.title}</h3>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0",
                                statusStyles[booking.status as keyof typeof statusStyles]
                              )}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {booking.status === 'REJECTED' ? 'DECLINED' : booking.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.room.name}</p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDateTime(booking.start instanceof Date ? booking.start : new Date(booking.start)).dateTime}</span>
                            <span className="text-muted-foreground/40">→</span>
                            <span>{formatDateTime(booking.end instanceof Date ? booking.end : new Date(booking.end)).dateTime}</span>
                            {booking.attendeeCount && (
                              <>
                                <span className="text-muted-foreground/40">•</span>
                                <span>{booking.attendeeCount} attendees</span>
                              </>
                            )}
                          </div>
                          {booking.status === 'REJECTED' && booking.rejectionReason && (
                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg">
                              <p className="text-xs font-bold text-red-700 dark:text-red-400">
                                Declined: {booking.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="bg-muted/40 p-6 rounded-full w-fit mx-auto mb-4">
                    <Calendar className="h-16 w-16 text-muted-foreground/60" />
                  </div>
                  <p className="text-lg font-medium mb-1">You have no bookings yet</p>
                  <p className="text-sm">Click the &quot;Book a Room&quot; button above!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ConferenceRoomsClient
