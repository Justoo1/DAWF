import { Card } from '@/components/ui/card'
import ConferenceRoomForm from '@/components/admin/ConferenceRoomForm'
import { fetchConferenceRoomById } from '@/lib/actions/conferenceRoom.actions'
import { notFound } from 'next/navigation'

interface EditConferenceRoomPageProps {
  params: Promise<{
    id: string
  }>
}

const EditConferenceRoomPage = async ({ params }: EditConferenceRoomPageProps) => {
  const { id } = await params
  const result = await fetchConferenceRoomById(id)

  if (result.error || !result.room) {
    notFound()
  }

  const room = result.room

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <div className="mx-auto max-w-3xl">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Edit Conference Room</h1>
          <ConferenceRoomForm
            room={{
              id: room.id,
              name: room.name,
              capacity: room.capacity,
              location: room.location || '',
              description: room.description || '',
              isActive: room.isActive,
              amenities: room.amenities || ''
            }}
            isEdit={true}
          />
        </Card>
      </div>
    </main>
  )
}

export default EditConferenceRoomPage
