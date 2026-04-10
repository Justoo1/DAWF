"use client"

import { EventInput } from '@fullcalendar/core'
import BaseCalendar from './BaseCalendar'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { Calendar, Info } from 'lucide-react'

interface PublicCalendarProps {
  events: EventInput[]
}

const PublicCalendar: React.FC<PublicCalendarProps> = ({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState<EventInput | undefined>(undefined)
  const [filter, setFilter] = useState<'all' | 'welfare' | 'company' | 'bookings'>('all')

  function parseToDate(dateString: string): Date | null {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  }

  // Filter events based on selected filter
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true
    if (filter === 'welfare') return event.extendedProps?.category === 'WELFARE'
    if (filter === 'company') return event.extendedProps?.category === 'COMPANY'
    if (filter === 'bookings') return event.extendedProps?.type === 'ROOM_BOOKING'
    return true
  })

  const now = new Date()
  const upcomingEvents = filteredEvents
    .filter(event => {
      if (!event.start) return false
      const start = event.start ? parseToDate(event.start.toString()) : null
      return start && start > now
    })
    .map(event => ({ ...event, start: event.start ? parseToDate(event.start.toString()) : null }))
    .sort((a, b) => {
      const dateA = a.start?.getTime() || 0
      const dateB = b.start?.getTime() || 0
      return dateA - dateB
    })
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Event Filters */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'welfare', label: 'Welfare Events' },
          { id: 'company', label: 'Company Events' },
          { id: 'bookings', label: 'Room Bookings' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id as any)}
            className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
              filter === btn.id
                ? 'bg-[#007AFF] text-white shadow-[0_0_15px_rgba(0,122,255,0.4)]'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="border border-border bg-card/80 backdrop-blur-sm p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-all">
        <div className="flex flex-wrap gap-10 items-center text-xs ml-2">
          <span className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Color Legend</span>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#E84E1B] rounded-sm shadow-sm"></div>
            <span className="text-foreground/70 font-bold uppercase tracking-wider text-[10px]">Welfare Events</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#9333EA] rounded-sm shadow-sm"></div>
            <span className="text-foreground/70 font-bold uppercase tracking-wider text-[10px]">Company Events</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#10A074] rounded-sm shadow-sm"></div>
            <span className="text-foreground/70 font-bold uppercase tracking-wider text-[10px]">Room Bookings</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,340px]">
        {/* Calendar */}
        <div className="bg-card border border-border p-3 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none transition-all">
          <BaseCalendar
            events={filteredEvents}
            editable={false}
            selectable={false}
            onEventClick={(event) => {
              const eventId = event.event.id
              setSelectedEvent(events.find(e => e.id === eventId))
            }}
            onMouseLeave={() => {
              setSelectedEvent(undefined)
            }}
            onMouseEnter={(event) => {
              const eventId = event.event.id
              setSelectedEvent(events.find(e => e.id === eventId))
            }}
          />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Upcoming Events */}
          <Card className="bg-card border-border p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none transition-all border-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-[#007AFF]/10">
                <Calendar className="w-4 h-4 text-[#007AFF]" />
              </div>
              <h2 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">
                Upcoming Events
              </h2>
            </div>
            <ul className="space-y-6">
              {upcomingEvents.length === 0 && (
                <li className="text-sm text-muted-foreground italic">No upcoming events</li>
              )}
              {upcomingEvents.map((event) => (
                <li key={event.id} className="group transition-all cursor-default">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-foreground group-hover:text-[#007AFF] transition-colors leading-tight">{event.title}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(event.start!).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* Event Details */}
          <Card className="bg-card border-border p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none transition-all border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 rounded-xl bg-[#10A074]/10">
                <Info className="w-4 h-4 text-[#10A074]" />
              </div>
              <h2 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">
                {selectedEvent ? "Event Details" : "Selection"}
              </h2>
            </div>
            {selectedEvent ? (
              <div className="space-y-6 relative z-10">
                <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  selectedEvent.extendedProps?.type === 'ROOM_BOOKING' 
                    ? 'bg-[#10A074]/10 text-[#10A074]' 
                    : selectedEvent.extendedProps?.category === 'WELFARE'
                    ? 'bg-[#E84E1B]/10 text-[#E84E1B]'
                    : 'bg-[#9333EA]/10 text-[#9333EA]'
                }`}>
                  {selectedEvent.extendedProps?.type === 'ROOM_BOOKING' ? 'Room Booking' : selectedEvent.extendedProps?.category === 'WELFARE' ? 'Welfare' : 'Company'}
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Title</p>
                    <p className="text-base text-foreground font-bold leading-snug">{selectedEvent.title?.includes(': ') ? selectedEvent.title.split(': ')[1] : selectedEvent.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-2 border-t border-border">
                    <div className="space-y-1.5">
                      <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Start Time</p>
                      <p className="text-xs text-foreground/80 font-bold">{new Date(selectedEvent.start!.toString()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Event Date</p>
                      <p className="text-xs text-foreground/80 font-bold">{new Date(selectedEvent.start!.toString()).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {selectedEvent.extendedProps?.roomName && (
                    <div className="space-y-1.5 pt-4">
                      <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Location</p>
                      <p className="text-xs text-foreground/80 font-bold flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#10A074]" />
                          {selectedEvent.extendedProps.roomName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic leading-relaxed font-medium">
                Hover or tap an event on the schedule to view comprehensive details right here.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PublicCalendar

