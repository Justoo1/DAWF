'use client'

import Header from '@/components/admin/Header'
import { Sidebar } from '@/components/admin/Sidebar'
import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import { fetchUserWithContributions } from '@/lib/actions/users.action'
import { UserRole } from '@/lib/permissions'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>('EMPLOYEE')
  const { data: session } = authClient.useSession()

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
    <div className="flex h-full lg:h-screen bg-zinc-950/80">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={userRole} />
        <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        {children}
        </div>
    </div>
  )
}
