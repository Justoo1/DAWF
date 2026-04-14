'use client'

import Header from '@/components/admin/Header'
import { Sidebar } from '@/components/admin/Sidebar'
import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import { fetchAdminShellUser } from '@/lib/actions/users.action'
import { UserRole } from '@/lib/permissions'
import { AdminShellUser } from '@/lib/validation'

const SIDEBAR_COLLAPSED_KEY = 'dawf-admin-sidebar-collapsed'

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
  const userRole = (adminUser?.role as UserRole | undefined) ?? 'EMPLOYEE'
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

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
        collapsed={sidebarCollapsed ?? false}
      />
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed ?? false}
          onToggleSidebarCollapse={() =>
            setSidebarCollapsed((c) => !(c ?? false))
          }
          userInfo={adminUser}
          profilePending={profilePending}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
