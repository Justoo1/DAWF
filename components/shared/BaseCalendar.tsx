import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventClickArg, EventHoveringArg, EventInput } from '@fullcalendar/core'
import { cn } from '@/lib/utils'

interface BaseCalendarProps {
  events: EventInput[]
  onEventClick?: (clickInfo: EventClickArg) => void
  editable: boolean
  selectable: boolean
  onMouseEnter?: (arg: EventHoveringArg) => void
  onMouseLeave?: (arg: EventHoveringArg) => void
  className?: string
}

const BaseCalendar: React.FC<BaseCalendarProps> = ({
  events,
  onEventClick,
  editable,
  selectable,
  onMouseEnter,
  onMouseLeave,
  className,
}) => {
  return (
    <div className={cn('fc-embed bg-transparent p-2 sm:p-3 md:p-4 text-foreground overflow-hidden', className)}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "today",
        }}
        footerToolbar={{
          left: "dayGridMonth,timeGridWeek",
          right: "timeGridDay,listWeek",
        }}
        initialView="dayGridMonth"
        editable={editable}
        selectable={selectable}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events!.map((event) => ({
            id: event.id,
            title: event.title,
            start: event.start ?? new Date(), // Replace null with a default date
            end: event.end ?? new Date(),
          }))}
        eventClick={onEventClick}
        eventColor='green'
        height="auto"
        contentHeight="auto"
        aspectRatio={1.35}
        eventMouseEnter={onMouseEnter}
        eventMouseLeave={onMouseLeave}
        handleWindowResize={true}
        windowResizeDelay={100}
      />
    </div>
  )
}

export default BaseCalendar

