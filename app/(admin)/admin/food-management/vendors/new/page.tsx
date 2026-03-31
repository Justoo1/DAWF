import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import FoodVendorForm from '@/components/admin/FoodVendorForm'

const NewVendorPage = () => {
  return (
    <main className="admin-main">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Add New Food Vendor</h1>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <FoodVendorForm />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default NewVendorPage
