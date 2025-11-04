import UsercardDetail from '@/components/shared/UsercardDetail'
import { fetchUserWithContributions } from '@/lib/actions/users.action'
// import { auth } from '@clerk/nextjs/server'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

const Dashboard = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  
  if(!session) {
    redirect('/sign-in')
  }


  const userInfo = await fetchUserWithContributions(session.user.email)

  // Check if user is inactive
  if (userInfo.success && userInfo.user && !userInfo.user.isActive) {
    redirect('/account-deactivated')
  }

  return (
    <div className="min-h-screen  ">
      {/* Main Content */}
      {userInfo.success ? <UsercardDetail userData={userInfo.user!} /> :  userInfo.error && <div>{userInfo.error}</div>}
    </div>
  )
}

export default Dashboard