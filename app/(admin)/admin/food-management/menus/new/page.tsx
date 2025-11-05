import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import WeeklyMenuForm from '@/components/admin/WeeklyMenuForm'
import { fetchAllFoodVendors } from '@/lib/actions/foodVendor.actions'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

const NewMenuPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const vendorsData = await fetchAllFoodVendors()

  if (vendorsData.error || !vendorsData.vendors || vendorsData.vendors.length === 0) {
    return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-red-500 mb-4">
                {vendorsData.error || 'No vendors available'}
              </p>
              <p className="text-gray-600">
                Please add at least one vendor before creating a menu.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Create Weekly Food Menu</h1>

        <Card>
          <CardHeader>
            <CardTitle>Menu Details</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyMenuForm vendors={vendorsData.vendors} userId={session.user.id} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default NewMenuPage
