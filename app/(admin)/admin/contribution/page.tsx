import Contributions from '@/components/admin/Contributions'
import QuickActions from '@/components/admin/QuickActions'
import BulkContributionModal from '@/components/admin/BulkContributionModal'
import { fetchContributions } from '@/lib/actions/contribution'
import { fetchUsersIdAndName } from '@/lib/actions/users.action'

interface ContributionPageProps {
  searchParams: Promise<{
    page?: string
  }>
}

const ContributionPage = async ({ searchParams }: ContributionPageProps) => {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const pageSize = 10

    const [data, usersData] = await Promise.all([
      fetchContributions(currentPage, pageSize),
      fetchUsersIdAndName()
    ])

    if (!data.success) {
        return <div>Error: {data.error}</div>
    }
    else if (!data.contributions) {
        return <div>No users found</div>
    }

    const users = usersData.success ? usersData.users || [] : []

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Contributions Management</h2>
        <BulkContributionModal users={users} />
      </div>
      <QuickActions />
      <Contributions
        contributions={data.contributions}
        pagination={data.pagination!}
      />
    </main>
  )
}

export default ContributionPage