"use client"

import React, { useMemo } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { EventInput } from "@fullcalendar/core"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface Leave {
  id: string
  user: { name: string; department: string | null }
  policy: { name: string }
  startDate: Date
  endDate: Date
  status: string
}

interface Holiday {
  id: string
  name: string
  date: Date
  isRecurring: boolean
}

interface LeaveCalendarProps {
  leaves: Leave[]
  holidays: Holiday[]
}

export default function LeaveCalendar({ leaves, holidays }: LeaveCalendarProps) {
  const events = useMemo(() => {
    const calendarEvents: EventInput[] = []

    // Add Leaves
    leaves.forEach((leave) => {
      calendarEvents.push({
        id: leave.id,
        title: `${leave.user.name} - ${leave.policy.name}`,
        start: leave.startDate,
        end: leave.endDate,
        backgroundColor: "#2563eb", // Blue for approved leaves
        borderColor: "#1e40af",
        textColor: "white",
        extendedProps: {
            type: 'leave',
            user: leave.user.name,
            dept: leave.user.department || 'N/A'
        }
      })
    })

    // Add Holidays
    holidays.forEach((holiday) => {
        // If recurring, we might want to generate for multiple years, but for now we just show the recorded date
        calendarEvents.push({
            id: holiday.id,
            title: `Holiday: ${holiday.name}`,
            start: holiday.date,
            allDay: true,
            backgroundColor: "#E84E1B", // Brand Orange/Red for holidays
            borderColor: "#b91c1c",
            textColor: "white",
            extendedProps: {
                type: 'holiday'
            }
        })
    })

    return calendarEvents
  }, [leaves, holidays])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="lg:col-span-3 overflow-hidden border-none shadow-premium bg-white">
        <CardContent className="p-0 sm:p-2">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek"
            }}
            events={events}
            height="auto"
            dayMaxEvents={3}
            eventClassNames="cursor-pointer transition-transform hover:scale-[1.02]"
            eventContent={(arg) => (
                <div className="p-1 text-xs font-semibold overflow-hidden whitespace-nowrap">
                    {arg.event.title}
                </div>
            )}
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-none shadow-premium bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-sm bg-[#2563eb]" />
                <span className="text-sm font-medium">Approved Leave</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-sm bg-[#E84E1B]" />
                <span className="text-sm font-medium">Public Holiday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-premium bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Holidays</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {holidays.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No holidays configured.</p>
            ) : (
                holidays.slice(0, 5).map((holiday) => (
                    <div key={holiday.id} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{holiday.name}</p>
                            <p className="text-xs text-gray-500">{format(new Date(holiday.date), 'PPP')}</p>
                        </div>
                        {holiday.isRecurring && <Badge variant="outline" className="text-[10px] uppercase">Annual</Badge>}
                    </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
