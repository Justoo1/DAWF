import Expenses from '@/components/admin/Expenses'
import { fetchExpenses } from '@/lib/actions/expenses'
import { AdminPageContent } from '@/components/admin/layout/AdminPageContent'
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader'
import { AdminStatCard, AdminStatCardsWrapper } from "@/components/admin/layout/AdminStatCards"
import { Receipt, TrendingDown, FileText } from "lucide-react"

const ExpensesPage = async () => {
    const data = await fetchExpenses()

    if (!data.success) {
        return <div>Error: {data.error}</div>
    }
    else if (!data.expenses) {
        return <div>No expenses found</div>
    }

    const { totalExpenses = 0, percentageChange = "0.0", expenses } = data
    // For expenses, an INCREASE is mathematically "positive" value but practically "negative" for business.
    // However, we just show the raw trend.
    const isCostIncrease = parseFloat(percentageChange) >= 0;

  return (
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Expenses"
          description="Track welfare fund spending and disbursements."
        />

        <AdminStatCardsWrapper>
          <AdminStatCard
            title="Total Spend Volume"
            value={`GHS ${totalExpenses.toLocaleString()}`}
            icon={<Receipt size={20} strokeWidth={2.5} />}
          />
          <AdminStatCard
            title="Monthly Spend Growth"
            value={`${isCostIncrease ? '+' : ''}${percentageChange}%`}
            icon={<TrendingDown size={20} strokeWidth={2.5} />}
            trend={`${isCostIncrease ? '+' : ''}${percentageChange}%`}
            trendIsPositive={!isCostIncrease} // green if spending dropped
            trendLabel="from last month"
          />
          <AdminStatCard
            title="Total Records"
            value={expenses.length}
            icon={<FileText size={20} strokeWidth={2.5} />}
          />
        </AdminStatCardsWrapper>

        <Expenses expenses={expenses} />
      </AdminPageContent>
    </main>
  )
}

export default ExpensesPage