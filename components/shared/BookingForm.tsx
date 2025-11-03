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
import { createBooking, checkRoomAvailability } from '@/lib/actions/conferenceRoom.actions'
import { Textarea } from '../ui/textarea'
import { useState } from 'react'
import { ConferenceRoomValues } from '@/lib/validation'

interface BookingFormProps {
  userId: string
  rooms: ConferenceRoomValues[]
  onSuccess?: () => void
}

const BookingForm = ({ userId, rooms, onSuccess }: BookingFormProps) => {
  const { toast } = useToast()
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  const form = useForm<z.infer<typeof ConferenceRoomBookingCreateSchema>>({
    resolver: zodResolver(ConferenceRoomBookingCreateSchema),
    defaultValues: {
      roomId: "",
      title: "",
      description: "",
      start: new Date().toISOString().slice(0, 16),
      end: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // 1 hour from now
      purpose: "",
      attendeeCount: undefined,
    }
  })

  const checkAvailability = async () => {
    const roomId = form.getValues("roomId")
    const start = form.getValues("start")
    const end = form.getValues("end")

    if (!roomId || !start || !end) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a room and time period'
      })
      return
    }

    setIsCheckingAvailability(true)
    try {
      const result = await checkRoomAvailability(roomId, new Date(start), new Date(end))

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error
        })
      } else if (result.isAvailable) {
        toast({
          title: 'Available',
          description: 'The room is available for the selected time period'
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Not Available',
          description: `The room has ${result.conflictingBookings?.length} conflicting booking(s)`
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to check availability'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message
      })
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  async function onSubmit(values: z.infer<typeof ConferenceRoomBookingCreateSchema>) {
    try {
      const result = await createBooking({
        ...values,
        userId,
        start: new Date(values.start),
        end: new Date(values.end)
      })

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error
        })
      } else {
        toast({
          title: 'Success',
          description: 'Conference room booked successfully'
        })
        form.reset()
        onSuccess?.()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong'
      })
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-full overflow-hidden">
        <FormField
          control={form.control}
          name="roomId"
          render={({ field }) => (
            <FormItem className='text-white'>
              <FormLabel>Conference Room</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a conference room" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id!}>
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
            <FormItem className='text-white'>
              <FormLabel>Meeting Title</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  placeholder="e.g., Team Planning Meeting"
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
          <FormField
            control={form.control}
            name="start"
            render={({ field }) => (
              <FormItem className='text-white min-w-0'>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full min-w-0"
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
              <FormItem className='text-white min-w-0'>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full min-w-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={checkAvailability}
          disabled={isCheckingAvailability}
          className="w-full"
        >
          {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
        </Button>

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem className='text-white'>
              <FormLabel>Purpose (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  placeholder="e.g., Project Planning, Client Meeting"
                  className="w-full"
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
            <FormItem className='text-white'>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Add meeting agenda or additional details"
                  className="w-full resize-none"
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
            <FormItem className='text-white'>
              <FormLabel>Expected Attendees (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  min={1}
                  placeholder="Number of expected attendees"
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? 'Booking...' : 'Book Conference Room'}
        </Button>
      </form>
    </Form>
  )
}

export default BookingForm
