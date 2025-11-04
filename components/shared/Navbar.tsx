"use client"

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { fetchUserWithContributions } from '@/lib/actions/users.action'
import { Home, Menu, X, Calendar, DoorOpen, Gift, BookOpen, LayoutDashboard, CheckSquare } from 'lucide-react'
import ProfileMenu from './ProfileMenu'
import NotificationBell from './NotificationBell'
import { authClient } from "@/lib/auth-client"
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { UserValues } from '@/lib/validation'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<UserValues | null>(null)
  const { data: session } = authClient.useSession()
  const pathname = usePathname()

  useEffect(() => {
    const loadUser = async () => {
      if (session?.user?.email) {
        const data = await fetchUserWithContributions(session.user.email)
        if (data.success && data.user) {
          setUserInfo(data.user)
        }
      }
    }
    loadUser()
  }, [session])

  const navItems = [
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/conference-rooms', label: 'Book Room', icon: DoorOpen },
    { href: '/disbursements', label: 'Benefits', icon: Gift },
    { href: '/policy', label: 'Policy', icon: BookOpen },
  ]

  if (userInfo?.canApproveBookings) {
    navItems.push({ href: '/approvals', label: 'Approvals', icon: CheckSquare })
  }

  if (userInfo?.role === 'ADMIN' || userInfo?.role === 'MANAGER') {
    navItems.push({ href: '/admin', label: 'Admin', icon: LayoutDashboard })
  }

  const closeMobileMenu = () => setIsOpen(false)

  return (
    <>
      <header className='sticky top-0 z-50  backdrop-blur-sm border-b border-zinc-800 p-2 md:px-10 md:pt-3 md:pb-0 2xl:px-80'>
        <nav className="flex items-center justify-between p-2 md:p-4 mx-auto">
          {/* Logo/Home */}
          <Link href="/" className="flex items-center gap-2 group">
            <Home className="h-6 w-6 text-emerald-500" />
            <span className="hidden sm:block text-xl font-semibold text-white group-hover:text-green-700 transition-colors">
              HOME
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-base font-semibold transition-colors",
                    pathname === item.href
                      ? "text-emerald-500"
                      : "text-white hover:text-green-700"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right side - Notifications & Profile */}
          <div className="flex items-center gap-3">
            {session?.user && <NotificationBell userId={session.user.id} />}
            {userInfo && <ProfileMenu user={userInfo} />}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              {isOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Navigation - Rendered outside header for proper z-index */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 lg:hidden"
            style={{ zIndex: 9998 }}
            onClick={closeMobileMenu}
          />

          {/* Drawer */}
          <div
            className="fixed top-0 right-0 bottom-0 w-64 bg-zinc-900 border-l border-zinc-800 lg:hidden overflow-y-auto shadow-2xl"
            style={{ zIndex: 9999 }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
              <span className="text-white font-semibold text-lg">Menu</span>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                      pathname === item.href
                        ? "bg-emerald-600 text-white"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </>
      )}
    </>
  )
}
