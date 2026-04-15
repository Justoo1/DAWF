import { fetchAdminShellUser } from '@/lib/actions/users.action'
import { auth } from "@/lib/auth"
import { redirect } from 'next/navigation'
import QuickActions from "@/components/admin/QuickActions"
import { headers } from "next/headers"
import { canAccessAdmin } from '@/lib/permissions'
import { AdminPageContent } from "@/components/admin/layout/AdminPageContent"
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader"
import { Suspense } from 'react'
import { UserAnalysisSection } from '@/components/admin/UserAnalysisSection'
import { UserAnalysisSkeleton } from '@/components/admin/UserAnalysisSkeleton'
import {
  AdminDashboardStats,
  AdminDashboardStatsSkeleton,
} from "@/components/admin/AdminDashboardStats"

const Dashboard = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session){
    redirect('/')
  }

  const shell = await fetchAdminShellUser(session.user.email)
  if (!shell.success || !shell.user) {
    redirect('/')
  }

  if (!canAccessAdmin(shell.user.role as 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'FOOD_COMMITTEE')){
    redirect('/')
  }

  if (shell.user.role === 'FOOD_COMMITTEE') {
    redirect('/admin/food-management/vendors')
  }

  return (
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Dashboard"
          description="Overview of contributions, members, events, and expenses."
        />

        <Suspense fallback={<AdminDashboardStatsSkeleton />}>
          <AdminDashboardStats />
        </Suspense>

        <Suspense fallback={<UserAnalysisSkeleton />}>
          <UserAnalysisSection email={session.user.email} />
        </Suspense>
        <QuickActions />
      </AdminPageContent>
    </main>
  )
}

export default Dashboard;
