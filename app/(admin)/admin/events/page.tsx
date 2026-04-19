import AllEvents from '@/components/admin/Events'
import QuickActions from '@/components/admin/QuickActions'
import { fetchAllEvents } from '@/lib/actions/events.actions'
import { AdminPageContent } from "@/components/admin/layout/AdminPageContent"

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
      <AdminPageContent>
        <AllEvents events={data.events!} />
        <QuickActions />
      </AdminPageContent>
    </main>
  )
}

export default EventsPage;
