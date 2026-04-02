'use client'

import Header from '@/components/admin/Header'
import { Sidebar } from '@/components/admin/Sidebar'
import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import { fetchUserWithContributions } from '@/lib/actions/users.action'
import { UserRole } from '@/lib/permissions'

const SIDEBAR_COLLAPSED_KEY = 'dawf-admin-sidebar-collapsed'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<UserRole>('EMPLOYEE')
  const { data: session } = authClient.useSession()

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
    const loadUserRole = async () => {
      if (session?.user?.email) {
        const data = await fetchUserWithContributions(session.user.email)
        if (data.success && data.user) {
          setUserRole(data.user.role as UserRole)
        }
      }
    }
    loadUserRole()
  }, [session])

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
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
