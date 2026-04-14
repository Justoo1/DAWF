"use client"

import { EventInput } from "@fullcalendar/core"
import BaseCalendar from "./BaseCalendar"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { Calendar, Info, Sparkles } from "lucide-react"
import { EventCategoryFilters, type EventFilter } from "@/components/shared/EventCategoryFilters"

interface PublicCalendarProps {
  events: EventInput[]
}

const PublicCalendar: React.FC<PublicCalendarProps> = ({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState<EventInput | undefined>(undefined)
  const [filter, setFilter] = useState<EventFilter>("all")

  function parseToDate(dateString: string): Date | null {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  }

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true
    if (filter === "welfare") return event.extendedProps?.category === "WELFARE"
    if (filter === "company") return event.extendedProps?.category === "COMPANY"
    if (filter === "bookings") return event.extendedProps?.type === "ROOM_BOOKING"
    return true
  })

  const now = new Date()
  const upcomingEvents = filteredEvents
    .filter((event) => {
      if (!event.start) return false
      const start = event.start ? parseToDate(event.start.toString()) : null
      return start && start > now
    })
    .map((event) => ({ ...event, start: event.start ? parseToDate(event.start.toString()) : null }))
    .sort((a, b) => {
      const dateA = a.start?.getTime() || 0
      const dateB = b.start?.getTime() || 0
      return dateA - dateB
    })
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Filter the schedule by type, then select an event to see details on the right.
        </p>
        <EventCategoryFilters value={filter} onChange={setFilter} className="sm:justify-end" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,minmax(280px,340px)]">
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/50 shadow-sm ring-1 ring-border/40 h-[min(640px,70vh)] min-h-[480px]">
          <BaseCalendar
            events={filteredEvents}
            editable={false}
            selectable={false}
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
                  <p className="text-sm font-medium text-foreground">Nothing scheduled yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    New welfare events and room bookings will appear here.
                  </p>
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
                {selectedEvent ? "Details" : "Selection"}
              </h2>
            </div>
            {selectedEvent ? (
              <div className="relative space-y-5">
                <div
                  className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    selectedEvent.extendedProps?.type === "ROOM_BOOKING"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : selectedEvent.extendedProps?.category === "WELFARE"
                        ? "bg-orange-500/15 text-orange-700 dark:text-orange-300"
                        : "bg-violet-500/15 text-violet-700 dark:text-violet-300"
                  }`}
                >
                  {selectedEvent.extendedProps?.type === "ROOM_BOOKING"
                    ? "Room booking"
                    : selectedEvent.extendedProps?.category === "WELFARE"
                      ? "Welfare"
                      : "Company"}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Title
                    </p>
                    <p className="text-base font-semibold leading-snug text-foreground">
                      {selectedEvent.title?.includes(": ")
                        ? selectedEvent.title.split(": ")[1]
                        : selectedEvent.title}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Time
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(selectedEvent.start!.toString()).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Date
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(selectedEvent.start!.toString()).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.extendedProps?.roomName && (
                    <div className="border-t border-border/60 pt-4">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Location
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        {selectedEvent.extendedProps.roomName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/25 px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Click or hover an event on the calendar to preview details here.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PublicCalendar
