"use client"

import { ConferenceRoomSchema } from '@/lib/validation'
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
  FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from '@/hooks/use-toast'
import { createConferenceRoom, updateConferenceRoom } from '@/lib/actions/conferenceRoom.actions'
import { useState } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ConferenceRoomFormProps {
  room?: z.infer<typeof ConferenceRoomSchema> & { id: string }
  isEdit?: boolean
}

const ConferenceRoomForm = ({ room, isEdit }: ConferenceRoomFormProps) => {
  const { toast } = useToast()
  const router = useRouter()
  const [amenities, setAmenities] = useState<string[]>(
    room?.amenities ? JSON.parse(room.amenities) : []
  )
  const [newAmenity, setNewAmenity] = useState('')

  const form = useForm<z.infer<typeof ConferenceRoomSchema>>({
    resolver: zodResolver(ConferenceRoomSchema),
    defaultValues: {
      name: room?.name || "",
      capacity: room?.capacity || 0,
      location: room?.location || "",
      description: room?.description || "",
      isActive: room?.isActive ?? true,
      amenities: room?.amenities || ""
    }
  })

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      const updatedAmenities = [...amenities, newAmenity.trim()]
      setAmenities(updatedAmenities)
      form.setValue('amenities', JSON.stringify(updatedAmenities))
      setNewAmenity('')
    }
  }

  const removeAmenity = (amenity: string) => {
    const updatedAmenities = amenities.filter(a => a !== amenity)
    setAmenities(updatedAmenities)
    form.setValue('amenities', JSON.stringify(updatedAmenities))
  }

  async function onSubmit(values: z.infer<typeof ConferenceRoomSchema>) {
    try {
      const data = {
        ...values,
        amenities: amenities.length > 0 ? JSON.stringify(amenities) : undefined
      }

      let result
      if (isEdit && room?.id) {
        result = await updateConferenceRoom(room.id, data)
      } else {
        result = await createConferenceRoom(data)
      }

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error
        })
      } else {
        toast({
          title: 'Success',
          description: `Conference room ${isEdit ? 'updated' : 'created'} successfully`
        })
        router.push('/admin/conference-rooms')
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  placeholder="e.g., Conference Room A"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  min={1}
                  placeholder="Maximum number of people"
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
            <FormItem>
              <FormLabel>Location (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  placeholder="e.g., 3rd Floor, East Wing"
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Brief description of the room"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Amenities</FormLabel>
          <div className="flex gap-2">
            <Input
              type="text"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addAmenity()
                }
              }}
              placeholder="e.g., Projector, Whiteboard"
            />
            <Button type="button" onClick={addAmenity}>
              Add
            </Button>
          </div>
          <FormDescription>
            Press Enter or click Add to add an amenity
          </FormDescription>
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-md text-sm"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {isEdit
              ? form.formState.isSubmitting ? 'Updating...' : 'Update Room'
              : form.formState.isSubmitting ? 'Creating...' : 'Create Room'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ConferenceRoomForm
