import Contributions from '@/components/admin/Contributions'
import QuickActions from '@/components/admin/QuickActions'
import BulkContributionModal from '@/components/admin/BulkContributionModal'
import { fetchContributions } from '@/lib/actions/contribution'
import { fetchUsersIdAndName } from '@/lib/actions/users.action'
import { AdminStatCard, AdminStatCardsWrapper } from "@/components/admin/layout/AdminStatCards"
import { WalletCards, TrendingUp, ListChecks } from "lucide-react"

interface ContributionPageProps {
  searchParams: Promise<{
    page?: string
  }>
}

import { AdminPageContent } from '@/components/admin/layout/AdminPageContent'
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader'

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
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Contributions Management"
          description="View, manage, and add welfare fund contributions."
          action={<BulkContributionModal users={users} />}
        />
        
        <AdminStatCardsWrapper>
          <AdminStatCard
            title="Total Fund Volume"
            value={`GHS ${data.totalContributions?.toLocaleString() || '0'}`}
            icon={<WalletCards size={20} strokeWidth={2.5} />}
          />
          <AdminStatCard
            title="Monthly Growth"
            value={`${parseFloat(data.percentageChange || '0') >= 0 ? '+' : ''}${data.percentageChange || '0'}%`}
            icon={<TrendingUp size={20} strokeWidth={2.5} />}
            trend={`${parseFloat(data.percentageChange || '0') >= 0 ? '+' : ''}${data.percentageChange || '0'}%`}
            trendIsPositive={parseFloat(data.percentageChange || '0') >= 0}
            trendLabel="from last month"
          />
          <AdminStatCard
            title="Total Records"
            value={data.pagination?.totalCount || 0}
            icon={<ListChecks size={20} strokeWidth={2.5} />}
          />
        </AdminStatCardsWrapper>

        <QuickActions />
        <Contributions
          contributions={data.contributions}
          pagination={data.pagination!}
        />
      </AdminPageContent>
    </main>
  )
}

export default ContributionPage