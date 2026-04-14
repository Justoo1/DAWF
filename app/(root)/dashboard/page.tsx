import { fetchAdminShellUser } from '@/lib/actions/users.action'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { UsercardDetailSection } from '@/components/shared/UsercardDetailSection'
import { UsercardDetailSkeleton } from '@/components/shared/UsercardDetailSkeleton'

const Dashboard = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  
  if(!session) {
    redirect('/sign-in')
  }

  const shell = await fetchAdminShellUser(session.user.email)
  if (!shell.success || !shell.user) {
    redirect('/sign-in')
  }
  if (!shell.user.isActive) {
    redirect('/account-deactivated')
  }

  return (
    <div className="min-h-screen  ">
      <Suspense fallback={<UsercardDetailSkeleton />}>
        <UsercardDetailSection email={session.user.email} />
      </Suspense>
    </div>
  )
}

export default Dashboard