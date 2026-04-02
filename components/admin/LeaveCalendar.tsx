"use client"

import React, { useMemo, useState, useRef, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { EventInput } from "@fullcalendar/core"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  departments: string[]
  totalHeadcount: number
}

export default function LeaveCalendar({ leaves, holidays, departments, totalHeadcount }: LeaveCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedDept, setSelectedDept] = useState("all")
  const [viewTitle, setViewTitle] = useState("")

  // Generate years (past 2 and next 5)
  const currentYearNum = new Date().getFullYear()
  const years = Array.from({ length: 8 }, (_, i) => (currentYearNum - 2 + i).toString())

  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.prev()
    if (calendarApi) setCurrentDate(calendarApi.getDate())
  }

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.next()
    if (calendarApi) setCurrentDate(calendarApi.getDate())
  }

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.today()
    if (calendarApi) setCurrentDate(calendarApi.getDate())
  }

  const handleApplyFilters = () => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      // jump to the selected year, maintaining current month if possible
      const newDate = new Date(currentDate)
      newDate.setFullYear(parseInt(selectedYear))
      calendarApi.gotoDate(newDate)
      setCurrentDate(newDate)
    }
  }

  // Update title when FullCalendar renders or moves
  const handleDatesSet = (arg: any) => {
    setViewTitle(arg.view.title.toUpperCase())
    setCurrentDate(arg.view.currentStart)
  }

  const filteredEvents = useMemo(() => {
    const calendarEvents: EventInput[] = []
    
    // Group leaves by date to handle "X people" display
    const leavesByDate: Record<string, Leave[]> = {}
    
    leaves.forEach(leave => {
      if (selectedDept !== "all" && leave.user.department !== selectedDept) return
      
      // For multi-day leaves, we need to consider each day
      let curr = new Date(leave.startDate)
      const end = new Date(leave.endDate)
      
      while (curr <= end) {
        const dateStr = format(curr, "yyyy-MM-dd")
        if (!leavesByDate[dateStr]) leavesByDate[dateStr] = []
        leavesByDate[dateStr].push(leave)
        curr.setDate(curr.getDate() + 1)
      }
    })

    // 1. Add Daily Headcount Label to EVERY day in the view
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    let dayIter = new Date(start)
    dayIter.setDate(dayIter.getDate() - 7) // Buffer for previous weeks showing in grid
    const stopDate = new Date(end)
    stopDate.setDate(stopDate.getDate() + 7)

    while (dayIter <= stopDate) {
      const dateStr = format(dayIter, "yyyy-MM-dd")
      calendarEvents.push({
        id: `headcount-${dateStr}`,
        title: `Total Employees: ${totalHeadcount}`,
        start: dateStr,
        allDay: true,
        backgroundColor: "#F1F5F9", // Slate 100
        textColor: "#64748B",       // Slate 500
        borderColor: "transparent",
        classNames: ["headcount-banner"],
        extendedProps: { type: 'headcount' }
      })
      dayIter.setDate(dayIter.getDate() + 1)
    }

    // 2. Add Leaves (Grouped)
    Object.entries(leavesByDate).forEach(([dateStr, dayLeaves]) => {
      const names = dayLeaves.map(l => l.user.name)
      const label = `Total On Leave: ${dayLeaves.length}`
      
      calendarEvents.push({
        id: `group-${dateStr}`,
        title: label,
        start: dateStr,
        allDay: true,
        backgroundColor: "#10A074", 
        borderColor: "transparent",
        classNames: ["leave-banner", "status-banner"],
        extendedProps: { 
          type: 'leave', 
          count: dayLeaves.length,
          names: names
        }
      })
    })

    // 3. Add Holidays
    holidays.forEach((holiday) => {
      calendarEvents.push({
        id: holiday.id,
        title: `Public Holiday: ${holiday.name}`,
        start: holiday.date,
        allDay: true,
        backgroundColor: "#F43F5E", 
        borderColor: "transparent",
        classNames: ["holiday-banner"],
        extendedProps: { type: 'holiday' }
      })
    })

    return calendarEvents
  }, [leaves, holidays, selectedDept])

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Filters Row */}
        <div className="flex flex-col md:flex-row items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-50">
          <div className="space-y-1.5 flex-1 w-full md:w-auto">
            <label className="text-[13px] font-semibold text-slate-500 ml-1">Year</label>
            <span className="sr-only">Year filter</span>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-100 ring-offset-0 focus:ring-1 focus:ring-[#10A074]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 flex-1 w-full md:w-auto">
            <label className="text-[13px] font-semibold text-slate-500 ml-1">Select HR Group</label>
            <span className="sr-only">Department filter</span>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-100 ring-offset-0 focus:ring-1 focus:ring-[#10A074]">
                <SelectValue placeholder="Select HR Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleApplyFilters}
            className="h-11 px-8 rounded-xl bg-[#10A074] hover:bg-[#10A074]/90 text-white font-medium shadow-sm transition-all"
          >
            Apply Filters <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
              <div className="text-[13px] font-medium text-slate-400">
                  Total Events Found: <span className="text-slate-900 font-bold">{filteredEvents.length}</span>
              </div>
          </div>

          <Card className="border-none shadow-premium bg-white overflow-hidden rounded-3xl">
            <div className="flex flex-col md:flex-row justify-between items-center p-6 pb-6 gap-6 border-b border-slate-50">
              <div className="flex flex-col gap-4">
                  <h2 className="text-2xl font-black tracking-tight text-slate-800">{viewTitle}</h2>
                  <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 bg-[#10A074]/10 px-4 py-1.5 rounded-xl border border-[#10A074]/20">
                          <div className="w-2 h-2 rounded-full bg-[#10A074]" />
                          <span className="text-[12px] font-bold text-[#10A074] uppercase tracking-wider">Total Headcount: {totalHeadcount}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-rose-50 px-4 py-1.5 rounded-xl border border-rose-100">
                          <div className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="text-[12px] font-bold text-rose-600 uppercase tracking-wider">Leaves This Month: {leaves.length}</span>
                      </div>
                  </div>
              </div>
              
              <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl self-end md:self-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleToday}
                  className="h-9 px-4 rounded-xl text-slate-600 hover:bg-white hover:text-[#10A074] transition-all font-bold text-xs"
                >
                  today
                </Button>
                <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={handlePrev} className="h-9 w-9 rounded-xl text-slate-600 hover:bg-white hover:text-[#10A074] transition-all">
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleNext} className="h-9 w-9 rounded-xl text-slate-600 hover:bg-white hover:text-[#10A074] transition-all">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="calendar-container custom-calendar">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={false}
                  events={filteredEvents}
                  height="auto"
                  dayMaxEvents={6}
                  datesSet={handleDatesSet}
                  dayHeaderFormat={{ weekday: 'short' }}
                  eventDisplay="block"
                  eventContent={(arg) => {
                    const type = arg.event.extendedProps.type;
                    const names = arg.event.extendedProps.names as string[] || [];
                    
                    const content = (
                      <div className="px-2 py-1.5 flex items-center justify-start min-h-[28px] group transition-all cursor-default">
                        <span className="text-[10px] font-bold text-white whitespace-normal break-words uppercase tracking-tight leading-tight">
                          {arg.event.title}
                        </span>
                      </div>
                    );

                    if (type === 'leave' && names.length > 0) {
                      return (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {content}
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-slate-900/95 text-white border-none p-3 rounded-xl shadow-2xl backdrop-blur-md">
                            <div className="space-y-2 max-w-[200px]">
                              <p className="text-[10px] font-black text-[#10A074] uppercase tracking-widest border-b border-slate-700 pb-1 mb-1.5 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#10A074] animate-pulse" />
                                On Leave Today
                              </p>
                              <ul className="grid gap-1">
                                {names.map((name, i) => (
                                  <li key={i} className="text-[12px] font-medium text-slate-100 flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                                    {name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }
                    
                    return content;
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

      <style jsx global>{`
        .custom-calendar .fc {
          border: none !important;
          --fc-border-color: #f1f5f9;
          --fc-today-bg-color: #f8fafc;
          --fc-page-bg-color: transparent;
        }
        .custom-calendar .fc-theme-standard td, 
        .custom-calendar .fc-theme-standard th,
        .custom-calendar .fc-theme-standard .fc-scrollgrid {
          border: 1px solid #f1f5f9 !important;
        }
        .custom-calendar .fc-daygrid-day-top {
          display: flex !important;
          justify-content: flex-end !important;
          padding-top: 4px;
          padding-right: 4px;
        }
        .custom-calendar .fc-daygrid-day-number {
          font-size: 15px !important;
          font-weight: 900 !important;
          color: #94a3b8 !important;
          text-decoration: none !important;
        }
        .custom-calendar .fc-daygrid-event {
            white-space: normal !important;
        }
        .custom-calendar .fc-event-main {
            overflow: visible !important;
        }
        .custom-calendar .fc-col-header-cell-cushion {
          padding: 16px 0 !important;
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          text-decoration: none !important;
        }
        .custom-calendar .fc-event {
          margin: 2px 4px !important;
          border-radius: 8px !important;
          padding: 2px 0 !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        }
        .custom-calendar .fc-day-today {
          background-color: #f8fafc !important;
        }
        .custom-calendar .fc-day-today .fc-daygrid-day-number {
          color: #10A074 !important;
        }
        .custom-calendar .headcount-banner {
          border: 1px dashed #cbd5e1 !important;
          background-color: #f8fafc !important;
          margin-bottom: 4px !important;
        }
        .custom-calendar .headcount-banner .text-white {
          color: #64748b !important;
        }
        .custom-calendar .headcount-banner span {
            color: #64748b !important;
        }
        .custom-calendar .leave-banner {
          border-left: 5px solid #064e3b !important;
          background-color: #10b981 !important;
          margin-bottom: 2px !important;
        }
        .custom-calendar .status-banner .fc-event-title:before {
            content: "👥 ";
            margin-right: 4px;
        }
        .custom-calendar .holiday-banner {
          border-left: 5px solid #881337 !important;
          background-color: #F43F5E !important;
          margin-bottom: 2px !important;
        }
        .custom-calendar .fc-daygrid-day-frame {
          min-height: 150px !important;
        }
        .custom-calendar .fc-event-title {
            color: inherit !important;
        }
      `}</style>
      </div>
    </TooltipProvider>
  )
}
