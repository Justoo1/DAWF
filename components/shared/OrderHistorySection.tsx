"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, UtensilsCrossed } from "lucide-react"
import OrderHistoryFilters from "./OrderHistoryFilters"
import { useState, useEffect, useCallback } from "react"
import { fetchUserOrderHistory } from "@/lib/actions/foodSelection.actions"

interface OrderHistorySectionProps {
  userId: string
}

interface OrderHistoryData {
  success?: boolean
  selectionsByMenu?: Array<{
    menu: {
      id: string
      vendor: { name: string }
      weekStartDate: Date
      weekEndDate: Date
      status: string
    }
    selections: Array<{
      id: string
      dayOfWeek: string
      notes: string | null
      menuItem: {
        itemName: string
        description: string | null
        price: number | null
        food?: {
          isSpecialOrder: boolean
        } | null
      } | null
    }>
  }>
  totalOrders?: number
  error?: string
}

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const

const OrderHistorySection = ({ userId }: OrderHistorySectionProps) => {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [orderHistory, setOrderHistory] = useState<OrderHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const loadOrderHistory = useCallback(async () => {
    setLoading(true)
    setError(undefined)

    const result = await fetchUserOrderHistory({
      userId,
      startDate,
      endDate
    })

    if (result.error) {
      setError(result.error)
    } else {
      setOrderHistory(result)
    }
    setLoading(false)
  }, [userId, startDate, endDate])

  useEffect(() => {
    loadOrderHistory()
  }, [loadOrderHistory])

  const handleFilterChange = (start?: Date, end?: Date) => {
    setStartDate(start)
    setEndDate(end)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">Loading order history...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  const selectionsByMenu = orderHistory?.selectionsByMenu || []
  const totalOrders = orderHistory?.totalOrders || 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <OrderHistoryFilters onFilterChange={handleFilterChange} />

          {totalOrders === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UtensilsCrossed className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No order history found for the selected period</p>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Found <strong>{totalOrders}</strong> menu{totalOrders !== 1 ? 's' : ''} with your selections
            </div>
          )}
        </CardContent>
      </Card>

      {selectionsByMenu.map((menuData) => {
        const { menu, selections } = menuData
        const weekStart = new Date(menu.weekStartDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
        const weekEnd = new Date(menu.weekEndDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })

        // Group selections by day
        type SelectionsByDay = Record<string, typeof selections>
        const selectionsByDay = selections.reduce((acc: SelectionsByDay, selection) => {
          if (!acc[selection.dayOfWeek]) {
            acc[selection.dayOfWeek] = []
          }
          acc[selection.dayOfWeek].push(selection)
          return acc
        }, {} as SelectionsByDay)

        return (
          <Card key={menu.id} className="border-l-4 border-l-green-500">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{menu.vendor.name}</CardTitle>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {weekStart} - {weekEnd}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {menu.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day) => {
                  const daySelections = selectionsByDay[day] || []

                  if (daySelections.length === 0) return null

                  return (
                    <div key={day} className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-semibold text-gray-700 mb-2">{day}</h4>
                      {daySelections.map((selection) => {
                        if (!selection.menuItem) {
                          return (
                            <div key={selection.id} className="bg-white rounded p-3 space-y-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-500 italic">
                                    No Selection
                                  </p>
                                </div>
                              </div>
                              {selection.notes && (
                                <div className="mt-2 text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-2">
                                  <span className="font-medium">Note:</span> {selection.notes}
                                </div>
                              )}
                            </div>
                          )
                        }

                        return (
                          <div key={selection.id} className="bg-white rounded p-3 space-y-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {selection.menuItem.itemName}
                                </p>
                                {selection.menuItem.description && (
                                  <p className="text-sm text-gray-600">
                                    {selection.menuItem.description}
                                  </p>
                                )}
                                {selection.menuItem.food?.isSpecialOrder && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    Special Order
                                  </Badge>
                                )}
                              </div>
                              {selection.menuItem.price && (
                                <span className="text-sm font-medium text-green-600">
                                  ₵{selection.menuItem.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                            {selection.notes && (
                              <div className="mt-2 text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-2">
                                <span className="font-medium">Note:</span> {selection.notes}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default OrderHistorySection
