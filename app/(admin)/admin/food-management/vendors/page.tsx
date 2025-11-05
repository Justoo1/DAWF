import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchAllFoodVendorsIncludingInactive } from '@/lib/actions/foodVendor.actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Building2, Mail, Phone, User } from 'lucide-react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { fetchUserWithContributions } from '@/lib/actions/users.action'
import { hasPermission } from '@/lib/permissions'

const FoodVendorsPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const userData = await fetchUserWithContributions(session.user.email)
  if (!userData.user || !hasPermission(userData.user.role as 'ADMIN' | 'FOOD_COMMITTEE' | 'EMPLOYEE', 'view_food_management')) {
    redirect('/admin')
  }

  const vendorsData = await fetchAllFoodVendorsIncludingInactive()

  if (vendorsData.error) {
    return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-red-500">Error: {vendorsData.error}</div>
        </div>
      </main>
    )
  }

  const activeVendors = vendorsData.vendors?.filter((v) => v.isActive) || []
  const inactiveVendors = vendorsData.vendors?.filter((v) => !v.isActive) || []

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Food Vendor Management</h1>
          <Link href="/admin/food-management/vendors/new">
            <Button>Add New Vendor</Button>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendorsData.totalVendors || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeVendors.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inactiveVendors.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Vendors List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeVendors.length > 0 ? (
                activeVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex justify-between items-start p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5 text-gray-600" />
                        <h3 className="text-lg font-semibold">{vendor.name}</h3>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        {vendor.contactName && (
                          <p className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Contact: {vendor.contactName}
                          </p>
                        )}
                        {vendor.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {vendor.phone}
                          </p>
                        )}
                        {vendor.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {vendor.email}
                          </p>
                        )}
                        {vendor.description && (
                          <p className="mt-2 text-gray-500">{vendor.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/food-management/vendors/${vendor.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 italic">No active vendors found</p>
                  <Link href="/admin/food-management/vendors/new">
                    <Button className="mt-4">Add Your First Vendor</Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inactive Vendors */}
        {inactiveVendors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-500">Inactive Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inactiveVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex justify-between items-start p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex-1 opacity-75">
                      <h4 className="font-semibold text-gray-700">{vendor.name}</h4>
                      {vendor.contactName && (
                        <p className="text-sm text-gray-600">Contact: {vendor.contactName}</p>
                      )}
                    </div>
                    <Link href={`/admin/food-management/vendors/${vendor.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Reactivate
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

export default FoodVendorsPage
