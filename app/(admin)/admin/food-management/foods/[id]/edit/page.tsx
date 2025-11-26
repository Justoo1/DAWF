import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import FoodForm from '@/components/admin/FoodForm'
import { fetchAllFoodVendors } from '@/lib/actions/foodVendor.actions'
import { fetchFoodById } from '@/lib/actions/food.actions'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

const EditFoodPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const { id } = await params

  const [foodData, vendorsData] = await Promise.all([
    fetchFoodById(id),
    fetchAllFoodVendors()
  ])

  if (foodData.error || !foodData.food) {
    return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-red-500">Error: {foodData.error || 'Food not found'}</div>
        </div>
      </main>
    )
  }

  if (vendorsData.error || !vendorsData.vendors || vendorsData.vendors.length === 0) {
    return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-red-500">Error: {vendorsData.error || 'No vendors available'}</div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Edit Food Item</h1>

        <Card>
          <CardHeader>
            <CardTitle>Food Details</CardTitle>
          </CardHeader>
          <CardContent>
            <FoodForm
              vendors={vendorsData.vendors}
              food={foodData.food}
              isEdit={true}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default EditFoodPage
