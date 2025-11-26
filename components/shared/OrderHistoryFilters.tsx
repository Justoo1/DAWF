"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"

interface OrderHistoryFiltersProps {
  onFilterChange: (startDate?: Date, endDate?: Date) => void
}

const OrderHistoryFilters = ({ onFilterChange }: OrderHistoryFiltersProps) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'thisWeek' | 'lastWeek' | 'custom'>('all')
  const [customStartDate, setCustomStartDate] = useState<Date>()
  const [customEndDate, setCustomEndDate] = useState<Date>()

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  const getEndOfWeek = (date: Date) => {
    const start = getStartOfWeek(date)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return end
  }

  const handleThisWeek = () => {
    const now = new Date()
    const startOfWeek = getStartOfWeek(now)
    const endOfWeek = getEndOfWeek(now)
    setActiveFilter('thisWeek')
    onFilterChange(startOfWeek, endOfWeek)
  }

  const handleLastWeek = () => {
    const now = new Date()
    const lastWeekDate = new Date(now.setDate(now.getDate() - 7))
    const startOfLastWeek = getStartOfWeek(lastWeekDate)
    const endOfLastWeek = getEndOfWeek(lastWeekDate)
    setActiveFilter('lastWeek')
    onFilterChange(startOfLastWeek, endOfLastWeek)
  }

  const handleAllTime = () => {
    setActiveFilter('all')
    onFilterChange(undefined, undefined)
  }

  const handleCustomRange = () => {
    if (customStartDate || customEndDate) {
      setActiveFilter('custom')
      onFilterChange(customStartDate, customEndDate)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={handleAllTime}
        >
          All Time
        </Button>
        <Button
          variant={activeFilter === 'thisWeek' ? 'default' : 'outline'}
          size="sm"
          onClick={handleThisWeek}
        >
          This Week
        </Button>
        <Button
          variant={activeFilter === 'lastWeek' ? 'default' : 'outline'}
          size="sm"
          onClick={handleLastWeek}
        >
          Last Week
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">From Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal",
                  !customStartDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customStartDate ? customStartDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customStartDate}
                onSelect={setCustomStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">To Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal",
                  !customEndDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customEndDate ? customEndDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customEndDate}
                onSelect={setCustomEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          variant={activeFilter === 'custom' ? 'default' : 'secondary'}
          size="sm"
          onClick={handleCustomRange}
          disabled={!customStartDate && !customEndDate}
        >
          Apply Custom Range
        </Button>
      </div>
    </div>
  )
}

export default OrderHistoryFilters
