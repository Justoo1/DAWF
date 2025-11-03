"use client"

import { EventInput } from '@fullcalendar/core'
import BaseCalendar from './BaseCalendar'
import { Card } from '@/components/ui/card'
import { useState } from 'react'

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
    <div className="space-y-4 sm:space-y-6">
      {/* Event Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setFilter('welfare')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'welfare'
              ? 'bg-pink-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Welfare Events
        </button>
        <button
          onClick={() => setFilter('company')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'company'
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Company Events
        </button>
        <button
          onClick={() => setFilter('bookings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'bookings'
              ? 'bg-green-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Room Bookings
        </button>
      </div>

      {/* Legend */}
      <Card className="bg-zinc-800/50 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Color Legend</h3>
        <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-500 rounded"></div>
            <span className="text-zinc-300">Welfare Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-zinc-300">Company Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-zinc-300">Room Bookings</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr,320px]">
        {/* Calendar */}
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

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Upcoming Events */}
          <Card className="bg-zinc-800/50 p-4">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3">
              Upcoming Events
            </h2>
            <ul className="space-y-2">
              {upcomingEvents.length === 0 && (
                <li className="text-xs sm:text-sm text-zinc-400 italic">No upcoming events</li>
              )}
              {upcomingEvents.map((event) => (
                <li key={event.id} className="text-xs sm:text-sm text-zinc-300 py-2 border-b border-zinc-700 last:border-0">
                  <span className="font-semibold block">{event.title}</span>
                  <span className="text-zinc-400">{new Date(event.start!).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Event Details */}
          <Card className="bg-zinc-800/50 p-4">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3">
              {selectedEvent ? "Event Details" : "Select an Event"}
            </h2>
            {selectedEvent ? (
              <ul className="space-y-2 sm:space-y-3">
                {selectedEvent.extendedProps?.type === 'ROOM_BOOKING' ? (
                  <>
                    <li className="text-xs sm:text-sm">
                      <span className="px-2 py-1 bg-green-600 text-white rounded-md text-xs font-medium">
                        Room Booking
                      </span>
                    </li>
                    <li className="text-xs sm:text-sm text-zinc-300">
                      <span className="font-semibold">Meeting:</span> {selectedEvent.title?.split(': ')[1] || selectedEvent.title}
                    </li>
                    <li className="text-xs sm:text-sm text-zinc-300">
                      <span className="font-semibold">Room:</span> {selectedEvent.extendedProps.roomName}
                    </li>
                    <li className="text-xs sm:text-sm text-zinc-300">
                      <span className="font-semibold">Start:</span> {new Date(selectedEvent.start!.toString()).toLocaleString()}
                    </li>
                    <li className="text-xs sm:text-sm text-zinc-300">
                      <span className="font-semibold">End:</span> {new Date(selectedEvent.end!.toString()).toLocaleString()}
                    </li>
                  </>
                ) : (
                  <>
                    <li className="text-xs sm:text-sm">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        selectedEvent.extendedProps?.category === 'WELFARE'
                          ? 'bg-pink-600 text-white'
                          : 'bg-purple-600 text-white'
                      }`}>
                        {selectedEvent.extendedProps?.category === 'WELFARE' ? 'Welfare Event' : 'Company Event'}
                      </span>
                    </li>
                    <li className="text-xs sm:text-sm text-zinc-300">
                      <span className="font-semibold">Title:</span> {selectedEvent.title}
                    </li>
                    <li className="text-xs sm:text-sm text-zinc-300">
                      <span className="font-semibold">Start:</span> {new Date(selectedEvent.start!.toString()).toLocaleString()}
                    </li>
                    <li className="text-xs sm:text-sm text-zinc-300">
                      <span className="font-semibold">End:</span> {new Date(selectedEvent.end!.toString()).toLocaleString()}
                    </li>
                    {selectedEvent.extendedProps?.location && (
                      <li className="text-xs sm:text-sm text-zinc-300">
                        <span className="font-semibold">Location:</span> {selectedEvent.extendedProps.location}
                      </li>
                    )}
                    {selectedEvent.extendedProps?.description && (
                      <li className="text-xs sm:text-sm text-zinc-300 break-words">
                        <span className="font-semibold">Description:</span> {selectedEvent.extendedProps.description}
                      </li>
                    )}
                  </>
                )}
              </ul>
            ) : (
              <p className="text-xs sm:text-sm text-zinc-400 italic">
                Click or hover over an event to view details
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PublicCalendar
