import { fetchUserWithContributions } from '@/lib/actions/users.action'
import UserAnalysis from '@/components/admin/User-analysis'

/** Loads contribution-heavy user data separately so the dashboard stats can stream first. */
export async function UserAnalysisSection({ email }: { email: string }) {
  const userData = await fetchUserWithContributions(email)
  if (!userData.success || !userData.user) return null
  return <UserAnalysis userData={userData.user} showRecentContributions />
}
