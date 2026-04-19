"use client"

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { fetchAdminShellUser } from '@/lib/actions/users.action'
import {
  Home,
  Menu,
  X,
  Calendar,
  DoorOpen,
  Gift,
  BookOpen,
  LayoutDashboard,
  CheckSquare,
  UtensilsCrossed,
  FileText,
} from 'lucide-react'
import ProfileMenu from './ProfileMenu'
import NotificationBell from './NotificationBell'
import { authClient } from "@/lib/auth-client"
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { AdminShellUser } from '@/lib/validation'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<AdminShellUser | null>(null)
  const { data: session } = authClient.useSession()
  const pathname = usePathname()

  useEffect(() => {
    const loadUser = async () => {
      if (session?.user?.email) {
        const data = await fetchAdminShellUser(session.user.email)
        if (data.success && data.user) {
          setUserInfo(data.user)
        }
      }
    }
    loadUser()
  }, [session])

  const navItems = [
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/leave', label: 'Leave', icon: FileText },
    { href: '/conference-rooms', label: 'Book room', icon: DoorOpen },
    { href: '/food-orders', label: 'Food', icon: UtensilsCrossed },
    { href: '/disbursements', label: 'Benefits', icon: Gift },
    { href: '/policy', label: 'Policy', icon: BookOpen },
  ]

  if (userInfo?.canApproveBookings) {
    navItems.push({ href: '/approvals', label: 'Approvals', icon: CheckSquare })
  }

  if (userInfo?.role === 'ADMIN' || userInfo?.role === 'MANAGER' || userInfo?.role === 'FOOD_COMMITTEE') {
    navItems.push({ href: '/admin', label: 'Admin', icon: LayoutDashboard })
  }

  const closeMobileMenu = () => setIsOpen(false)

  const linkActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))

  if (pathname === "/home") return null;

  return (
    <>
      <header className="sticky top-0 z-[100] border-b border-border/80 bg-background/95 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/90">
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6 md:px-10 2xl:px-16">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 rounded-lg py-1 pr-2 transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/25">
              <Home className="h-[18px] w-[18px] text-emerald-400" />
            </div>
            <div className="hidden min-[380px]:block leading-tight">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                DevOps Africa
              </span>
              <span className="block text-sm font-semibold text-foreground">Welfare</span>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <div className="flex max-w-2xl flex-wrap items-center justify-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = linkActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                      active
                        ? "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground dark:hover:bg-zinc-800/80"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              {session?.user ? (
                <>
                  <NotificationBell userId={session.user.id} />
                  {userInfo && <ProfileMenu user={userInfo} />}
                </>
              ) : (
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center rounded-lg border border-emerald-600/35 bg-emerald-600/10 px-4 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:border-emerald-600/50 hover:bg-emerald-600/15 dark:text-emerald-300 dark:hover:border-emerald-400/50"
                >
                  Sign in
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-xl border border-border bg-muted/50 p-2 text-foreground transition-colors hover:bg-muted lg:hidden dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <X className="h-6 w-6 text-zinc-200" />
              ) : (
                <Menu className="h-6 w-6 text-zinc-200" />
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
                const active = linkActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors",
                      active
                        ? "bg-emerald-600/90 text-white"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
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
