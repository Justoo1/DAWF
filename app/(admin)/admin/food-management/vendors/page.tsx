import { fetchAllFoodVendorsIncludingInactive } from '@/lib/actions/foodVendor.actions'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { fetchAdminShellUser } from '@/lib/actions/users.action'
import { hasPermission } from '@/lib/permissions'
import { FoodVendorsPageContent } from '@/components/admin/FoodVendorsManager'

interface PageProps {
  searchParams: Promise<{ edit?: string; add?: string }>
}

const FoodVendorsPage = async ({ searchParams }: PageProps) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const gate = await fetchAdminShellUser(session.user.email)
  if (
    !gate.success ||
    !gate.user ||
    !hasPermission(gate.user.role as 'ADMIN' | 'FOOD_COMMITTEE' | 'EMPLOYEE', 'view_food_management')
  ) {
    redirect('/admin')
  }

  const vendorsData = await fetchAllFoodVendorsIncludingInactive()

  if (vendorsData.error) {
    return (
      <main className="admin-main">
        <div className="rounded-xl border border-border/50 bg-card p-6 text-sm text-destructive shadow-sm ring-1 ring-border/30">
          Error: {vendorsData.error}
        </div>
      </main>
    )
  }

  const sp = await searchParams
  const vendors =
    vendorsData.vendors?.map((v) => ({
      id: v.id,
      name: v.name,
      contactName: v.contactName,
      phone: v.phone,
      email: v.email,
      description: v.description,
      isActive: v.isActive,
    })) ?? []

  return (
    <main className="admin-main">
      <FoodVendorsPageContent
        vendors={vendors}
        totalVendors={vendorsData.totalVendors ?? 0}
        initialEditId={sp.edit}
        initialAdd={sp.add === '1' || sp.add === 'true'}
      />
    </main>
  )
}

export default FoodVendorsPage
