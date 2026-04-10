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
            className={`px-6 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-300 ${
              filter === btn.id
                ? 'bg-[#007AFF] text-white shadow-[0_0_15px_rgba(0,122,255,0.4)]'
                : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="border border-zinc-800 bg-zinc-900/30 p-4 rounded-xl">
        <div className="flex flex-wrap gap-8 items-center text-xs ml-2">
          <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Color Legend</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#E84E1B] rounded-sm"></div>
            <span className="text-zinc-300">Welfare Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#9333EA] rounded-sm"></div>
            <span className="text-zinc-300">Company Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#10A074] rounded-sm"></div>
            <span className="text-zinc-300">Room Bookings</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        {/* Calendar */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-2 rounded-2xl">
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
        <div className="flex flex-col gap-4">
          {/* Upcoming Events */}
          <Card className="bg-zinc-900/50 border-zinc-800 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-[#007AFF]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Upcoming Events
              </h2>
            </div>
            <ul className="space-y-4">
              {upcomingEvents.length === 0 && (
                <li className="text-sm text-zinc-500 italic">No upcoming events</li>
              )}
              {upcomingEvents.map((event) => (
                <li key={event.id} className="group transition-all">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-white group-hover:text-[#007AFF] transition-colors">{event.title}</span>
                    <span className="text-xs text-zinc-500">{new Date(event.start!).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* Event Details */}
          <Card className="bg-zinc-900/50 border-zinc-800 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-[#10A074]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {selectedEvent ? "Event Details" : "Select an Event"}
              </h2>
            </div>
            {selectedEvent ? (
              <div className="space-y-4">
                <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  selectedEvent.extendedProps?.type === 'ROOM_BOOKING' 
                    ? 'bg-[#10A074]/10 text-[#10A074]' 
                    : selectedEvent.extendedProps?.category === 'WELFARE'
                    ? 'bg-[#E84E1B]/10 text-[#E84E1B]'
                    : 'bg-[#9333EA]/10 text-[#9333EA]'
                }`}>
                  {selectedEvent.extendedProps?.type === 'ROOM_BOOKING' ? 'Room Booking' : selectedEvent.extendedProps?.category === 'WELFARE' ? 'Welfare' : 'Company'}
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] text-zinc-500 uppercase font-black">Title</p>
                    <p className="text-sm text-white font-medium">{selectedEvent.title?.includes(': ') ? selectedEvent.title.split(': ')[1] : selectedEvent.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-black">Start</p>
                      <p className="text-xs text-zinc-300">{new Date(selectedEvent.start!.toString()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-black">Date</p>
                      <p className="text-xs text-zinc-300">{new Date(selectedEvent.start!.toString()).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {selectedEvent.extendedProps?.roomName && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-black">Location</p>
                      <p className="text-xs text-zinc-300">{selectedEvent.extendedProps.roomName}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic leading-relaxed">
                Click or hover over an event on the calendar to view its full details here.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PublicCalendar

