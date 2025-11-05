"use client";

import Link from 'next/link'
import { Home, Users, FileText, BarChart, PlusSquare, ChartBar, ListCheckIcon, PlusIcon, Calendar, CalendarPlus, BookOpen, X, DoorOpen, UtensilsCrossed, Store, MenuSquare } from 'lucide-react'
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
        "bg-green-800 text-white w-64 space-y-6 py-7 px-2 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out overflow-auto",
        "md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Close button for mobile */}
        <div className="flex justify-end mb-4 md:hidden">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav>
        {hasPermission(userRole, 'view_dashboard') && (
          <Link href="/admin" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin" && "bg-green-700 text-white")}>
            <Home className="inline-block mr-2" size={20} />
            Dashboard
          </Link>
        )}

        {hasPermission(userRole, 'view_contributions') && (
          <Link href="/admin/contribution" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/contribution" && "bg-green-700 text-white")}>
            <ListCheckIcon className="inline-block mr-2" size={20} />
            Contributions
          </Link>
        )}

        {hasPermission(userRole, 'manage_contributions') && (
          <Link href="/admin/contribution/add" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/contribution/add" && "bg-green-700 text-white")}>
            <PlusSquare className="inline-block mr-2" size={20} />
            Add Contribution
          </Link>
        )}

        {hasPermission(userRole, 'view_expenses') && (
          <Link href="/admin/expenses" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/expenses" && "bg-green-700 text-white")}>
            <FileText className="inline-block mr-2" size={20} />
            Expenses
          </Link>
        )}

        {hasPermission(userRole, 'manage_expenses') && (
          <Link href="/admin/expenses/add" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/expenses/add" && "bg-green-700 text-white")}>
            <PlusIcon className="inline-block mr-2" size={20} />
            Add Expense
          </Link>
        )}

        {hasPermission(userRole, 'view_events') && (
          <Link href="/admin/events" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/events" && "bg-green-700 text-white")}>
            <Calendar className="inline-block mr-2" size={20} />
            Events
          </Link>
        )}

        {hasPermission(userRole, 'manage_events') && (
          <Link href="/admin/events/add" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/events/add" && "bg-green-700 text-white")}>
            <CalendarPlus className="inline-block mr-2" size={20} />
            Add Event
          </Link>
        )}

        {hasPermission(userRole, 'view_employees') && (
          <Link href="/admin/employees" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/employees" && "bg-green-700 text-white")}>
            <Users className="inline-block mr-2" size={20} />
            Employees
          </Link>
        )}

        {hasPermission(userRole, 'view_policies') && (
          <Link href="/admin/policies" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName.startsWith("/admin/policies") && "bg-green-700 text-white")}>
            <BookOpen className="inline-block mr-2" size={20} />
            Policies
          </Link>
        )}

        {hasPermission(userRole, 'view_reports') && (
          <Link href="/admin/reports" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/reports" && "bg-green-700 text-white")}>
            <ChartBar className="inline-block mr-2" size={20} />
            Reports
          </Link>
        )}

        {hasPermission(userRole, 'view_analytics') && (
          <Link href="/admin/analytics" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/analytics" && "bg-green-700 text-white")}>
            <BarChart className="inline-block mr-2" size={20} />
            Analytics
          </Link>
        )}

        {hasPermission(userRole, 'view_conference_rooms') && (
          <Link href="/admin/conference-rooms" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName.startsWith("/admin/conference-rooms") && "bg-green-700 text-white")}>
            <DoorOpen className="inline-block mr-2" size={20} />
            Conference Rooms
          </Link>
        )}

        {/* Food Management Section */}
        {hasPermission(userRole, 'view_food_management') && (
          <>
            <div className="mt-6 mb-2 px-4">
              <div className="border-t border-green-600 pt-4">
                <p className="text-xs font-semibold text-green-300 uppercase tracking-wider">
                  Food Management
                </p>
              </div>
            </div>

            {hasPermission(userRole, 'manage_food_vendors') && (
              <Link href="/admin/food-management/vendors" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName.startsWith("/admin/food-management/vendors") && "bg-green-700 text-white")}>
                <Store className="inline-block mr-2" size={20} />
                Food Vendors
              </Link>
            )}

            {hasPermission(userRole, 'manage_food_menus') && (
              <Link href="/admin/food-management/menus" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName.startsWith("/admin/food-management/menus") && "bg-green-700 text-white")}>
                <MenuSquare className="inline-block mr-2" size={20} />
                Weekly Menus
              </Link>
            )}

            {hasPermission(userRole, 'view_food_orders') && (
              <Link href="/admin/food-management/menus" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName.includes("/admin/food-management/orders") && "bg-green-700 text-white")}>
                <UtensilsCrossed className="inline-block mr-2" size={20} />
                View Orders
              </Link>
            )}
          </>
        )}
      </nav>
    </div>
    </>
  )
}

