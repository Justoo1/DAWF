import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchActiveFoodMenus } from '@/lib/actions/foodMenu.actions'
import { fetchUserFoodSelections } from '@/lib/actions/foodSelection.actions'
import FoodSelectionForm from '@/components/shared/FoodSelectionForm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Calendar, UtensilsCrossed } from 'lucide-react'

const FoodOrdersPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const menusData = await fetchActiveFoodMenus()

  if (menusData.error) {
    return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-red-500">Error: {menusData.error}</div>
        </div>
      </main>
    )
  }

  const activeMenus = menusData.menus || []

  // Fetch existing selections for all active menus
  const selectionsPromises = activeMenus.map((menu) =>
    fetchUserFoodSelections(session.user.id, menu.id!)
  )
  const selectionsResults = await Promise.all(selectionsPromises)

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-lg">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Food Orders</h1>
            <p className="text-gray-600">Select your meals for the week</p>
          </div>
        </div>

        {activeMenus.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Active Menus
              </h3>
              <p className="text-gray-500">
                There are no food menus available for selection at the moment.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Check back later or contact the food committee.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Active Selection Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> You have {activeMenus.length} active menu{activeMenus.length !== 1 ? 's' : ''} available for selection.
                Make sure to submit your choices before the deadline!
              </p>
            </div>

            {/* Food Selection Forms */}
            {activeMenus.map((menu, index) => {
              const existingSelections = selectionsResults[index]?.success
                ? selectionsResults[index].selections.map((s: { dayOfWeek: string; menuItemId: string | null; notes: string | null }) => ({
                    dayOfWeek: s.dayOfWeek,
                    menuItemId: s.menuItemId,
                    notes: s.notes
                  }))
                : []

              return (
                <Card key={menu.id}>
                  <CardContent className="pt-6">
                    <FoodSelectionForm
                      menu={menu}
                      userId={session.user.id}
                      existingSelections={existingSelections}
                    />
                  </CardContent>
                </Card>
              )
            })}
          </>
        )}

        {/* Help Section */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>How it works:</strong> Select your preferred meal for each day of the week.
              You can update your selections anytime before the deadline.
            </p>
            <p>
              <strong>Special requests:</strong> Use the notes field to add any dietary requirements
              or special preferences.
            </p>
            <p>
              <strong>No selection?</strong> If you don&apos;t want food for a particular day,
              select &quot;No Selection&quot; from the dropdown.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              For questions or issues, please contact the food committee.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default FoodOrdersPage
