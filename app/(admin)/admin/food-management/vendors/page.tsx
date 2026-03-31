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
      <main className="admin-main">
        <AdminPageContent>
          <div className="rounded-xl border border-border/50 bg-card p-6 text-sm text-destructive shadow-sm ring-1 ring-border/30">
            Error: {vendorsData.error}
          </div>
        </AdminPageContent>
      </main>
    )
  }

  const activeVendors = vendorsData.vendors?.filter((v) => v.isActive) || []
  const inactiveVendors = vendorsData.vendors?.filter((v) => !v.isActive) || []

  return (
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Food Vendors"
          description="Manage vendor profiles and availability."
          action={
            <Link href="/admin/food-management/vendors/new">
              <Button className="shadow-sm">Add New Vendor</Button>
            </Link>
          }
        />

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Total Vendors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {vendorsData.totalVendors || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Active Vendors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {activeVendors.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Inactive Vendors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {inactiveVendors.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <AdminTableCard title="Vendors">
          {vendorsData.vendors && vendorsData.vendors.length > 0 ? (
            <table className={adminTableClassName()}>
              <thead>
                <tr className={adminTheadRowClass}>
                  <th className={adminThClass}>Vendor</th>
                  <th className={cn(adminThClass, "hidden lg:table-cell")}>Contact</th>
                  <th className={cn(adminThClass, "hidden xl:table-cell")}>Phone</th>
                  <th className={cn(adminThClass, "hidden xl:table-cell")}>Email</th>
                  <th className={cn(adminThClass, "w-28")}>Status</th>
                  <th className={cn(adminThClass, "w-28 text-right")}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendorsData.vendors.map((vendor) => (
                  <tr key={vendor.id} className={adminTbodyRowClass}>
                    <td className={adminTdClass}>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">{vendor.name}</p>
                          {vendor.description ? (
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {vendor.description}
                            </p>
                          ) : null}
                          <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground lg:hidden">
                            {vendor.contactName ? (
                              <span className="inline-flex items-center gap-2">
                                <User className="h-3.5 w-3.5" />
                                {vendor.contactName}
                              </span>
                            ) : null}
                            {vendor.phone ? (
                              <span className="inline-flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5" />
                                {vendor.phone}
                              </span>
                            ) : null}
                            {vendor.email ? (
                              <span className="inline-flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5" />
                                {vendor.email}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={cn(adminTdClass, "hidden lg:table-cell")}>
                      <span className="text-sm text-muted-foreground">
                        {vendor.contactName || "—"}
                      </span>
                    </td>
                    <td className={cn(adminTdClass, "hidden xl:table-cell")}>
                      <span className="text-sm text-muted-foreground">{vendor.phone || "—"}</span>
                    </td>
                    <td className={cn(adminTdClass, "hidden xl:table-cell")}>
                      <span className="text-sm text-muted-foreground">{vendor.email || "—"}</span>
                    </td>
                    <td className={adminTdClass}>
                      <Badge
                        variant={vendor.isActive ? "default" : "secondary"}
                        className={cn(
                          "font-normal",
                          vendor.isActive && "bg-primary/15 text-primary hover:bg-primary/15"
                        )}
                      >
                        {vendor.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className={cn(adminTdClass, "text-right")}>
                      <Link href={`/admin/food-management/vendors/${vendor.id}/edit`}>
                        <Button variant="outline" size="sm" className="shadow-sm">
                          {vendor.isActive ? "Edit" : "Reactivate"}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">
              No vendors found.{" "}
              <Link href="/admin/food-management/vendors/new" className="text-primary underline">
                Add your first vendor
              </Link>
              .
            </div>
          )}
        </AdminTableCard>
      </AdminPageContent>
    </main>
  )
}

export default FoodVendorsPage
