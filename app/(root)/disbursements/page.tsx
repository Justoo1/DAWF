import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchExpenses } from '@/lib/actions/expenses'
import { auth } from "@/lib/auth"
import { formatDateTime } from '@/lib/utils'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const DisbursementsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/sign-in")
  }

  const expensesData = await fetchExpenses()

  if (!expensesData.success) {
    return (
      <div className='min-h-screen flex flex-col w-full'>
        <main className="mx-auto w-full max-w-7xl p-4 space-y-6 flex flex-col">
          <span className='text-red-500'>Failed to load disbursements</span>
        </main>
      </div>
    )
  }

  const expenses = expensesData.expenses || []

  return (
    <div className='flex flex-col w-full 2xl:items-center 2xl:justify-center'>
      <main className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8 space-y-6 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Disbursements</h1>
            <p className="text-gray-300 mt-1">View all welfare benefits and expenses</p>
          </div>
          <Card className="bg-emerald-600 text-white border-none">
            <CardContent className="p-4">
              <div className="text-sm">Total Disbursed</div>
              <div className="text-2xl font-bold">₵{expensesData.totalExpenses?.toFixed(2) || '0.00'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['BIRTHDAY', 'CHILDBIRTH', 'MARRIAGE', 'FUNERAL'].map((type) => {
            const typeExpenses = expenses.filter(exp => exp.type === type)
            const total = typeExpenses.reduce((sum, exp) => sum + exp.amount, 0)
            return (
              <Card key={type} className="bg-white/10 border-white/20 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium capitalize">{type.toLowerCase()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₵{total.toFixed(2)}</div>
                  <div className="text-xs text-gray-300 mt-1">{typeExpenses.length} disbursement(s)</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Expenses Table */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">All Disbursements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="py-3 px-4 text-white font-semibold">Date</th>
                    <th className="py-3 px-4 text-white font-semibold">Type</th>
                    <th className="py-3 px-4 text-white font-semibold">Recipient</th>
                    <th className="py-3 px-4 text-white font-semibold">Description</th>
                    <th className="py-3 px-4 text-white font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-300">
                        No disbursements recorded yet
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-3 px-4 text-gray-300">
                          {formatDateTime(expense.date).dateOnly}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            expense.type === 'BIRTHDAY' ? 'bg-blue-500/20 text-blue-300' :
                            expense.type === 'CHILDBIRTH' ? 'bg-pink-500/20 text-pink-300' :
                            expense.type === 'MARRIAGE' ? 'bg-purple-500/20 text-purple-300' :
                            expense.type === 'FUNERAL' ? 'bg-gray-500/20 text-gray-300' :
                            'bg-orange-500/20 text-orange-300'
                          }`}>
                            {expense.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white">{expense.recipient}</td>
                        <td className="py-3 px-4 text-gray-300">
                          {expense.description || '-'}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-semibold">
                          ₵{expense.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 border-none">
          <CardContent className="p-6">
            <h3 className="text-white font-bold text-lg mb-2">About Disbursements</h3>
            <p className="text-white/90 text-sm">
              Disbursements represent the welfare benefits paid out to employees for various occasions such as
              birthdays, childbirths, marriages, and other significant life events. These funds come from the
              collective contributions made by all team members to support one another.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default DisbursementsPage
