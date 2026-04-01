'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import QuickActions from "./QuickActions"

interface Contribution { month: string; amount: number; year: number }
interface IncomeVsExpense { month: string; income: number; expenses: number; year: number }

interface AnalyticsProp {
  incomeVsExpenses: IncomeVsExpense[]
  monthlyContributions: Contribution[]
}

const Analytics = ({ incomeVsExpenses, monthlyContributions }: AnalyticsProp) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [filteredContributions, setFilteredContributions] = useState<Contribution[]>([])
  const [filteredIncomeVsExpenses, setFilteredIncomeVsExpenses] = useState<IncomeVsExpense[]>([])

  const years = Array.from(new Set([
    ...monthlyContributions.map(c => c.year),
    ...incomeVsExpenses.map(ie => ie.year)
  ])).sort((a, b) => b - a)

  useEffect(() => {
    setFilteredContributions(monthlyContributions.filter(c => c.year === selectedYear))
    setFilteredIncomeVsExpenses(incomeVsExpenses.filter(ie => ie.year === selectedYear))
  }, [selectedYear, monthlyContributions, incomeVsExpenses])

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto p-0 md:p-2">
      <div className="mb-4">
        <Select onValueChange={(value) => setSelectedYear(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 grid-cols-1">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Monthly Contributions {selectedYear}</CardTitle>
            <CardDescription>Total contributions per month in cedis</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: {
                  label: "Amount",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredContributions}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--color-amount)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Income vs Expenses {selectedYear}</CardTitle>
            <CardDescription>Monthly comparison of income and expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                income: {
                  label: "Income",
                  color: "hsl(var(--chart-2))",
                },
                expenses: {
                  label: "Expenses",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredIncomeVsExpenses}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="income" stroke="var(--color-income)" />
                  <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <QuickActions />
    </main>
  )
}

export default Analytics

