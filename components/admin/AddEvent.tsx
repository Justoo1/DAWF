"use client"

import { EventCreateSchema, EventValues } from '@/lib/validation'
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
// import { createContribution } from '@/app/actions/contribution'
import { useToast } from '@/hooks/use-toast'
import { createEvent, updateEvent } from '@/lib/actions/events.actions'
import { Textarea } from '../ui/textarea'
import { useEffect } from 'react'

interface EventAddProps {
    update?: boolean
    event?: EventValues
    userId: string
  }

const EventAdd = ({ update, event, userId }: EventAddProps) => {
    const {toast} = useToast()

  const form = useForm<z.infer<typeof EventCreateSchema>>({
    resolver: zodResolver(EventCreateSchema),
    defaultValues: {
      title: event ? event.title : "",
      start: event ? event.start.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      end: event ? event.end.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      status: event ? event.status : "ACTIVE",
      type: event ? event.type : "BIRTHDAY",
      category: event ? event.category : "WELFARE",
      location: event ? event.location! : "",
      description: event ? event.description! : "",
      year: event ? event.year : new Date().getFullYear(),
      quarter: event ? event.quarter : Math.ceil((new Date().getMonth() + 1) / 3),
      month: event ? event.month : new Date().getMonth() + 1,
      maxAttendees: event ? event.maxAttendees! : undefined,
      isRecurring: event ? event.isRecurring : false,
      recurrencePattern: event ? event.recurrencePattern! : undefined,
    }
  })

    const { watch, setValue } = form;
    const startDate = watch("start");
    const selectedCategory = watch("category");

    // Update the month whenever the start date changes
    useEffect(() => {
        if (startDate) {
        const selectedDate = new Date(startDate);
        setValue("month", selectedDate.getMonth() + 1); // Months are 0-indexed
        setValue("year", selectedDate.getFullYear());
        }
    }, [startDate, setValue]);

    async function onSubmit(values: z.infer<typeof EventCreateSchema>) {

        try {
            const data = {
                ...values,
                start: new Date(values.start),
                end: new Date(values.end),
                userId : event ? event.userId : userId
            }
          
          if(update) {
            const result = await updateEvent(event!.id!, data)
          
          if (result.error) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: result.error
            })
          } else {
            toast({
              title: 'Success',
              variant: 'default',
              color: 'green',
              description: 'Event updated successfully'
            })
            form.reset()
          }
          }else {
            console.log(data)
            const result = await createEvent(data)
          
          if (result.error) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: result.error
            })
          } else {
            toast({
              title: 'Success',
              description: 'Event added successfully'
            })
            form.reset()
          }
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="WELFARE">Welfare Event</SelectItem>
                  <SelectItem value="COMPANY">Company Event</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {selectedCategory === 'WELFARE' && (
                    <>
                      <SelectItem value="BIRTHDAY">Birthday</SelectItem>
                      <SelectItem value="FUNERAL">Funeral</SelectItem>
                      <SelectItem value="CHILDBIRTH">Childbirth</SelectItem>
                      <SelectItem value="MARRIAGE">Marriage</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </>
                  )}
                  {selectedCategory === 'COMPANY' && (
                    <>
                      <SelectItem value="TEAM_BUILDING">Team Building</SelectItem>
                      <SelectItem value="TRAINING">Training</SelectItem>
                      <SelectItem value="MEETING">Meeting</SelectItem>
                      <SelectItem value="WORKSHOP">Workshop</SelectItem>
                      <SelectItem value="CONFERENCE">Conference</SelectItem>
                      <SelectItem value="TOWN_HALL">Town Hall</SelectItem>
                      <SelectItem value="CELEBRATION">Celebration</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3">
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                <FormItem className='w-full'>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                    <Input 
                        type="text" 
                        {...field} 
                        placeholder="Event Title" 
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                <FormItem className='w-full'>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                    <Input 
                        type="text" 
                        {...field} 
                        placeholder="Event Location" 
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <div className="flex gap-3">
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                <FormItem className='w-full'>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                    <Textarea 
                        {...field} 
                        placeholder="Describe the event" 
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                <FormItem className='w-full'>
                    <FormLabel>Status</FormLabel>
                    <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    >
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <div className="flex gap-3">
            <FormField
                control={form.control}
                name="start"
                render={({ field }) => (
                <FormItem className='w-full'>
                    <FormLabel>Starts At</FormLabel>
                    <FormControl>
                    <Input
                        type="datetime-local"
                        {...field}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="Select start date and time"
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
                <FormItem className='w-full'>
                    <FormLabel>End At</FormLabel>
                    <FormControl>
                    <Input
                        type="datetime-local"
                        {...field}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="Select start date and time"
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />

        </div>
        

        <div className="flex gap-3">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    min={2020}
                    max={new Date().getFullYear()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Month</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    min={1}
                    max={new Date().getMonth() + 1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quarter"
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Quarter</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Quarter" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                    <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                    <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                    <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {selectedCategory === 'COMPANY' && (
          <div className="flex gap-3">
            <FormField
              control={form.control}
              name="maxAttendees"
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Max Attendees (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      min={1}
                      placeholder="Enter maximum number of attendees"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {update ? form.formState.isSubmitting ? 'Updating...' : 'Update Event' : form.formState.isSubmitting ? 'Adding...' : 'Add Event'}
        </Button>
      </form>
    </Form>
  )
}

export default EventAdd