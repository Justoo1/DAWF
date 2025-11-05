import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchFoodMenuById } from '@/lib/actions/foodMenu.actions'
import { getMenuOrderSummary, getSelectionStatistics } from '@/lib/actions/foodSelection.actions'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import { Calendar, TrendingUp, Download, UtensilsCrossed, UserCheck } from 'lucide-react'
import Link from 'next/link'
import AdminAddFoodOrderDialog from '@/components/admin/AdminAddFoodOrderDialog'

// Tell Next.js to not pre-generate any pages for this dynamic route
export const dynamic = 'force-dynamic'

const OrdersViewPage = async ({ params }: { params: Promise<{ menuId: string }> }) => {
  const { menuId } = await params
  const [menuData, summaryData, statsData] = await Promise.all([
    fetchFoodMenuById(menuId),
    getMenuOrderSummary(menuId),
    getSelectionStatistics(menuId)
  ])

  if (menuData.error || !menuData.menu || summaryData.error) {
    notFound()
  }

  const { menu } = menuData
  const { selectionsByDay, itemCounts } = summaryData

  const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Food Orders Summary</h1>
            <p className="text-gray-600">{menu.vendor.name}</p>
          </div>
          <div className="flex gap-2">
            <AdminAddFoodOrderDialog menu={menu} />
            <Link href={`/admin/food-management/orders/${menuId}/export`}>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </Link>
            <Link href="/admin/food-management/menus">
              <Button variant="outline">
                Back to Menus
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Week Period</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {new Date(menu.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(menu.weekEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {menu.vendor.name}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees Participated</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.employeesWithSelections} / {statsData.success ? statsData.statistics.totalUsers : '?'}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsData.success ? `${statsData.statistics.participationRate}% participation` : 'Calculating...'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Meal Orders</CardTitle>
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.actualMealOrders}</div>
              <p className="text-xs text-muted-foreground">
                Actual meals to prepare
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    menu.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800'
                      : menu.status === 'CLOSED'
                      ? 'bg-orange-100 text-orange-800'
                      : menu.status === 'SENT'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {menu.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summaryData.totalSelections} total day selections
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Orders by Day */}
        {DAYS_OF_WEEK.map((day) => {
          const daySelections = selectionsByDay?.[day] || []
          const dayItemCounts = itemCounts?.filter((ic: { dayOfWeek: string }) => ic.dayOfWeek === day) || []

          if (daySelections.length === 0) return null

          return (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="text-lg">{day}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">

                  {dayItemCounts.map((item: { itemName: string; count: number; users: string[] }, idx: number) => (
                    <div key={idx} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-lg">{item.itemName}</h4>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                          {item.count} {item.count === 1 ? 'order' : 'orders'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.users.map((userName: string, userIdx: number) => (
                          <span
                            key={userIdx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                          >
                            {userName}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {summaryData.totalSelections === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No selections have been made yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

export default OrdersViewPage
