"use client"

import { useMemo, useState } from "react"
import { CalendarDays } from "lucide-react"
import { format } from "date-fns"
import { type DateRange } from "react-day-picker"
import { useRouter, useSearchParams } from "next/navigation"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function parseIsoDate(value?: string) {
  if (!value) return undefined
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return undefined
  return d
}

function toIsoDate(value: Date) {
  return format(value, "yyyy-MM-dd")
}

export default function LeaveRequestDateRangePicker({
  initialFrom,
  initialTo,
}: {
  initialFrom?: string
  initialTo?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [range, setRange] = useState<DateRange | undefined>(() => {
    const from = parseIsoDate(initialFrom)
    const to = parseIsoDate(initialTo)
    if (!from && !to) return undefined
    return { from, to }
  })

  const label = useMemo(() => {
    if (!range?.from && !range?.to) return "Select date range"
    if (range.from && range.to) {
      return `${format(range.from, "MMM d, yyyy")} - ${format(range.to, "MMM d, yyyy")}`
    }
    if (range.from) return format(range.from, "MMM d, yyyy")
    return "Select date range"
  }, [range])

  const applyToUrl = () => {
    const next = new URLSearchParams(searchParams.toString())
    if (range?.from) next.set("from", toIsoDate(range.from))
    else next.delete("from")
    if (range?.to) next.set("to", toIsoDate(range.to))
    else next.delete("to")
    router.push(`/admin/leave-management/requests?${next.toString()}`)
  }

  const clear = () => {
    setRange(undefined)
    const next = new URLSearchParams(searchParams.toString())
    next.delete("from")
    next.delete("to")
    router.push(`/admin/leave-management/requests?${next.toString()}`)
  }

  return (
    <div className="flex items-center bg-white dark:bg-zinc-900 border border-primary/10 rounded-lg px-3 py-2">
      <CalendarDays className="h-5 w-5 text-primary mr-2 shrink-0" />
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full text-left text-sm text-slate-700 dark:text-slate-200"
          >
            {label}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} initialFocus />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={clear}
                className="h-9 px-3 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-zinc-800"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={applyToUrl}
                className="h-9 px-3 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Apply
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

