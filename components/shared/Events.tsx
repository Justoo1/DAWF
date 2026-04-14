"use client"

import { EventInput } from "@fullcalendar/core"
import BaseCalendar from "./BaseCalendar"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { getfilteredUpcomingEvents } from "@/lib/utils"
import { Calendar, Info, Sparkles } from "lucide-react"
import { EventCategoryFilters, type EventFilter } from "@/components/shared/EventCategoryFilters"

interface EventsProps {
  events: EventInput[]
}

const Events: React.FC<EventsProps> = ({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState<EventInput | undefined>(undefined)
  const [filter, setFilter] = useState<EventFilter>("all")

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true
    if (filter === "welfare") return event.extendedProps?.category === "WELFARE"
    if (filter === "company") return event.extendedProps?.category === "COMPANY"
    if (filter === "bookings") return event.extendedProps?.type === "ROOM_BOOKING"
    return true
  })

  const now = new Date()
  const limit = 5
  const upcomingEvents = getfilteredUpcomingEvents(now, filteredEvents, limit)

  return (
    <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-6 px-4 py-6 sm:px-6 md:px-10">
      <div className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Event calendar
          </h1>
          <p className="max-w-lg text-sm text-muted-foreground">
            Browse everything in one place—welfare activities, company events, and conference room
            bookings.
          </p>
        </div>
        <EventCategoryFilters value={filter} onChange={setFilter} className="sm:justify-end" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,minmax(280px,360px)]">
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/50 shadow-sm ring-1 ring-border/40 h-[min(640px,70vh)] min-h-[480px]">
          <BaseCalendar
            events={filteredEvents}
            editable={false}
            selectable={true}
            onEventClick={(event) => {
              const eventId = event.event.id
              setSelectedEvent(events.find((e) => e.id === eventId))
            }}
            onMouseLeave={() => {
              setSelectedEvent(undefined)
            }}
            onMouseEnter={(event) => {
              const eventId = event.event.id
              setSelectedEvent(events.find((e) => e.id === eventId))
            }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Card className="border-border/80 bg-card/80 p-5 shadow-sm ring-1 ring-border/30">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15">
                <Calendar className="h-4 w-4 text-sky-500" aria-hidden />
              </div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Upcoming</h2>
            </div>
            <ul className="space-y-3">
              {upcomingEvents.length === 0 && (
                <li className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-8 text-center">
                  <Sparkles className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" aria-hidden />
                  <p className="text-sm font-medium text-foreground">No upcoming events</p>
                  <p className="mt-1 text-xs text-muted-foreground">Check back after new events are published.</p>
                </li>
              )}
              {upcomingEvents.map((event) => (
                <li
                  key={event.id}
                  className="group border-l-2 border-emerald-500/40 pl-3 transition-colors hover:border-emerald-500"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-semibold leading-snug text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {event.title}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {new Date(event.start!).toLocaleDateString("en-US", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="relative overflow-hidden border-border/80 bg-card/80 p-5 shadow-sm ring-1 ring-border/30">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/5" />
            <div className="relative mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
              </div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                {selectedEvent ? "Event details" : "Select an event"}
              </h2>
            </div>

            {selectedEvent ? (
              <div className="relative space-y-4 text-sm">
                {selectedEvent.extendedProps?.type === "ROOM_BOOKING" ? (
                  <ul className="space-y-3 text-foreground">
                    <li>
                      <span className="inline-flex rounded-md bg-emerald-600/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                        Room booking
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">Meeting: </span>
                      <span className="font-medium">
                        {selectedEvent.title?.split(": ")[1] || selectedEvent.title}
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">Room: </span>
                      <span className="font-medium">{selectedEvent.extendedProps.roomName}</span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">Booked by: </span>
                      <span className="font-medium">{selectedEvent.extendedProps.userName}</span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">Start: </span>
                      {new Date(selectedEvent.start!.toString()).toLocaleString()}
                    </li>
                    {selectedEvent.end && (
                      <li>
                        <span className="text-muted-foreground">End: </span>
                        {new Date(selectedEvent.end.toString()).toLocaleString()}
                      </li>
                    )}
                    {selectedEvent.extendedProps.purpose && (
                      <li>
                        <span className="text-muted-foreground">Purpose: </span>
                        {selectedEvent.extendedProps.purpose}
                      </li>
                    )}
                    {selectedEvent.extendedProps.attendeeCount != null && (
                      <li>
                        <span className="text-muted-foreground">Attendees: </span>
                        {selectedEvent.extendedProps.attendeeCount}
                      </li>
                    )}
                    {selectedEvent.extendedProps.description && (
                      <li className="break-words pt-2 text-muted-foreground">
                        <span className="font-medium text-foreground">Description: </span>
                        {selectedEvent.extendedProps.description}
                      </li>
                    )}
                  </ul>
                ) : (
                  <ul className="space-y-3 text-foreground">
                    <li>
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                          selectedEvent.extendedProps?.category === "WELFARE"
                            ? "bg-pink-500/15 text-pink-700 dark:text-pink-300"
                            : "bg-violet-500/15 text-violet-700 dark:text-violet-300"
                        }`}
                      >
                        {selectedEvent.extendedProps?.category === "WELFARE"
                          ? "Welfare event"
                          : "Company event"}
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">Type: </span>
                      {selectedEvent.extendedProps?.type?.replace("_", " ")}
                    </li>
                    <li>
                      <span className="text-muted-foreground">Title: </span>
                      <span className="font-medium">{selectedEvent.title}</span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">Start: </span>
                      {new Date(selectedEvent.start!.toString()).toLocaleString()}
                    </li>
                    {selectedEvent.end && (
                      <li>
                        <span className="text-muted-foreground">End: </span>
                        {new Date(selectedEvent.end.toString()).toLocaleString()}
                      </li>
                    )}
                    {selectedEvent.extendedProps?.location && (
                      <li>
                        <span className="text-muted-foreground">Location: </span>
                        {selectedEvent.extendedProps.location}
                      </li>
                    )}
                    {selectedEvent.extendedProps?.maxAttendees != null && (
                      <li>
                        <span className="text-muted-foreground">Max attendees: </span>
                        {selectedEvent.extendedProps.maxAttendees}
                      </li>
                    )}
                    {selectedEvent.extendedProps?.description && (
                      <li className="break-words pt-2 text-muted-foreground">
                        <span className="font-medium text-foreground">Description: </span>
                        {selectedEvent.extendedProps.description}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/25 px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Click or hover an event on the calendar to see full details here.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  )
}

export default Events
