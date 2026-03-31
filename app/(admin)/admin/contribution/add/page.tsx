import ContributionForm from '@/components/admin/ContributionForm'
import QuickActions from '@/components/admin/QuickActions'
import { fetchUsersIdAndName } from '@/lib/actions/users.action'
import React from 'react'

const ContributionAddPage = async () => {
    const employees = await fetchUsersIdAndName()

    if (!employees.success) {
        return <div>Error: {employees.error}</div>
    }
    else if (!employees.users) {
        return <div>No users found</div>
    }

  return (
    <main className="admin-main">
        <div className="mx-auto max-w-7xl lg:p-8 bg-white rounded-md shadow-sm">
            <ContributionForm employees={employees.users} />
        </div>
        <QuickActions />
    </main>
  )
}

export default ContributionAddPage