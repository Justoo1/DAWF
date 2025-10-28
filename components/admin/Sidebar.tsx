"use client";

import Link from 'next/link'
import { Home, Users, FileText, BarChart, PlusSquare, ChartBar, ListCheckIcon, PlusIcon, Calendar, CalendarPlus, BookOpen } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathName = usePathname()
  return (
    <div className="bg-green-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <nav>
        <Link href="/admin" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin" && "bg-green-700 text-white")}>
          <Home className="inline-block mr-2" size={20} />
          Dashboard
        </Link>
        <Link href="/admin/contribution" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/contribution" && "bg-green-700 text-white")}>
          <ListCheckIcon className="inline-block mr-2" size={20} />
          Contributions
        </Link>
        <Link href="/admin/contribution/add" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/contribution/add" && "bg-green-700 text-white")}>
          <PlusSquare className="inline-block mr-2" size={20} />
          Add Contribution
        </Link>
        <Link href="/admin/expenses" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/expenses" && "bg-green-700 text-white")}>
          <FileText className="inline-block mr-2" size={20} />
          Expenses
        </Link>
        <Link href="/admin/expenses/add" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/expenses/add" && "bg-green-700 text-white")}>
          <PlusIcon className="inline-block mr-2" size={20} />
          Add Expense
        </Link>
        <Link href="/admin/events" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/events" && "bg-green-700 text-white")}>
          <Calendar className="inline-block mr-2" size={20} />
          Events
        </Link>
        <Link href="/admin/events/add" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/events/add" && "bg-green-700 text-white")}>
          <CalendarPlus className="inline-block mr-2" size={20} />
          Add Event
        </Link>
        <Link href="/admin/employees" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/employees" && "bg-green-700 text-white")}>
          <Users className="inline-block mr-2" size={20} />
          Employees
        </Link>
        <Link href="/admin/policies" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName.startsWith("/admin/policies") && "bg-green-700 text-white")}>
          <BookOpen className="inline-block mr-2" size={20} />
          Policies
        </Link>
        <Link href="/admin/reports" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/reports" && "bg-green-700 text-white")}>
          <ChartBar className="inline-block mr-2" size={20} />
          Reports
        </Link>
        <Link href="/admin/analytics" className={cn("block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 hover:text-white", pathName === "/admin/analytics" && "bg-green-700 text-white")}>
          <BarChart className="inline-block mr-2" size={20} />
          Analytics
        </Link>
      </nav>
    </div>
  )
}

