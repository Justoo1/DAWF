"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from '@/lib/utils'

export interface UserAnalysisProps {
  userData: {
    contributionsCount: number
    eventsCount: number
    name: string,
    role: string,
    expensesCount: number
    totalAmountContributed: number
    totalContributionMonths: number
    contributions: Array<{
      id: string
      userId: string
      month: Date
      year: number
      quarter: number
      amount: number
      status: string
      createdAt: Date
    }>
  },
  className?: string
  showRecentContributions?: boolean
}

const UserAnalysis = ({ userData, className, showRecentContributions }: UserAnalysisProps) => {
  const years = useMemo(() => {
    const yearsSet = new Set(userData.contributions.map(c => new Date(c.month).getFullYear()))
    return Array.from(yearsSet).sort((a, b) => b - a) // Sort years in descending order
  }, [userData.contributions])

  const [selectedYear, setSelectedYear] = useState<number | 'all'>(
    years.length > 0 ? years[0] : 'all'
  )

  const filteredContributions = useMemo(() => {
    return selectedYear === 'all'
      ? userData.contributions
      : userData.contributions.filter(c => new Date(c.month).getFullYear() === selectedYear)
  }, [userData.contributions, selectedYear])

  const contributionsByMonth = useMemo(() => {
    return filteredContributions.reduce((acc, contribution) => {
      const date = new Date(contribution.month)
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}` // Format: MM/YYYY
      if (!acc[monthYear]) {
        acc[monthYear] = 0
      }
      acc[monthYear] += contribution.amount
      return acc
    }, {} as Record<string, number>)
  }, [filteredContributions])

  const chartData = useMemo(() => {
    return Object.entries(contributionsByMonth)
      .map(([monthYear, amount]) => {
        const [month, year] = monthYear.split('/')
        return {
          monthYear,
          amount,
          date: new Date(Number(year), Number(month) - 1) // Used for sorting
        }
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [contributionsByMonth])

  const totalFilteredAmount = useMemo(() => {
    return filteredContributions.reduce((sum, contribution) => sum + contribution.amount, 0)
  }, [filteredContributions])

  return (
    <Card className={cn("col-span-2", className)}>
      <CardHeader className={cn('hidden', showRecentContributions ? 'flex' : '')}>
        <CardTitle>Your Contribution Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-3">
          {years && (
            <div>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(value === 'all' ? 'all' : parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Total Contributions</p>
              <p className="text-2xl font-bold">{filteredContributions.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Amount Contributed</p>
              <p className="text-2xl font-bold">{totalFilteredAmount.toFixed(2)} cedis</p>
            </div>
            <div>
              <p className="text-sm font-medium">Contribution Months</p>
              <p className="text-2xl font-bold">{Object.keys(contributionsByMonth).length}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Events Organized</p>
              <p className="text-2xl font-bold">{userData.eventsCount}</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.map(({ monthYear, amount }) => ({ monthYear, amount }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthYear" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#10b981" name="Contribution Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={cn('overflow-y-auto', showRecentContributions ? '' : 'hidden')}>
            <h3 className="text-lg font-semibold mb-2">Recent Contributions</h3>
            <ul className="space-y-2">
              {filteredContributions.slice(0, 5).map((contribution) => (
                <li key={contribution.id} className="flex justify-between items-center">
                  <span>{new Date(contribution.month).toLocaleDateString()}</span>
                  <span className="font-medium">{contribution.amount.toFixed(2)} cedis</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserAnalysis;