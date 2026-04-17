"use client"

import {
  ConferenceRoomBookingCreateSchema,
  combineLocalDateAndTime,
  ConferenceRoomValues,
} from '@/lib/validation'
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
import { CheckCircle2 } from 'lucide-react'
import { RequiredMark } from '@/components/ui/required-mark'
import { cn } from '@/lib/utils'

interface BookingFormProps {
  userId: string
  rooms: ConferenceRoomValues[]
  onSuccess?: () => void
}

const BUSINESS_START_HOUR = 10
const BUSINESS_END_HOUR = 19

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function todayDateInputValue() {
  const t = new Date()
  return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`
}

function localDayBoundsFromDateOnly(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  if (!y || !m || !d) return null
  const start = new Date(y, m - 1, d, BUSINESS_START_HOUR, 0, 0, 0)
  const end = new Date(y, m - 1, d, BUSINESS_END_HOUR, 0, 0, 0)
  return { start, end }
}

/** Locale-friendly range for UI copy (e.g. "10:00 AM–7:00 PM"). */
function businessHoursRangeLabel() {
  const base = new Date(2020, 0, 1)
  const start = new Date(base)
  start.setHours(BUSINESS_START_HOUR, 0, 0, 0)
  const end = new Date(base)
  end.setHours(BUSINESS_END_HOUR, 0, 0, 0)
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" }
  return `${start.toLocaleTimeString(undefined, opts)}–${end.toLocaleTimeString(undefined, opts)}`
}

function formatSlotLabel(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" }
  return `${start.toLocaleTimeString(undefined, opts)} – ${end.toLocaleTimeString(undefined, opts)}`
}

function timeFromDate(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

const BookingForm = ({ userId, rooms, onSuccess }: BookingFormProps) => {
  const { toast } = useToast()
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [slotRows, setSlotRows] = useState<RoomDaySlotRow[] | null>(null)
  /** Must choose a free slot from the grid after loading availability (typing times alone is not enough). */
  const [hasPickedAvailableSlot, setHasPickedAvailableSlot] = useState(false)
  /** `startIso` of the slot the user tapped (for highlighting). */
  const [pickedSlotKey, setPickedSlotKey] = useState<string | null>(null)

  const resetSlotSelection = () => {
    setHasPickedAvailableSlot(false)
    setPickedSlotKey(null)
  }

  const defaults = useMemo(() => {
    return {
      date: todayDateInputValue(),
      startTime: "10:00",
      endTime: "10:30",
    }
  }, [])

  const form = useForm<z.infer<typeof ConferenceRoomBookingCreateSchema>>({
    mode: "onChange",
    resolver: zodResolver(ConferenceRoomBookingCreateSchema),
    defaultValues: {
      roomId: "",
      title: "",
      description: "",
      date: defaults.date,
      startTime: defaults.startTime,
      endTime: defaults.endTime,
      attendeeCount: undefined,
    },
  })

  const roomIdWatch = form.watch("roomId")
  const dateWatch = form.watch("date")

  const loadDaySlots = async () => {
    const roomId = form.getValues("roomId")
    const dateVal = form.getValues("date")
    if (!roomId) {
      toast({
        variant: "destructive",
        title: "Select a room",
        description: "Choose a conference room first.",
      })
      return
    }
    if (!dateVal?.trim()) {
      toast({
        variant: "destructive",
        title: "Select a date",
        description: "Choose which day to load slots for.",
      })
      return
    }

    const bounds = localDayBoundsFromDateOnly(dateVal)
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
        resetSlotSelection()
        return
      }

      if ("success" in result && result.success) {
        setSlotRows(result.slots)
        resetSlotSelection()
        const free = result.slots.filter((s) => s.available).length
        const busy = result.slots.length - free
        toast({
          title: "Availability loaded",
          description:
            free > 0
              ? `${free} free slot${free === 1 ? "" : "s"}, ${busy} busy — tap a green slot to confirm your times.`
              : `No free slots this day (${busy} busy). Try another date.`,
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
      resetSlotSelection()
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  const applySlot = (row: RoomDaySlotRow) => {
    if (!row.available) return
    const s = new Date(row.startIso)
    const e = new Date(row.endIso)
    form.setValue(
      "date",
      `${s.getFullYear()}-${pad2(s.getMonth() + 1)}-${pad2(s.getDate())}`,
      { shouldValidate: true }
    )
    form.setValue("startTime", timeFromDate(s), { shouldValidate: true })
    form.setValue("endTime", timeFromDate(e), { shouldValidate: true })
    setHasPickedAvailableSlot(true)
    setPickedSlotKey(row.startIso)
    toast({
      title: "Slot selected",
      description: formatSlotLabel(s, e),
    })
  }

  const clearPickState = () => {
    resetSlotSelection()
  }

  async function onSubmit(values: z.infer<typeof ConferenceRoomBookingCreateSchema>) {
    const start = combineLocalDateAndTime(values.date, values.startTime)
    const end = combineLocalDateAndTime(values.date, values.endTime)
    if (!start || !end) {
      toast({
        variant: "destructive",
        title: "Invalid times",
        description: "Could not read date and time. Please try again.",
      })
      return
    }

    try {
      const result = await createBooking({
        roomId: values.roomId,
        title: values.title,
        description: values.description,
        userId,
        start,
        end,
        attendeeCount: values.attendeeCount,
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
          date: defaults.date,
          startTime: defaults.startTime,
          endTime: defaults.endTime,
          attendeeCount: undefined,
        })
        setSlotRows(null)
        resetSlotSelection()
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

  const canSubmit =
    form.formState.isValid && hasPickedAvailableSlot && !form.formState.isSubmitting

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
                  resetSlotSelection()
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
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Date
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                    setSlotRows(null)
                    clearPickState()
                  }}
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full min-w-0">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Start time
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value)
                      clearPickState()
                    }}
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 w-full min-w-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  End time
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value)
                      clearPickState()
                    }}
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 w-full min-w-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <p className="text-xs text-muted-foreground -mt-2">
          Slots are for this room on the selected date ({businessHoursRangeLabel()}, 30 minutes each).
          Load availability, then tap a free slot — that confirms your booking window. Changing date or
          times clears the selection until you pick a slot again.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={loadDaySlots}
          disabled={isCheckingAvailability || !roomIdWatch || !dateWatch}
          className="w-full h-11 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          {isCheckingAvailability ? "Loading…" : "Check availability"}
        </Button>

        {slotRows && slotRows.length > 0 ? (
          <div className="space-y-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 p-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Time slots (this room)
            </p>
            <p className="text-xs text-muted-foreground">
              Green = free. Gray = booked. Your choice shows a checkmark badge.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
              {slotRows.map((row) => {
                const s = new Date(row.startIso)
                const e = new Date(row.endIso)
                const label = formatSlotLabel(s, e)
                const isBusy = !row.available
                const isPicked =
                  row.available && hasPickedAvailableSlot && pickedSlotKey === row.startIso
                return (
                  <button
                    key={row.startIso}
                    type="button"
                    disabled={isBusy}
                    title={
                      isBusy
                        ? row.busyLabel || "Booked"
                        : isPicked
                          ? "Selected time"
                          : "Use this time"
                    }
                    onClick={() => applySlot(row)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-center text-[11px] font-semibold leading-tight transition-colors",
                      isBusy &&
                        "cursor-not-allowed border-border/80 bg-muted/70 text-muted-foreground opacity-70 dark:bg-muted/40 dark:opacity-80",
                      !isBusy &&
                        !isPicked &&
                        "border-emerald-500/50 bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/20 dark:text-emerald-200",
                      !isBusy &&
                        isPicked &&
                        "border-emerald-600/35 bg-gradient-to-b from-slate-100/95 to-slate-200/90 text-slate-800 shadow-sm ring-1 ring-emerald-500/25 dark:from-slate-700/95 dark:to-slate-800/90 dark:text-slate-100 dark:ring-emerald-400/20"
                    )}
                  >
                    <span className={cn("block", isBusy && "opacity-90")}>{label}</span>
                    {isPicked ? (
                      <span className="mt-1.5 inline-flex w-full items-center justify-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 py-0.5 pl-1 pr-1.5 text-[10px] font-semibold tracking-tight text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200">
                        <CheckCircle2
                          className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                          strokeWidth={2.25}
                          aria-hidden
                        />
                        Selected
                      </span>
                    ) : null}
                    {isBusy && row.busyLabel ? (
                      <span className="mt-1 block text-[9px] font-normal opacity-80 line-clamp-2">
                        {row.busyLabel}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

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
          disabled={!canSubmit}
          title={
            !hasPickedAvailableSlot
              ? "Choose a free slot from the grid after checking availability"
              : !form.formState.isValid
                ? "Fill required fields correctly"
                : undefined
          }
          className="w-full h-12 rounded-xl bg-[#10A074] hover:bg-[#0d8460] text-white font-bold uppercase tracking-widest text-[13px] transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-60"
        >
          {form.formState.isSubmitting ? "Booking…" : "Book conference room"}
        </Button>
      </form>
    </Form>
  )
}

export default BookingForm
