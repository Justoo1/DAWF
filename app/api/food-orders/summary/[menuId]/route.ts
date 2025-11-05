import { NextRequest, NextResponse } from 'next/server'
import { getMenuOrderSummary } from '@/lib/actions/foodSelection.actions'
import { fetchFoodMenuById } from '@/lib/actions/foodMenu.actions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const { menuId } = await params
    const [menuData, summaryData] = await Promise.all([
      fetchFoodMenuById(menuId),
      getMenuOrderSummary(menuId)
    ])

    if (menuData.error || !menuData.menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    if (summaryData.error) {
      return NextResponse.json(
        { error: 'Failed to fetch order summary' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      menu: menuData.menu,
      ...summaryData
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
