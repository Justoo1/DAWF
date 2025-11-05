'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PDFDownloadLink } from '@react-pdf/renderer'
import VendorOrderPDF from '@/lib/pdf/vendorOrderPDF'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Loader2 } from 'lucide-react'

interface OrderSummaryData {
  menu: {
    vendor: {
      name: string
    }
    weekStartDate: Date
    weekEndDate: Date
  }
  selectionsByDay: Record<string, Array<{
    user: { name: string; department: string | null }
    menuItem: { itemName: string } | null
  }>>
  itemCounts: Array<{
    dayOfWeek: string
    itemName: string
    count: number
    users: string[]
  }>
  totalSelections: number
  employeesWithSelections: number
  actualMealOrders: number
}

const ExportPDFPage = () => {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<OrderSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/food-orders/summary/${params.menuId}`)
        if (!response.ok) throw new Error('Failed to fetch order data')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.menuId])

  if (loading) {
    return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Loading order data...</span>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-500 mb-4">{error || 'Failed to load data'}</p>
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const fileName = `${data.menu.vendor.name.replace(/\s+/g, '_')}_Orders_${new Date(data.menu.weekStartDate).toISOString().slice(0, 10)}.pdf`

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Export Orders to PDF</h1>

        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  {data.menu.vendor.name}
                </h3>
                <p className="text-sm text-green-700">
                  Week: {new Date(data.menu.weekStartDate).toLocaleDateString()} -{' '}
                  {new Date(data.menu.weekEndDate).toLocaleDateString()}
                </p>
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-green-700 font-semibold">
                    👥 {data.employeesWithSelections} Employees Ordered
                  </p>
                  <p className="text-sm text-green-700 font-semibold">
                    🍽️ {data.actualMealOrders} Total Meals to Prepare
                  </p>
                </div>
              </div>

              <PDFDownloadLink
                document={
                  <VendorOrderPDF
                    vendorName={data.menu.vendor.name}
                    weekStartDate={data.menu.weekStartDate}
                    weekEndDate={data.menu.weekEndDate}
                    selectionsByDay={data.selectionsByDay}
                    itemCounts={data.itemCounts}
                    totalSelections={data.totalSelections}
                    employeesWithSelections={data.employeesWithSelections}
                    actualMealOrders={data.actualMealOrders}
                  />
                }
                fileName={fileName}
              >
                {({ loading }) =>
                  loading ? (
                    <Button disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing PDF...
                    </Button>
                  ) : (
                    <Button className="px-8">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  )
                }
              </PDFDownloadLink>

              <div className="pt-4">
                <Button onClick={() => router.back()} variant="outline">
                  Back to Orders
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default ExportPDFPage
