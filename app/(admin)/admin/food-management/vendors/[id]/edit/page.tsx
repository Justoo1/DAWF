import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import FoodVendorForm from '@/components/admin/FoodVendorForm'
import { fetchFoodVendorById } from '@/lib/actions/foodVendor.actions'
import { notFound } from 'next/navigation'

const EditVendorPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const vendorData = await fetchFoodVendorById(id)

  if (vendorData.error || !vendorData.vendor) {
    notFound()
  }

  const vendor = vendorData.vendor

  // Transform null to undefined for optional fields
  const vendorForForm = {
    id: vendor.id,
    name: vendor.name,
    contactName: vendor.contactName ?? undefined,
    phone: vendor.phone ?? undefined,
    email: vendor.email ?? undefined,
    description: vendor.description ?? undefined,
    isActive: vendor.isActive
  }

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Edit Food Vendor</h1>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <FoodVendorForm vendor={vendorForForm} isEdit />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default EditVendorPage
