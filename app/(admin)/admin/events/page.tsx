import AllEvents from '@/components/admin/Events'
import QuickActions from '@/components/admin/QuickActions'
import { fetchAllEvents } from '@/lib/actions/events.actions'

const EventsPage = async () => {
    const data = await fetchAllEvents()

    if (!data.success) {
        return <div>Error: {data.error}</div>
    }
    else if (!data.events) {
        return <div>No users found</div>
    }

  return (
    <main className="admin-main">
      <AllEvents events={data.events!} />
      <QuickActions />
    </main>
  )
}

export default EventsPage;
