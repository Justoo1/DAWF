"use client"

import { ConferenceRoomBookingCreateSchema } from '@/lib/validation'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast'
import {
  createBooking,
  fetchConferenceRoomDaySlots,
  type RoomDaySlotRow,
} from '@/lib/actions/conferenceRoom.actions'
import { Textarea } from '../ui/textarea'
import { useMemo, useState } from 'react'
import { ConferenceRoomValues } from '@/lib/validation'
import { RequiredMark } from '@/components/ui/required-mark'
import { cn } from '@/lib/utils'

interface BookingFormProps {
  userId: string
  rooms: ConferenceRoomValues[]
  onSuccess?: () => void
}

const BUSINESS_START_HOUR = 8
const BUSINESS_END_HOUR = 18

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function todayDateInputValue() {
  const t = new Date()
  return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`
}

/** Value for `datetime-local` from a Date in local time */
function toDatetimeLocalValue(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function localDayBounds(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  if (!y || !m || !d) return null
  const start = new Date(y, m - 1, d, BUSINESS_START_HOUR, 0, 0, 0)
  const end = new Date(y, m - 1, d, BUSINESS_END_HOUR, 0, 0, 0)
  return { start, end }
}

function formatSlotLabel(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" }
  return `${start.toLocaleTimeString(undefined, opts)} – ${end.toLocaleTimeString(undefined, opts)}`
}

const BookingForm = ({ userId, rooms, onSuccess }: BookingFormProps) => {
  const { toast } = useToast()
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [slotDay, setSlotDay] = useState(() => todayDateInputValue())
  const [slotRows, setSlotRows] = useState<RoomDaySlotRow[] | null>(null)

  const defaultStartEnd = useMemo(() => {
    const start = new Date()
    const end = new Date(Date.now() + 3600000)
    return {
      start: toDatetimeLocalValue(start),
      end: toDatetimeLocalValue(end),
    }
  }, [])

  const form = useForm<z.infer<typeof ConferenceRoomBookingCreateSchema>>({
    resolver: zodResolver(ConferenceRoomBookingCreateSchema),
    defaultValues: {
      roomId: "",
      title: "",
      description: "",
      start: defaultStartEnd.start,
      end: defaultStartEnd.end,
      attendeeCount: undefined,
    }
  })

  const roomIdWatch = form.watch("roomId")

  const loadDaySlots = async () => {
    const roomId = form.getValues("roomId")
    if (!roomId) {
      toast({
        variant: "destructive",
        title: "Select a room",
        description: "Choose a conference room first.",
      })
      return
    }
    if (!slotDay) {
      toast({
        variant: "destructive",
        title: "Select a date",
        description: "Choose which day to view availability for.",
      })
      return
    }

    const bounds = localDayBounds(slotDay)
    if (!bounds) {
      toast({
        variant: "destructive",
        title: "Invalid date",
        description: "Please pick a valid date.",
      })
      return
    }

    setIsCheckingAvailability(true)
    try {
      const result = await fetchConferenceRoomDaySlots(
        roomId,
        bounds.start.toISOString(),
        bounds.end.toISOString()
      )

      if ("error" in result && result.error) {
        toast({
          variant: "destructive",
          title: "Availability",
          description: result.error,
        })
        setSlotRows(null)
        return
      }

      if ("success" in result && result.success) {
        setSlotRows(result.slots)
        const free = result.slots.filter((s) => s.available).length
        const busy = result.slots.length - free
        toast({
          title: "Availability loaded",
          description: `${free} free slot${free === 1 ? "" : "s"}, ${busy} busy — pick a free slot or set times below.`,
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load availability"
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      })
      setSlotRows(null)
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  const applySlot = (row: RoomDaySlotRow) => {
    if (!row.available) return
    const start = new Date(row.startIso)
    const end = new Date(row.endIso)
    form.setValue("start", toDatetimeLocalValue(start))
    form.setValue("end", toDatetimeLocalValue(end))
    toast({
      title: "Time selected",
      description: formatSlotLabel(start, end),
    })
  }

  async function onSubmit(values: z.infer<typeof ConferenceRoomBookingCreateSchema>) {
    try {
      const result = await createBooking({
        ...values,
        userId,
        start: new Date(values.start),
        end: new Date(values.end),
      })

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      } else {
        toast({
          title: "Success",
          description: "Conference room booking request has been submitted, waiting for approval",
        })
        form.reset({
          roomId: "",
          title: "",
          description: "",
          start: defaultStartEnd.start,
          end: defaultStartEnd.end,
          attendeeCount: undefined,
        })
        setSlotRows(null)
        setSlotDay(todayDateInputValue())
        onSuccess?.()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
      })
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-full overflow-hidden">
        <FormField
          control={form.control}
          name="roomId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Conference Room
              </FormLabel>
              <Select
                onValueChange={(v) => {
                  field.onChange(v)
                  setSlotRows(null)
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <SelectValue placeholder="Select a conference room" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id!} className="rounded-lg">
                      {room.name} (Capacity: {room.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <label
            htmlFor="booking-slot-day"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            Day to check
          </label>
          <Input
            id="booking-slot-day"
            type="date"
            value={slotDay}
            onChange={(e) => {
              setSlotDay(e.target.value)
              setSlotRows(null)
            }}
            className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 w-full max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            {BUSINESS_START_HOUR}:00–{BUSINESS_END_HOUR}:00 (30-minute slots). Load availability before choosing start/end times.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={loadDaySlots}
          disabled={isCheckingAvailability || !roomIdWatch}
          className="w-full h-11 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          {isCheckingAvailability ? "Loading…" : "Check availability"}
        </Button>

        {slotRows && slotRows.length > 0 ? (
          <div className="space-y-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 p-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Time slots
            </p>
            <p className="text-xs text-muted-foreground">
              Green = available. Red = already booked. Tap a free slot to fill start and end times.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
              {slotRows.map((row) => {
                const s = new Date(row.startIso)
                const e = new Date(row.endIso)
                const label = formatSlotLabel(s, e)
                return (
                  <button
                    key={row.startIso}
                    type="button"
                    disabled={!row.available}
                    title={row.available ? "Use this time" : row.busyLabel || "Busy"}
                    onClick={() => applySlot(row)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-center text-[11px] font-semibold leading-tight transition-colors",
                      row.available
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/20 dark:text-emerald-200"
                        : "cursor-not-allowed border-red-500/30 bg-red-500/10 text-red-900/80 dark:text-red-300/90 opacity-90"
                    )}
                  >
                    <span className="block">{label}</span>
                    {!row.available && row.busyLabel ? (
                      <span className="mt-1 block text-[9px] font-normal opacity-90 line-clamp-2">
                        {row.busyLabel}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full min-w-0">
          <FormField
            control={form.control}
            name="start"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Start time
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 w-full min-w-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  End time
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 w-full min-w-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Meeting title
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  placeholder="e.g. Team planning meeting"
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Description (optional)
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Agenda or extra details"
                  className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 w-full resize-none min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attendeeCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Expected attendees (optional)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value ? Number(e.target.value) : undefined)
                  }
                  min={1}
                  placeholder="Headcount"
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full h-12 rounded-xl bg-[#10A074] hover:bg-[#0d8460] text-white font-bold uppercase tracking-widest text-[13px] transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98]"
        >
          {form.formState.isSubmitting ? "Booking…" : "Book conference room"}
        </Button>
      </form>
    </Form>
  )
}

export default BookingForm
