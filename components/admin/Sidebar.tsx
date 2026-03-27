"use client";

import Link from 'next/link'
import { Home, Users, FileText, BarChart, PlusSquare, ChartBar, ListCheckIcon, PlusIcon, Calendar, CalendarPlus, BookOpen, X, DoorOpen, UtensilsCrossed, Store, MenuSquare, Settings, PlusCircle, Building2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { hasPermission, type UserRole } from '@/lib/permissions'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  userRole?: UserRole
}

export function Sidebar({ isOpen = false, onClose, userRole = 'EMPLOYEE' }: SidebarProps) {
  const pathName = usePathname()
  const linkBase =
    "flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-semibold"
  const linkInactive =
    "text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary"
  const linkActive =
    "bg-primary text-primary-foreground shadow-sm shadow-primary/20"

  const isActive = (href: string) => {
    if (href === "/admin") return pathName === "/admin"
    return pathName === href || pathName.startsWith(`${href}/`)
  }

  const leaveManagementActive =
    isActive("/admin/manage-employees") ||
    isActive("/admin/employees") ||
    isActive("/admin/leave-management")

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "w-72 border-r border-primary/10 bg-white dark:bg-zinc-950/60 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out overflow-auto flex flex-col h-screen",
        "md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            <Calendar size={20} />
          </div>
          <h1 className="font-bold text-sm tracking-wider uppercase text-slate-700 dark:text-slate-200">
            HR Portal
          </h1>
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-lg hover:bg-primary/10 transition-colors md:hidden text-slate-600 dark:text-slate-400"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 pb-6 space-y-6">
          {(hasPermission(userRole, 'view_dashboard') ||
            hasPermission(userRole, 'view_policies') ||
            hasPermission(userRole, 'view_reports') ||
            hasPermission(userRole, 'view_analytics') ||
            hasPermission(userRole, 'view_conference_rooms')) && (
            <div>
              <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2">
                General
              </p>
              <div className="space-y-1">
                {hasPermission(userRole, 'view_dashboard') && (
                  <Link
                    href="/admin"
                    className={cn(linkBase, isActive("/admin") ? linkActive : linkInactive)}
                  >
                    <Home size={20} />
                    Dashboard
                  </Link>
                )}

                {hasPermission(userRole, 'view_policies') && (
                  <Link
                    href="/admin/policies"
                    className={cn(linkBase, isActive("/admin/policies") ? linkActive : linkInactive)}
                  >
                    <BookOpen size={20} />
                    Policies
                  </Link>
                )}

                {hasPermission(userRole, 'view_reports') && (
                  <Link
                    href="/admin/reports"
                    className={cn(linkBase, isActive("/admin/reports") ? linkActive : linkInactive)}
                  >
                    <ChartBar size={20} />
                    Reports
                  </Link>
                )}

                {hasPermission(userRole, 'view_analytics') && (
                  <Link
                    href="/admin/analytics"
                    className={cn(linkBase, isActive("/admin/analytics") ? linkActive : linkInactive)}
                  >
                    <BarChart size={20} />
                    Analytics
                  </Link>
                )}

                {hasPermission(userRole, 'view_conference_rooms') && (
                  <Link
                    href="/admin/conference-rooms"
                    className={cn(linkBase, isActive("/admin/conference-rooms") ? linkActive : linkInactive)}
                  >
                    <DoorOpen size={20} />
                    Bookings
                  </Link>
                )}
              </div>
            </div>
          )}

          {(hasPermission(userRole, 'view_contributions') ||
            hasPermission(userRole, 'manage_contributions') ||
            hasPermission(userRole, 'view_expenses') ||
            hasPermission(userRole, 'manage_expenses')) && (
            <div>
              <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2">
                Welfare
              </p>
              <div className="space-y-1">
                {hasPermission(userRole, 'view_contributions') && (
                  <Link
                    href="/admin/contribution"
                    className={cn(linkBase, isActive("/admin/contribution") ? linkActive : linkInactive)}
                  >
                    <ListCheckIcon size={20} />
                    Contributors
                  </Link>
                )}

                {hasPermission(userRole, 'manage_contributions') && (
                  <Link
                    href="/admin/contribution/add"
                    className={cn(linkBase, isActive("/admin/contribution/add") ? linkActive : linkInactive)}
                  >
                    <PlusSquare size={20} />
                    Add Contributor
                  </Link>
                )}

                {hasPermission(userRole, 'view_expenses') && (
                  <Link
                    href="/admin/expenses"
                    className={cn(linkBase, isActive("/admin/expenses") ? linkActive : linkInactive)}
                  >
                    <FileText size={20} />
                    Expenses
                  </Link>
                )}

                {hasPermission(userRole, 'manage_expenses') && (
                  <Link
                    href="/admin/expenses/add"
                    className={cn(linkBase, isActive("/admin/expenses/add") ? linkActive : linkInactive)}
                  >
                    <PlusIcon size={20} />
                    Add Expenses
                  </Link>
                )}
              </div>
            </div>
          )}

          {(hasPermission(userRole, 'view_events') || hasPermission(userRole, 'manage_events')) && (
            <div>
              <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2">
                Events
              </p>
              <div className="space-y-1">
                {hasPermission(userRole, 'view_events') && (
                  <Link
                    href="/admin/events"
                    className={cn(linkBase, isActive("/admin/events") ? linkActive : linkInactive)}
                  >
                    <Calendar size={20} />
                    Events
                  </Link>
                )}

                {hasPermission(userRole, 'manage_events') && (
                  <Link
                    href="/admin/events/add"
                    className={cn(linkBase, isActive("/admin/events/add") ? linkActive : linkInactive)}
                  >
                    <CalendarPlus size={20} />
                    Add events
                  </Link>
                )}
              </div>
            </div>
          )}

          {hasPermission(userRole, 'view_employees') && (
            <div>
              <p
                className={cn(
                  "px-4 text-[10px] font-bold uppercase tracking-[0.15em] mb-2",
                  leaveManagementActive
                    ? "text-primary"
                    : "text-slate-400 dark:text-slate-500"
                )}
              >
                Leave Management
              </p>
              <div className="space-y-1">
                <Link
                  href="/admin/manage-employees"
                  className={cn(
                    linkBase,
                    isActive("/admin/manage-employees") || isActive("/admin/employees")
                      ? linkActive
                      : linkInactive
                  )}
                >
                  <Users size={20} />
                  Manage Employees
                </Link>

                <Link
                  href="/admin/leave-management/requests"
                  className={cn(
                    linkBase,
                    isActive("/admin/leave-management/requests") ? linkActive : linkInactive
                  )}
                >
                  <FileText size={20} />
                  Manage Request
                </Link>

                <Link
                  href="/admin/leave-management/create"
                  className={cn(
                    linkBase,
                    isActive("/admin/leave-management/create") ? linkActive : linkInactive
                  )}
                >
                  <PlusCircle size={20} />
                  Create Leave
                </Link>

                <Link
                  href="/admin/leave-management/departments"
                  className={cn(
                    linkBase,
                    isActive("/admin/leave-management/departments") ? linkActive : linkInactive
                  )}
                >
                  <Building2 size={20} />
                  Departments
                </Link>
              </div>
            </div>
          )}

          {hasPermission(userRole, 'view_food_management') && (
            <div>
              <p
                className={cn(
                  "px-4 text-[10px] font-bold uppercase tracking-[0.15em] mb-2",
                  isActive("/admin/food-management")
                    ? "text-primary"
                    : "text-slate-400 dark:text-slate-500"
                )}
              >
                Food Management
              </p>
              <div className="space-y-1">
                {hasPermission(userRole, 'manage_food_vendors') && (
                  <Link
                    href="/admin/food-management/vendors"
                    className={cn(linkBase, isActive("/admin/food-management/vendors") ? linkActive : linkInactive)}
                  >
                    <Store size={20} />
                    Food Vendors
                  </Link>
                )}

                {hasPermission(userRole, 'manage_food_vendors') && (
                  <Link
                    href="/admin/food-management/foods"
                    className={cn(linkBase, isActive("/admin/food-management/foods") ? linkActive : linkInactive)}
                  >
                    <UtensilsCrossed size={20} />
                    Food Items
                  </Link>
                )}

                {hasPermission(userRole, 'manage_food_menus') && (
                  <Link
                    href="/admin/food-management/menus"
                    className={cn(linkBase, isActive("/admin/food-management/menus") ? linkActive : linkInactive)}
                  >
                    <MenuSquare size={20} />
                    Weekly Menus
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-primary/10 shrink-0">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Settings size={16} />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Settings
            </span>
          </div>
        </div>
    </div>
    </>
  )
}
