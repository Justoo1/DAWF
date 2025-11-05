import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import WeeklyMenuForm from '@/components/admin/WeeklyMenuForm'
import { fetchFoodMenuById } from '@/lib/actions/foodMenu.actions'
import { fetchAllFoodVendors } from '@/lib/actions/foodVendor.actions'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

// Tell Next.js to not pre-generate any pages for this dynamic route
export const dynamic = 'force-dynamic'

const EditMenuPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const { id } = await params
  const [menuData, vendorsData] = await Promise.all([
    fetchFoodMenuById(id),
    fetchAllFoodVendors()
  ])

  if (menuData.error || !menuData.menu) {
    notFound()
  }

  if (vendorsData.error || !vendorsData.vendors) {
    return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-red-500">Error loading vendors: {vendorsData.error}</div>
        </div>
      </main>
    )
  }

  const menu = menuData.menu

  // Only allow editing if menu is in DRAFT status
  if (menu.status !== 'DRAFT') {
    return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
        <div className="mx-auto max-w-6xl">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Cannot Edit Published Menu</h2>
              <p className="text-gray-600 mb-4">
                This menu has been published and can no longer be edited.
              </p>
              <a href="/admin/food-management/menus" className="text-primary hover:underline">
                Back to Menus
              </a>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Edit Weekly Menu</h1>
          <p className="text-gray-600 mt-1">Update the menu details and items</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Menu Information</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyMenuForm
              vendors={vendorsData.vendors}
              userId={session.user.id}
              menu={menu}
              isEdit
            />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default EditMenuPage
