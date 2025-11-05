import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchAllFoodMenus } from '@/lib/actions/foodMenu.actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Clock, Users, Edit } from 'lucide-react'
import { publishFoodMenu, closeFoodMenuSelection, markFoodMenuAsSent } from '@/lib/actions/foodMenu.actions'
import { revalidatePath } from 'next/cache'
import MenuDeleteActions from '@/components/admin/MenuDeleteActions'

const MenuActionButton = ({ menuId, status }: { menuId: string, status: string }) => {
  const handlePublish = async () => {
    'use server'
    await publishFoodMenu(menuId)
    revalidatePath('/admin/food-management/menus')
  }

  const handleClose = async () => {
    'use server'
    await closeFoodMenuSelection(menuId)
    revalidatePath('/admin/food-management/menus')
  }

  const handleMarkSent = async () => {
    'use server'
    await markFoodMenuAsSent(menuId)
    revalidatePath('/admin/food-management/menus')
  }

  if (status === 'DRAFT') {
    return (
      <form action={handlePublish}>
        <Button type="submit" size="sm" variant="default">
          Publish
        </Button>
      </form>
    )
  }

  if (status === 'PUBLISHED') {
    return (
      <div className="flex gap-2">
        <Link href={`/admin/food-management/orders/${menuId}`}>
          <Button size="sm" variant="outline">
            View Orders
          </Button>
        </Link>
        <form action={handleClose}>
          <Button type="submit" size="sm" variant="secondary">
            Close Selection
          </Button>
        </form>
      </div>
    )
  }

  if (status === 'CLOSED') {
    return (
      <div className="flex gap-2">
        <Link href={`/admin/food-management/orders/${menuId}`}>
          <Button size="sm" variant="default">
            Export PDF
          </Button>
        </Link>
        <form action={handleMarkSent}>
          <Button type="submit" size="sm" variant="secondary">
            Mark as Sent
          </Button>
        </form>
      </div>
    )
  }

  return (
    <Link href={`/admin/food-management/orders/${menuId}`}>
      <Button size="sm" variant="outline">
        View Orders
      </Button>
    </Link>
  )
}

const FoodMenusPage = async () => {
  const menusData = await fetchAllFoodMenus()

  if (menusData.error) {
    return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-red-500">Error: {menusData.error}</div>
        </div>
      </main>
    )
  }

  const draftMenus = menusData.menus?.filter((m) => m.status === 'DRAFT') || []
  const publishedMenus = menusData.menus?.filter((m) => m.status === 'PUBLISHED') || []
  const closedMenus = menusData.menus?.filter((m) => m.status === 'CLOSED') || []
  const sentMenus = menusData.menus?.filter((m) => m.status === 'SENT') || []

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Weekly Menu Management</h1>
          <Link href="/admin/food-management/menus/new">
            <Button>Create New Menu</Button>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Menus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{menusData.totalMenus || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedMenus.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{closedMenus.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftMenus.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Published Menus */}
        {publishedMenus.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Active Menus (Published)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publishedMenus.map((menu) => (
                  <div
                    key={menu.id}
                    className="flex justify-between items-start p-4 border rounded-lg bg-green-50 border-green-200"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{menu.vendor.name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Week: {new Date(menu.weekStartDate).toLocaleDateString()} - {new Date(menu.weekEndDate).toLocaleDateString()}
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Deadline: {new Date(menu.selectionCloseDate).toLocaleString()}
                        </p>
                        <p className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {menu._count?.selections || 0} selections made
                        </p>
                        <p className="text-xs text-gray-500">
                          {menu.menuItems.length} menu items across the week
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <MenuActionButton menuId={menu.id!} status={menu.status} />
                      <MenuDeleteActions
                        menuId={menu.id!}
                        menuTitle={`${menu.vendor.name} - ${new Date(menu.weekStartDate).toLocaleDateString()}`}
                        status={menu.status}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Closed Menus */}
        {closedMenus.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-700">Closed Menus (Ready to Export)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {closedMenus.map((menu) => (
                  <div
                    key={menu.id}
                    className="flex justify-between items-start p-4 border rounded-lg bg-orange-50 border-orange-200"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{menu.vendor.name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Week: {new Date(menu.weekStartDate).toLocaleDateString()} - {new Date(menu.weekEndDate).toLocaleDateString()}
                        </p>
                        <p className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {menu._count?.selections || 0} total selections
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <MenuActionButton menuId={menu.id!} status={menu.status} />
                      <MenuDeleteActions
                        menuId={menu.id!}
                        menuTitle={`${menu.vendor.name} - ${new Date(menu.weekStartDate).toLocaleDateString()}`}
                        status={menu.status}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Draft Menus */}
        {draftMenus.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-700">Draft Menus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {draftMenus.map((menu) => (
                  <div
                    key={menu.id}
                    className="flex justify-between items-start p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{menu.vendor.name}</h4>
                      <p className="text-sm text-gray-600">
                        Week: {new Date(menu.weekStartDate).toLocaleDateString()} - {new Date(menu.weekEndDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {menu.menuItems.length} menu items
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/food-management/menus/${menu.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <MenuDeleteActions
                        menuId={menu.id!}
                        menuTitle={`${menu.vendor.name} - ${new Date(menu.weekStartDate).toLocaleDateString()}`}
                        status={menu.status}
                      />
                      <MenuActionButton menuId={menu.id!} status={menu.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sent Menus (Archive) */}
        {sentMenus.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-500">Completed Menus (Sent to Vendor)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sentMenus.slice(0, 5).map((menu) => (
                  <div
                    key={menu.id}
                    className="flex justify-between items-center p-2 border rounded bg-white text-sm"
                  >
                    <div>
                      <span className="font-medium">{menu.vendor.name}</span>
                      <span className="text-gray-500 ml-2">
                        {new Date(menu.weekStartDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <MenuActionButton menuId={menu.id!} status={menu.status} />
                      <MenuDeleteActions
                        menuId={menu.id!}
                        menuTitle={`${menu.vendor.name} - ${new Date(menu.weekStartDate).toLocaleDateString()}`}
                        status={menu.status}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {menusData.totalMenus === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No menus created yet</p>
              <Link href="/admin/food-management/menus/new">
                <Button>Create Your First Menu</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

export default FoodMenusPage
