import AddExpensesPage from '@/components/admin/AddExpenses'
import QuickActions from '@/components/admin/QuickActions'
import { fetchUsersIdAndName } from '@/lib/actions/users.action'
import React from 'react'

const ExpensesAddPage = async () => {
  const employees = await fetchUsersIdAndName()

  if (!employees.success) {
    return <div>Error: {employees.error}</div>
  }
  else if (!employees.users) {
    return <div>No users found</div>
  }
  return (
    <main className="admin-main">
      <div className="mx-auto max-w-7xl lg:p-8 bg-white dark:bg-zinc-950 rounded-md shadow-sm border border-slate-200 dark:border-zinc-800">
      <AddExpensesPage employees={employees.users} />
      </div>
      <QuickActions />
    </main>
  )
}

export default ExpensesAddPage