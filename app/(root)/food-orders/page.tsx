import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchActiveFoodMenus } from '@/lib/actions/foodMenu.actions'
import { fetchUserFoodSelections } from '@/lib/actions/foodSelection.actions'
import { fetchUserApprovedLeavesInRange } from '@/lib/actions/leave.actions'
import FoodSelectionForm from '@/components/shared/FoodSelectionForm'
import OrderHistorySection from '@/components/shared/OrderHistorySection'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Calendar, UtensilsCrossed, History, Info } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const FoodOrdersPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const menusData = await fetchActiveFoodMenus()

  if (menusData.error) {
    return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 md:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="text-destructive font-semibold">Error: {menusData.error}</div>
        </div>
      </main>
    )
  }

  const activeMenus = menusData.menus || []

  // Fetch existing selections and leaves for all active menus
  const selectionsPromises = activeMenus.map((menu) =>
    fetchUserFoodSelections(session.user.id, menu.id!)
  )
  const leavesPromises = activeMenus.map((menu) =>
    fetchUserApprovedLeavesInRange(session.user.id, new Date(menu.weekStartDate), new Date(menu.weekEndDate))
  )
  
  const [selectionsResults, leavesResults] = await Promise.all([
    Promise.all(selectionsPromises),
    Promise.all(leavesPromises)
  ])

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header Section with Gradient Glow */}
        <div className="relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
          
          <div className="relative flex items-center gap-4 bg-card/40 backdrop-blur-sm border border-border/50 p-6 rounded-2xl shadow-sm">
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-400/20 p-4 rounded-2xl border border-emerald-500/20">
              <UtensilsCrossed className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Food Orders</h1>
              <p className="text-muted-foreground mt-1 font-medium">Select your meals for the week</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-muted/50 rounded-xl p-1">
            <TabsTrigger value="active" className="flex items-center gap-2 h-10 rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <UtensilsCrossed className="h-4 w-4" />
              Active Orders
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 h-10 rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <History className="h-4 w-4" />
              Order History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6 mt-8">
            {activeMenus.length === 0 ? (
              <Card className="border-dashed border-2 border-border/50 bg-card/30">
                <CardContent className="text-center py-20">
                  <div className="bg-muted/50 p-6 rounded-full w-fit mx-auto mb-6">
                    <Calendar className="h-20 w-20 text-muted-foreground/70" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    No Active Menus
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    There are no food menus available for selection at the moment.
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-4">
                    Check back later or contact the food committee.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Active Selection Notice */}
                <div className={cn(
                  "flex items-start gap-3 rounded-2xl p-5 border",
                  "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/30"
                )}>
                  <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className={cn(
                      "text-sm leading-relaxed",
                      "text-blue-900 dark:text-blue-100"
                    )}>
                      <strong>Note:</strong> You have {activeMenus.length} active menu{activeMenus.length !== 1 ? 's' : ''} available for selection.
                      Make sure to submit your choices before the deadline!
                    </p>
                  </div>
                </div>

                {/* Food Selection Forms */}
                <div className="space-y-6">
                  {activeMenus.map((menu, index) => {
                    const existingSelections = selectionsResults[index]?.success
                      ? selectionsResults[index].selections.map((s: { dayOfWeek: string; menuItemId: string | null; notes: string | null }) => ({
                          dayOfWeek: s.dayOfWeek,
                          menuItemId: s.menuItemId,
                          notes: s.notes
                        }))
                      : []

                    const approvedLeaves = leavesResults[index]?.success ? leavesResults[index].leaves : []

                    return (
                      <Card key={menu.id} className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <FoodSelectionForm
                            menu={menu}
                            userId={session.user.id}
                            existingSelections={existingSelections}
                            approvedLeaves={approvedLeaves}
                          />
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}

            {/* Help Section */}
            <Card className="border border-border/60 bg-card/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <CardTitle className="text-lg font-bold">Need Help?</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <p>
                    <strong className="text-foreground">How it works:</strong> Select your preferred meal for each day of the week.
                    You can update your selections anytime before the deadline.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <p>
                    <strong className="text-foreground">Special requests:</strong> Use the notes field to add any dietary requirements
                    or special preferences.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <p>
                    <strong className="text-foreground">No selection?</strong> If you don&apos;t want food for a particular day,
                    select &quot;No Selection&quot; from the dropdown.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground/70 mt-4 pt-4 border-t border-border/50">
                  For questions or issues, please contact the food committee.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-8">
            <OrderHistorySection userId={session.user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

export default FoodOrdersPage
