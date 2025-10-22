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
  function parseToDate(dateString: string): Date | null {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }
  const now = new Date();
  const upcomingEvents = events
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
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">Event Calendar</h1>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr,300px] xl:grid-cols-[1fr,350px]">
        <BaseCalendar
          events={events}
          editable={false}
          selectable={true}
          onEventClick={(event) => {
            const eventId = event.event.id;
            setSelectedEvent(events.find(event => event.id === eventId));
          }}
          onMouseLeave={() => {
            setSelectedEvent(undefined);
            console.log("Event mouse leave");
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
                    <li className="text-xs sm:text-sm text-zinc-300">
                      <span className="font-semibold">Title:</span> {selectedEvent.title}
                    </li>
                    <li className="text-xs sm:text-sm text-zinc-300">
                      <span className="font-semibold">Start Date:</span> {new Date(selectedEvent.start!.toString()!).toLocaleDateString()}
                    </li>
                    <li className="text-xs sm:text-sm text-zinc-300">
                      <span className="font-semibold">End Date:</span> {new Date(selectedEvent.end!.toString()).toLocaleDateString()}
                    </li>
                    <li className="text-xs sm:text-sm text-zinc-300">
                      <span className="font-semibold">Location:</span> {selectedEvent.extendedProps!.location}
                    </li>
                    <li className="text-xs sm:text-sm text-zinc-300 break-words">
                      <span className="font-semibold">Description:</span> {selectedEvent.extendedProps!.description}
                    </li>

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

