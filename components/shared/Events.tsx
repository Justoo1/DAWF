"use client"

// import React, { useState, useEffect } from 'react'
import { EventInput } from '@fullcalendar/core'
import BaseCalendar from './BaseCalendar'
import { Card } from '@/components/ui/card'
import { useState } from 'react';

interface EventsProps {
  events: EventInput[];
}

const Events: React.FC<EventsProps> = ({ events }) => {
  const [ selectedEvent, setSelectedEvent ] = useState<EventInput | undefined>(undefined);
  const [ filter, setFilter ] = useState<'all' | 'welfare' | 'company' | 'bookings'>('all');

  function parseToDate(dateString: string): Date | null {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  // Filter events based on selected filter
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'welfare') return event.extendedProps?.category === 'WELFARE';
    if (filter === 'company') return event.extendedProps?.category === 'COMPANY';
    if (filter === 'bookings') return event.extendedProps?.type === 'ROOM_BOOKING';
    return true;
  });
  const now = new Date();
  const upcomingEvents = filteredEvents
  .filter(event => {
    if (!event.start) return false;

    const start = event.start ? parseToDate(event.start.toString()) : null;
    return start && start > now; // Include only valid future dates
  })
  .map(event => ({ ...event, start: event.start ? parseToDate(event.start.toString()) : null })) // Parse the start property here
  .sort((a, b) => {
    const dateA = a.start?.getTime() || 0;
    const dateB = b.start?.getTime() || 0;
    return dateA - dateB; // Sort by ascending date
  })
  .slice(0, 5);

  return (
    <main className="mx-auto max-w-7xl space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Event Calendar</h1>

        {/* Event Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter('welfare')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'welfare'
                ? 'bg-pink-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            Welfare
          </button>
          <button
            onClick={() => setFilter('company')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'company'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            Company
          </button>
          <button
            onClick={() => setFilter('bookings')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'bookings'
                ? 'bg-green-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            Room Bookings
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr,300px] xl:grid-cols-[1fr,350px]">
        <BaseCalendar
          events={filteredEvents}
          editable={false}
          selectable={true}
          onEventClick={(event) => {
            const eventId = event.event.id;
            setSelectedEvent(events.find(event => event.id === eventId));
          }}
          onMouseLeave={() => {
            setSelectedEvent(undefined);
          }}
          onMouseEnter={(event) => {
            const eventId = event.event.id;
            setSelectedEvent(events.find(event => event.id === eventId));
          }}
        />

          <div className="flex flex-col gap-4 sm:gap-4">

            <Card className="bg-zinc-800/50 p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Upcoming Events</h2>
            <ul className="space-y-2">
              {upcomingEvents.length === 0 && (
                <li className="text-xs sm:text-sm text-zinc-400 italic">No upcoming events</li>
              )}
              {upcomingEvents
                .map((event) => (
                  <li key={event.id} className="text-xs sm:text-sm text-zinc-300 py-1">
                    <span className="font-semibold">{event.title}</span>
                    <br />
                    <span className="text-zinc-400">{new Date(event.start!).toLocaleDateString()}</span>
                  </li>
                ))
              }
            </ul>
            </Card>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-4">
              {
                selectedEvent ? "Selected Event": "Select an Event"
              }
            </h1>
              <Card className="bg-zinc-800/50 p-3 sm:p-4">
                <h2 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Event Details</h2>
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
                          <span className="font-semibold">Booked by:</span> {selectedEvent.extendedProps.userName}
                        </li>
                        <li className="text-xs sm:text-sm text-zinc-300">
                          <span className="font-semibold">Start:</span> {new Date(selectedEvent.start!.toString()!).toLocaleString()}
                        </li>
                        <li className="text-xs sm:text-sm text-zinc-300">
                          <span className="font-semibold">End:</span> {new Date(selectedEvent.end!.toString()).toLocaleString()}
                        </li>
                        {selectedEvent.extendedProps.purpose && (
                          <li className="text-xs sm:text-sm text-zinc-300">
                            <span className="font-semibold">Purpose:</span> {selectedEvent.extendedProps.purpose}
                          </li>
                        )}
                        {selectedEvent.extendedProps.attendeeCount && (
                          <li className="text-xs sm:text-sm text-zinc-300">
                            <span className="font-semibold">Attendees:</span> {selectedEvent.extendedProps.attendeeCount}
                          </li>
                        )}
                        {selectedEvent.extendedProps.description && (
                          <li className="text-xs sm:text-sm text-zinc-300 break-words">
                            <span className="font-semibold">Description:</span> {selectedEvent.extendedProps.description}
                          </li>
                        )}
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
                          <span className="font-semibold">Type:</span> {selectedEvent.extendedProps?.type?.replace('_', ' ')}
                        </li>
                        <li className="text-xs sm:text-sm text-zinc-300">
                          <span className="font-semibold">Title:</span> {selectedEvent.title}
                        </li>
                        <li className="text-xs sm:text-sm text-zinc-300">
                          <span className="font-semibold">Start:</span> {new Date(selectedEvent.start!.toString()!).toLocaleString()}
                        </li>
                        <li className="text-xs sm:text-sm text-zinc-300">
                          <span className="font-semibold">End:</span> {new Date(selectedEvent.end!.toString()).toLocaleString()}
                        </li>
                        {selectedEvent.extendedProps?.location && (
                          <li className="text-xs sm:text-sm text-zinc-300">
                            <span className="font-semibold">Location:</span> {selectedEvent.extendedProps.location}
                          </li>
                        )}
                        {selectedEvent.extendedProps?.maxAttendees && (
                          <li className="text-xs sm:text-sm text-zinc-300">
                            <span className="font-semibold">Max Attendees:</span> {selectedEvent.extendedProps.maxAttendees}
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
                  <p className="text-xs sm:text-sm text-zinc-400 italic">Click or hover over an event to view details</p>
                )}
              </Card>
            </div>
          </div>

      </div>
    </main>
  )
}

export default Events

