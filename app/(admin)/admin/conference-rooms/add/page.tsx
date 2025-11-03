import { Card } from '@/components/ui/card'
import ConferenceRoomForm from '@/components/admin/ConferenceRoomForm'

const AddConferenceRoomPage = () => {
  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <div className="mx-auto max-w-3xl">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Add Conference Room</h1>
          <ConferenceRoomForm />
        </Card>
      </div>
    </main>
  )
}

export default AddConferenceRoomPage
