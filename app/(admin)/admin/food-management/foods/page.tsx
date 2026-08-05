import { fetchAllFoods } from '@/lib/actions/food.actions'
import { fetchAllFoodVendors } from '@/lib/actions/foodVendor.actions'
import { AdminPageContent } from '@/components/admin/layout/AdminPageContent'
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader'
import { FoodsClient } from '@/components/admin/FoodsClient'

// See menus/page.tsx for why this is forced dynamic: without it, this page can be
// statically prerendered at build time and serve stale food/vendor data in production.
export const dynamic = 'force-dynamic'

const FoodsPage = async () => {
  const [foodsData, vendorsData] = await Promise.all([
    fetchAllFoods(),
    fetchAllFoodVendors()
  ])

  if (foodsData.error) {
    return (
      <main className="admin-main">
        <AdminPageContent>
          <div className="rounded-xl border border-border/50 bg-card p-6 text-sm text-destructive shadow-sm ring-1 ring-border/30">
            Error: {foodsData.error}
          </div>
        </AdminPageContent>
      </main>
    )
  }

  const vendors = vendorsData.vendors || []
  const foods = foodsData.foods || []

  return (
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Food Items"
          description="Manage food items and assign them to vendors."
          action={<div />}
        />
        <FoodsClient vendors={vendors} foods={foods} />
      </AdminPageContent>
    </main>
  )
}

export default FoodsPage
