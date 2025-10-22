'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  getFinancialSummary,
  getContributionsByEmployee,
  getExpensesByType,
  getEventSummary,
  getQuarterlyComparison
} from '@/lib/actions/report.actions'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell, Legend, CartesianGrid } from "recharts"
import { FileSpreadsheet, FileText, Loader2, TrendingUp, DollarSign } from 'lucide-react'
import QuickActions from '@/components/admin/QuickActions'
import ExcelJS from 'exceljs'

interface FinancialSummary {
  contributions: { year: number; month: number; _sum: { amount: number } }[];
  expenses: { date: Date; _sum: { amount: number } }[];
  events: { type: string; year: number; month: number; _count: { id: number } }[];
  totalContribution: number;
  totalExpenses: number;
}

interface ContributionByEmployee {
  id: string;
  name: string;
  email: string;
  department: string | null;
  totalContributions: number;
  monthsContributed: number;
  averagePerMonth: number;
  contributions: { amount: number; month: Date; year: number }[];
}

interface ExpenseData {
  summary: {
    type: string;
    totalAmount: number;
    count: number;
    averagePerExpense: number;
  }[];
  details: {
    id: number;
    type: string;
    amount: number;
    date: Date;
    recipient: string;
    description: string | null;
    approvedBy: string | null;
  }[];
}

interface EventData {
  summary: { type: string; count: number }[];
  details: {
    id: string;
    type: string;
    title: string;
    start: Date;
    end: Date;
    description: string | null;
    location: string | null;
    user: string;
  }[];
}

interface QuarterlyData {
  quarter: string;
  contributions: number;
  expenses: number;
  net: number;
  events: number;
}

type ReportType = 'financial_summary' | 'contribution_by_employee' | 'expense_by_type' | 'event_summary' | 'quarterly_comparison'

const EXPENSE_COLORS: Record<string, string> = {
  BIRTHDAY: '#10A074',
  CHILDBIRTH: '#2F7A67',
  MARRIAGE: '#E84E1B',
  FUNERAL: '#666666',
  EMPLOYEE_DEPARTURE: '#999999',
  OTHER: '#CCCCCC'
}

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>('financial_summary')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Data states
  const [financialData, setFinancialData] = useState<FinancialSummary | null>(null)
  const [contributionData, setContributionData] = useState<ContributionByEmployee[] | null>(null)
  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null)
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyData[] | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (reportType === 'quarterly_comparison') {
        setLoading(true)
        try {
          const data = await getQuarterlyComparison(selectedYear)
          setQuarterlyData(data)
        } catch (error) {
          console.error('Error fetching quarterly data:', error)
        } finally {
          setLoading(false)
        }
      } else if (startDate && endDate) {
        setLoading(true)
        try {
          switch (reportType) {
            case 'financial_summary':
              const finData = await getFinancialSummary(startDate, endDate)
              setFinancialData(finData)
              break
            case 'contribution_by_employee':
              const contData = await getContributionsByEmployee(startDate, endDate)
              setContributionData(contData)
              break
            case 'expense_by_type':
              const expData = await getExpensesByType(startDate, endDate)
              setExpenseData(expData)
              break
            case 'event_summary':
              const evtData = await getEventSummary(startDate, endDate)
              setEventData(evtData)
              break
          }
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchData()
  }, [reportType, startDate, endDate, selectedYear])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const generateExcelReport = async () => {
    if (!startDate || !endDate) return
    setExporting(true)

    try {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ]

      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'DAWF'
      workbook.created = new Date()

      if (reportType === 'financial_summary' && financialData) {
        // Create a map of all months in the date range
        const monthMap = new Map()
        const currentDate = new Date(startDate)
        while (currentDate <= endDate) {
          const key = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`
          monthMap.set(key, {
            Date: `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`,
            'Total Contributions': 0,
            'Total Expenses': 0,
            'Net Amount': 0,
            Events: 0,
          })
          currentDate.setMonth(currentDate.getMonth() + 1)
        }

        // Fill in financial data
        financialData.contributions.forEach((contribution) => {
          const key = `${contribution.year}-${contribution.month}`
          if (monthMap.has(key)) {
            const monthData = monthMap.get(key)
            monthData['Total Contributions'] += contribution._sum.amount
            monthData['Net Amount'] += contribution._sum.amount
          }
        })

        financialData.expenses.forEach((expense) => {
          const key = `${expense.date.getFullYear()}-${expense.date.getMonth() + 1}`
          if (monthMap.has(key)) {
            const monthData = monthMap.get(key)
            monthData['Total Expenses'] += expense._sum.amount
            monthData['Net Amount'] -= expense._sum.amount
          }
        })

        financialData.events.forEach((event) => {
          const key = `${event.year}-${event.month}`
          if (monthMap.has(key)) {
            const monthData = monthMap.get(key)
            monthData.Events += event._count.id
          }
        })

        const summaryData = Array.from(monthMap.values())
        const overallSummary = [
          { Summary: 'Overall Amount Contributed', Value: financialData.totalContribution },
          { Summary: 'Overall Expenses', Value: financialData.totalExpenses },
          { Summary: 'Total Contribution Remaining', Value: financialData.totalContribution - financialData.totalExpenses },
          { Summary: 'Total Events', Value: financialData.events.reduce((sum, event) => sum + event._count.id, 0) },
        ]

        const monthlySummarySheet = workbook.addWorksheet('Monthly Summary')
        monthlySummarySheet.columns = Object.keys(summaryData[0]).map((key) => ({ header: key, key, width: 20 }))
        summaryData.forEach((data) => monthlySummarySheet.addRow(data))

        const overallSummarySheet = workbook.addWorksheet('Overall Summary')
        overallSummarySheet.columns = Object.keys(overallSummary[0]).map((key) => ({ header: key, key, width: 30 }))
        overallSummary.forEach((data) => overallSummarySheet.addRow(data))
      } else if (reportType === 'contribution_by_employee' && contributionData) {
        const sheet = workbook.addWorksheet('Contributions by Employee')
        sheet.columns = [
          { header: 'Employee Name', key: 'name', width: 25 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'Department', key: 'department', width: 20 },
          { header: 'Total Contributions', key: 'total', width: 20 },
          { header: 'Months Contributed', key: 'months', width: 20 },
          { header: 'Average per Month', key: 'average', width: 20 },
        ]
        contributionData.forEach((emp) => {
          sheet.addRow({
            name: emp.name,
            email: emp.email,
            department: emp.department || 'N/A',
            total: emp.totalContributions,
            months: emp.monthsContributed,
            average: emp.averagePerMonth
          })
        })
      } else if (reportType === 'expense_by_type' && expenseData) {
        const summarySheet = workbook.addWorksheet('Expense Summary')
        summarySheet.columns = [
          { header: 'Expense Type', key: 'type', width: 20 },
          { header: 'Total Amount', key: 'total', width: 20 },
          { header: 'Count', key: 'count', width: 15 },
          { header: 'Average per Expense', key: 'average', width: 20 },
        ]
        expenseData.summary.forEach((exp) => {
          summarySheet.addRow({
            type: exp.type,
            total: exp.totalAmount,
            count: exp.count,
            average: exp.averagePerExpense
          })
        })

        const detailsSheet = workbook.addWorksheet('Expense Details')
        detailsSheet.columns = [
          { header: 'Date', key: 'date', width: 15 },
          { header: 'Type', key: 'type', width: 20 },
          { header: 'Recipient', key: 'recipient', width: 25 },
          { header: 'Amount', key: 'amount', width: 15 },
          { header: 'Description', key: 'description', width: 30 },
          { header: 'Approved By', key: 'approvedBy', width: 20 },
        ]
        expenseData.details.forEach((exp) => {
          detailsSheet.addRow({
            date: formatDate(exp.date),
            type: exp.type,
            recipient: exp.recipient,
            amount: exp.amount,
            description: exp.description || 'N/A',
            approvedBy: exp.approvedBy || 'N/A'
          })
        })
      } else if (reportType === 'event_summary' && eventData) {
        const summarySheet = workbook.addWorksheet('Event Summary')
        summarySheet.columns = [
          { header: 'Event Type', key: 'type', width: 20 },
          { header: 'Count', key: 'count', width: 15 },
        ]
        eventData.summary.forEach((evt) => {
          summarySheet.addRow({ type: evt.type, count: evt.count })
        })

        const detailsSheet = workbook.addWorksheet('Event Details')
        detailsSheet.columns = [
          { header: 'Title', key: 'title', width: 30 },
          { header: 'Type', key: 'type', width: 20 },
          { header: 'Start Date', key: 'start', width: 20 },
          { header: 'End Date', key: 'end', width: 20 },
          { header: 'User', key: 'user', width: 25 },
          { header: 'Location', key: 'location', width: 25 },
        ]
        eventData.details.forEach((evt) => {
          detailsSheet.addRow({
            title: evt.title,
            type: evt.type,
            start: formatDate(evt.start),
            end: formatDate(evt.end),
            user: evt.user,
            location: evt.location || 'N/A'
          })
        })
      } else if (reportType === 'quarterly_comparison' && quarterlyData) {
        const sheet = workbook.addWorksheet('Quarterly Comparison')
        sheet.columns = [
          { header: 'Quarter', key: 'quarter', width: 15 },
          { header: 'Contributions', key: 'contributions', width: 20 },
          { header: 'Expenses', key: 'expenses', width: 20 },
          { header: 'Net Amount', key: 'net', width: 20 },
          { header: 'Events', key: 'events', width: 15 },
        ]
        quarterlyData.forEach((q) => sheet.addRow(q))
      }

      const fileName = `DAWF_${reportType}_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.xlsx`
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating Excel:', error)
    } finally {
      setExporting(false)
    }
  }

  const renderFinancialSummary = () => {
    if (!financialData) return null

    const chartData = [
      { category: 'Contributions', amount: financialData.totalContribution, fill: '#10A074' },
      { category: 'Expenses', amount: financialData.totalExpenses, fill: '#E84E1B' }
    ]

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(financialData.totalContribution)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(financialData.totalExpenses)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(financialData.totalContribution - financialData.totalExpenses)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                contributions: { label: "Contributions", color: "#10A074" },
                expenses: { label: "Expenses", color: "#E84E1B" },
              }}
              className="h-[300px]"
            >
              <BarChart data={chartData}>
                <XAxis dataKey="category" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="var(--color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderContributionByEmployee = () => {
    if (!contributionData) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle>Contributions by Employee</CardTitle>
          <CardDescription>Detailed breakdown of contributions per employee</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Months</TableHead>
                <TableHead className="text-right">Average</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributionData.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.department || 'N/A'}</TableCell>
                  <TableCell className="text-right">{formatCurrency(emp.totalContributions)}</TableCell>
                  <TableCell className="text-right">{emp.monthsContributed}</TableCell>
                  <TableCell className="text-right">{formatCurrency(emp.averagePerMonth)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  const renderExpenseByType = () => {
    if (!expenseData) return null

    const pieData = expenseData.summary.map((exp) => ({
      name: exp.type,
      value: exp.totalAmount,
      fill: EXPENSE_COLORS[exp.type] || '#CCCCCC'
    }))

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={Object.fromEntries(
                  Object.keys(EXPENSE_COLORS).map(key => [
                    key.toLowerCase(),
                    { label: key, color: EXPENSE_COLORS[key] }
                  ])
                )}
                className="h-[300px]"
              >
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Avg</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseData.summary.map((exp) => (
                    <TableRow key={exp.type}>
                      <TableCell className="font-medium">{exp.type}</TableCell>
                      <TableCell className="text-right">{exp.count}</TableCell>
                      <TableCell className="text-right">{formatCurrency(exp.totalAmount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(exp.averagePerExpense)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseData.details.slice(0, 10).map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell>{formatDate(exp.date)}</TableCell>
                    <TableCell>{exp.type}</TableCell>
                    <TableCell>{exp.recipient}</TableCell>
                    <TableCell className="text-right">{formatCurrency(exp.amount)}</TableCell>
                    <TableCell className="text-sm text-gray-500">{exp.description || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {expenseData.details.length > 10 && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Showing 10 of {expenseData.details.length} expenses. Export for full list.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderEventSummary = () => {
    if (!eventData) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Events by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventData.summary.map((evt) => (
                    <TableRow key={evt.type}>
                      <TableCell className="font-medium">{evt.type}</TableCell>
                      <TableCell className="text-right">{evt.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventData.details.slice(0, 5).map((evt) => (
                  <div key={evt.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{evt.title}</p>
                        <p className="text-sm text-gray-500">{evt.type} • {evt.user}</p>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(evt.start)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderQuarterlyComparison = () => {
    if (!quarterlyData) return null

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quarterly Financial Comparison - {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                contributions: { label: "Contributions", color: "#10A074" },
                expenses: { label: "Expenses", color: "#E84E1B" },
                net: { label: "Net", color: "#2563eb" },
              }}
              className="h-[400px]"
            >
              <BarChart data={quarterlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="contributions" fill="#10A074" name="Contributions" />
                <Bar dataKey="expenses" fill="#E84E1B" name="Expenses" />
                <Bar dataKey="net" fill="#2563eb" name="Net" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quarterly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quarter</TableHead>
                  <TableHead className="text-right">Contributions</TableHead>
                  <TableHead className="text-right">Expenses</TableHead>
                  <TableHead className="text-right">Net Amount</TableHead>
                  <TableHead className="text-right">Events</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quarterlyData.map((q) => (
                  <TableRow key={q.quarter}>
                    <TableCell className="font-medium">{q.quarter}</TableCell>
                    <TableCell className="text-right">{formatCurrency(q.contributions)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(q.expenses)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(q.net)}</TableCell>
                    <TableCell className="text-right">{q.events}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasData = () => {
    switch (reportType) {
      case 'financial_summary': return !!financialData
      case 'contribution_by_employee': return !!contributionData
      case 'expense_by_type': return !!expenseData
      case 'event_summary': return !!eventData
      case 'quarterly_comparison': return !!quarterlyData
      default: return false
    }
  }

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Generate comprehensive reports and analyze welfare fund data</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial_summary">Financial Summary</SelectItem>
                    <SelectItem value="contribution_by_employee">Contributions by Employee</SelectItem>
                    <SelectItem value="expense_by_type">Expenses by Type</SelectItem>
                    <SelectItem value="event_summary">Event Summary</SelectItem>
                    <SelectItem value="quarterly_comparison">Quarterly Comparison</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reportType === 'quarterly_comparison' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026, 2027].map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <DatePicker selected={startDate} onSelect={setStartDate} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <DatePicker selected={endDate} onSelect={setEndDate} className="w-full" />
                  </div>
                </>
              )}

              <div className="flex items-end">
                <Button
                  onClick={generateExcelReport}
                  disabled={!hasData() || exporting}
                  className="w-full"
                  variant="default"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export to Excel
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Loading report data...</p>
              </div>
            </CardContent>
          </Card>
        ) : hasData() ? (
          <>
            {reportType === 'financial_summary' && renderFinancialSummary()}
            {reportType === 'contribution_by_employee' && renderContributionByEmployee()}
            {reportType === 'expense_by_type' && renderExpenseByType()}
            {reportType === 'event_summary' && renderEventSummary()}
            {reportType === 'quarterly_comparison' && renderQuarterlyComparison()}
          </>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {reportType === 'quarterly_comparison'
                    ? 'Select a year to view quarterly comparison'
                    : 'Select a date range to generate report'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <QuickActions />
    </main>
  )
}
