'use client'

import Header from '@/components/admin/Header'
import { Sidebar } from '@/components/admin/Sidebar'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { fetchAdminShellUser } from '@/lib/actions/users.action'
import { UserRole } from '@/lib/permissions'
import { AdminShellUser } from '@/lib/validation'
import { cn } from '@/lib/utils'

const FOOD_COMMITTEE_ADMIN_HOME = '/admin/food-management/vendors'

const SIDEBAR_COLLAPSED_KEY = 'devops-africa-admin-sidebar-collapsed'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean | null>(null)
  const [adminUser, setAdminUser] = useState<AdminShellUser | null>(null)
  const [shellUserFetchFailed, setShellUserFetchFailed] = useState(false)
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const pathname = usePathname()
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = ((session?.user as any)?.role as UserRole | undefined) ?? (adminUser?.role as UserRole | undefined) ?? 'EMPLOYEE'
  const profilePending =
    Boolean(session?.user?.email) &&
    !sessionPending &&
    adminUser === null &&
    !shellUserFetchFailed

  useEffect(() => {
    try {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true')
    } catch {
      setSidebarCollapsed(false)
    }
  }, [])

  useEffect(() => {
    if (sidebarCollapsed === null) return
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed))
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed])

  useEffect(() => {
    if (!session?.user?.email) {
      setAdminUser(null)
      setShellUserFetchFailed(false)
      return
    }
    let cancelled = false
    setShellUserFetchFailed(false)
    void (async () => {
      const data = await fetchAdminShellUser(session.user.email)
      if (cancelled) return
      if (data.success && data.user) {
        setAdminUser(data.user)
        setShellUserFetchFailed(false)
      } else {
        setAdminUser(null)
        setShellUserFetchFailed(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session?.user?.email])

  useEffect(() => {
    if (userRole !== 'FOOD_COMMITTEE') return
    if (!pathname?.startsWith('/admin')) return
    if (pathname === '/admin') return
    if (pathname.startsWith('/admin/food-management')) return
    router.replace(FOOD_COMMITTEE_ADMIN_HOME)
  }, [userRole, pathname, router])

  const collapsed = sidebarCollapsed ?? false

  return (
    <div className="relative flex h-dvh min-h-0 w-full overflow-hidden bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
        collapsed={collapsed}
      />
      <div
        className={cn(
          'flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
          'md:transition-[margin-left] md:duration-300 md:motion-safe:ease-in-out',
          collapsed ? 'md:ml-16' : 'md:ml-72'
        )}
      >
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed ?? false}
          onToggleSidebarCollapse={() =>
            setSidebarCollapsed((c) => !(c ?? false))
          }
          userInfo={adminUser}
          profilePending={profilePending}
        />
        {/* Flex column + min-h-0 so nested .admin-main can shrink and scroll instead of growing the whole shell */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
