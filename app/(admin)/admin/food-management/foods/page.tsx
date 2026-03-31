import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchAllFoods } from '@/lib/actions/food.actions'
import { fetchAllFoodVendors } from '@/lib/actions/foodVendor.actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Edit, Trash2, Utensils } from 'lucide-react'
import { deleteFood } from '@/lib/actions/food.actions'
import { revalidatePath } from 'next/cache'
import { AdminPageContent } from '@/components/admin/layout/AdminPageContent'
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader'

const DeleteFoodButton = ({ foodId, foodName }: { foodId: string, foodName: string }) => {
  const handleDelete = async () => {
    'use server'
    await deleteFood(foodId)
    revalidatePath('/admin/food-management/foods')
  }

  return (
    <form action={handleDelete}>
      <Button
        type="submit"
        size="sm"
        variant="destructive"
        className="w-full"
        title={`Delete ${foodName}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  )
}

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
  const foodsByVendor = vendors.map(vendor => ({
    vendor,
    foods: foodsData.foods?.filter(food => food.vendorId === vendor.id) || []
  }))

  return (
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Food Items"
          description="Manage food items and assign them to vendors."
          action={
            <Link href="/admin/food-management/foods/new">
              <Button className="shadow-sm">Create New Food</Button>
            </Link>
          }
        />

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Foods</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{foodsData.totalFoods || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendors.length}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(foodsData.foods?.map(f => f.category).filter(Boolean)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Foods by Vendor */}
        {foodsByVendor.map(({ vendor, foods }) => (
          foods.length > 0 && (
            <Card key={vendor.id} className="border-border/50 shadow-sm ring-1 ring-border/30">
              <CardHeader>
                <CardTitle className="text-lg">{vendor.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {foods.map((food) => (
                    <div
                      key={food.id}
                      className="rounded-lg border border-border/60 bg-card p-4 space-y-2 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{food.name}</h4>
                          {food.category && (
                            <p className="text-xs text-muted-foreground">{food.category}</p>
                          )}
                        </div>
                        {food.price && (
                          <span className="text-sm font-semibold text-primary">
                            ¢{food.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {food.description && (
                        <p className="text-sm text-muted-foreground">{food.description}</p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Link href={`/admin/food-management/foods/${food.id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                        <DeleteFoodButton foodId={food.id} foodName={food.name} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        ))}

        {foodsData.totalFoods === 0 && (
          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardContent className="text-center py-12">
              <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No food items created yet</p>
              <Link href="/admin/food-management/foods/new">
                <Button className="shadow-sm">Create Your First Food</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </AdminPageContent>
    </main>
  )
}

export default FoodsPage
