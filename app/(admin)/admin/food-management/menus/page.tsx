import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchAllFoodMenus } from '@/lib/actions/foodMenu.actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Edit } from 'lucide-react'
import { publishFoodMenu, closeFoodMenuSelection, markFoodMenuAsSent } from '@/lib/actions/foodMenu.actions'
import { revalidatePath } from 'next/cache'
import MenuDeleteActions from '@/components/admin/MenuDeleteActions'
import { Badge } from '@/components/ui/badge'
import { AdminPageContent } from '@/components/admin/layout/AdminPageContent'
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader'
import { AdminTableCard } from '@/components/admin/layout/AdminTableCard'
import {
  adminTableClassName,
  adminTbodyRowClass,
  adminTdClass,
  adminThClass,
  adminTheadRowClass,
} from '@/lib/admin-ui'
import { cn } from '@/lib/utils'

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
      <main className="admin-main">
        <AdminPageContent>
          <div className="rounded-xl border border-border/50 bg-card p-6 text-sm text-destructive shadow-sm ring-1 ring-border/30">
            Error: {menusData.error}
          </div>
        </AdminPageContent>
      </main>
    )
  }

  const draftMenus = menusData.menus?.filter((m) => m.status === 'DRAFT') || []
  const publishedMenus = menusData.menus?.filter((m) => m.status === 'PUBLISHED') || []
  const closedMenus = menusData.menus?.filter((m) => m.status === 'CLOSED') || []
  const sentMenus = menusData.menus?.filter((m) => m.status === 'SENT') || []

  return (
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Weekly Menus"
          description="Create menus, collect selections, and export vendor orders."
          action={
            <Link href="/admin/food-management/menus/new">
              <Button className="shadow-sm">Create New Menu</Button>
            </Link>
          }
        />

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Total Menus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">{menusData.totalMenus || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">{publishedMenus.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Closed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">{closedMenus.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">{draftMenus.length}</div>
            </CardContent>
          </Card>
        </div>

        {menusData.totalMenus === 0 ? (
          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">No menus created yet.</p>
              <Link href="/admin/food-management/menus/new">
                <Button className="shadow-sm">Create Your First Menu</Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}

        {publishedMenus.length > 0 ? (
          <AdminTableCard title="Published Menus">
            <table className={adminTableClassName()}>
              <thead>
                <tr className={adminTheadRowClass}>
                  <th className={adminThClass}>Vendor</th>
                  <th className={cn(adminThClass, "hidden md:table-cell")}>Week</th>
                  <th className={cn(adminThClass, "hidden lg:table-cell")}>Deadline</th>
                  <th className={cn(adminThClass, "w-28 text-center")}>Selections</th>
                  <th className={cn(adminThClass, "hidden lg:table-cell w-24 text-center")}>Items</th>
                  <th className={cn(adminThClass, "w-28")}>Status</th>
                  <th className={cn(adminThClass, "w-40 text-right")}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {publishedMenus.map((menu) => (
                  <tr key={menu.id} className={adminTbodyRowClass}>
                    <td className={adminTdClass}>
                      <p className="font-semibold text-foreground">{menu.vendor.name}</p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {new Date(menu.weekStartDate).toLocaleDateString()} – {new Date(menu.weekEndDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className={cn(adminTdClass, "hidden md:table-cell")}>
                      <span className="text-sm text-muted-foreground">
                        {new Date(menu.weekStartDate).toLocaleDateString()} – {new Date(menu.weekEndDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className={cn(adminTdClass, "hidden lg:table-cell")}>
                      <span className="text-sm text-muted-foreground">
                        {new Date(menu.selectionCloseDate).toLocaleString()}
                      </span>
                    </td>
                    <td className={cn(adminTdClass, "text-center")}>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {menu._count?.selections || 0}
                      </span>
                    </td>
                    <td className={cn(adminTdClass, "hidden lg:table-cell text-center")}>
                      <span className="text-sm text-muted-foreground">{menu.menuItems.length}</span>
                    </td>
                    <td className={adminTdClass}>
                      <Badge className="bg-primary/15 text-primary hover:bg-primary/15" variant="secondary">
                        PUBLISHED
                      </Badge>
                    </td>
                    <td className={cn(adminTdClass, "text-right")}>
                      <div className="flex items-center justify-end gap-2">
                        <MenuActionButton menuId={menu.id!} status={menu.status} />
                        <MenuDeleteActions
                          menuId={menu.id!}
                          menuTitle={`${menu.vendor.name} - ${new Date(menu.weekStartDate).toLocaleDateString()}`}
                          status={menu.status}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableCard>
        ) : null}

        {closedMenus.length > 0 ? (
          <AdminTableCard title="Closed Menus">
            <table className={adminTableClassName()}>
              <thead>
                <tr className={adminTheadRowClass}>
                  <th className={adminThClass}>Vendor</th>
                  <th className={cn(adminThClass, "hidden md:table-cell")}>Week</th>
                  <th className={cn(adminThClass, "w-28 text-center")}>Selections</th>
                  <th className={cn(adminThClass, "w-28")}>Status</th>
                  <th className={cn(adminThClass, "w-40 text-right")}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {closedMenus.map((menu) => (
                  <tr key={menu.id} className={adminTbodyRowClass}>
                    <td className={adminTdClass}>
                      <p className="font-semibold text-foreground">{menu.vendor.name}</p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {new Date(menu.weekStartDate).toLocaleDateString()} – {new Date(menu.weekEndDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className={cn(adminTdClass, "hidden md:table-cell")}>
                      <span className="text-sm text-muted-foreground">
                        {new Date(menu.weekStartDate).toLocaleDateString()} – {new Date(menu.weekEndDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className={cn(adminTdClass, "text-center")}>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/15 text-amber-700 text-xs font-bold">
                        {menu._count?.selections || 0}
                      </span>
                    </td>
                    <td className={adminTdClass}>
                      <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/15" variant="secondary">
                        CLOSED
                      </Badge>
                    </td>
                    <td className={cn(adminTdClass, "text-right")}>
                      <div className="flex items-center justify-end gap-2">
                        <MenuActionButton menuId={menu.id!} status={menu.status} />
                        <MenuDeleteActions
                          menuId={menu.id!}
                          menuTitle={`${menu.vendor.name} - ${new Date(menu.weekStartDate).toLocaleDateString()}`}
                          status={menu.status}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableCard>
        ) : null}

        {draftMenus.length > 0 ? (
          <AdminTableCard title="Draft Menus">
            <table className={adminTableClassName()}>
              <thead>
                <tr className={adminTheadRowClass}>
                  <th className={adminThClass}>Vendor</th>
                  <th className={cn(adminThClass, "hidden md:table-cell")}>Week</th>
                  <th className={cn(adminThClass, "hidden lg:table-cell w-24 text-center")}>Items</th>
                  <th className={cn(adminThClass, "w-28")}>Status</th>
                  <th className={cn(adminThClass, "w-56 text-right")}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {draftMenus.map((menu) => (
                  <tr key={menu.id} className={adminTbodyRowClass}>
                    <td className={adminTdClass}>
                      <p className="font-semibold text-foreground">{menu.vendor.name}</p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {new Date(menu.weekStartDate).toLocaleDateString()} – {new Date(menu.weekEndDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className={cn(adminTdClass, "hidden md:table-cell")}>
                      <span className="text-sm text-muted-foreground">
                        {new Date(menu.weekStartDate).toLocaleDateString()} – {new Date(menu.weekEndDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className={cn(adminTdClass, "hidden lg:table-cell text-center")}>
                      <span className="text-sm text-muted-foreground">{menu.menuItems.length}</span>
                    </td>
                    <td className={adminTdClass}>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted">
                        DRAFT
                      </Badge>
                    </td>
                    <td className={cn(adminTdClass, "text-right")}>
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/food-management/menus/${menu.id}/edit`}>
                          <Button variant="outline" size="sm" className="shadow-sm">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                        <MenuActionButton menuId={menu.id!} status={menu.status} />
                        <MenuDeleteActions
                          menuId={menu.id!}
                          menuTitle={`${menu.vendor.name} - ${new Date(menu.weekStartDate).toLocaleDateString()}`}
                          status={menu.status}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableCard>
        ) : null}

        {sentMenus.length > 0 ? (
          <AdminTableCard title="Sent Menus">
            <table className={adminTableClassName()}>
              <thead>
                <tr className={adminTheadRowClass}>
                  <th className={adminThClass}>Vendor</th>
                  <th className={cn(adminThClass, "hidden md:table-cell")}>Week</th>
                  <th className={cn(adminThClass, "w-28")}>Status</th>
                  <th className={cn(adminThClass, "w-40 text-right")}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sentMenus.slice(0, 10).map((menu) => (
                  <tr key={menu.id} className={adminTbodyRowClass}>
                    <td className={adminTdClass}>
                      <p className="font-semibold text-foreground">{menu.vendor.name}</p>
                    </td>
                    <td className={cn(adminTdClass, "hidden md:table-cell")}>
                      <span className="text-sm text-muted-foreground">
                        {new Date(menu.weekStartDate).toLocaleDateString()} – {new Date(menu.weekEndDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className={adminTdClass}>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted">
                        SENT
                      </Badge>
                    </td>
                    <td className={cn(adminTdClass, "text-right")}>
                      <div className="flex items-center justify-end gap-2">
                        <MenuActionButton menuId={menu.id!} status={menu.status} />
                        <MenuDeleteActions
                          menuId={menu.id!}
                          menuTitle={`${menu.vendor.name} - ${new Date(menu.weekStartDate).toLocaleDateString()}`}
                          status={menu.status}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableCard>
        ) : null}
      </AdminPageContent>
    </main>
  )
}

export default FoodMenusPage
