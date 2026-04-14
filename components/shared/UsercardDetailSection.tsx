import { fetchUserWithContributions } from '@/lib/actions/users.action'
import UsercardDetail from '@/components/shared/UsercardDetail'

export async function UsercardDetailSection({ email }: { email: string }) {
  const userInfo = await fetchUserWithContributions(email)
  if (!userInfo.success || !userInfo.user) {
    return (
      <div className="p-6 text-sm text-destructive">
        {userInfo.error ?? 'Could not load profile.'}
      </div>
    )
  }
  return <UsercardDetail userData={userInfo.user} />
}
