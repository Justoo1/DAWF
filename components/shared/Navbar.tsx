// import { UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import { fetchUserWithContributions } from '@/lib/actions/users.action'
import { Home } from 'lucide-react'
import ProfileMenu from './ProfileMenu'
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const Navbar = async () => {
  const session = await auth.api.getSession({
      headers: await headers()
  })

  if(!session) {
    return redirect('/sign-in')
  }

  const userInfo = await fetchUserWithContributions(session.user.email)

  return (
    <header className='p-3 md:px-10 2xl:px-80 lg:py-6'>
        <nav className="flex items-center justify-between p-4 mx-auto">
        <Link href="/" className="flex items-center gap-2 group ">
          <Home className="h-6 w-6 text-emerald-500 " />
          <span className="flex flex-col justify-center items-center md:flex-row text-xs md:text-xl font-semibold text-white group-hover:text-green-700 transition-colors">
            HOME
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/events" className="text-xs md:text-xl font-semibold text-white hover:text-green-700 transition-colors">
            <span className="flex flex-col items-center justify-center">
            {/* <Calendar className="h-6 w-6 text-emerald-500 md:hidden" /> */}
            EVENTS
            </span>
          </Link>
          <Link href="/disbursements" className="text-xs md:text-xl font-semibold text-white hover:text-green-700 transition-colors">
            <span className="flex flex-col items-center justify-center">
            BENEFITS
            </span>
          </Link>
         {userInfo.success && userInfo.user?.role === "ADMIN" && (
           <Link href="/admin" className="text-xs md:text-xl font-semibold text-white hover:text-green-700 transition-colors">
           <span className="flex flex-col items-center justify-center">
           {/* <LayoutDashboardIcon className="h-6 w-6 text-emerald-500 md:hidden" /> */}
           ADMIN
           </span>
         </Link>
         )}
          {/* <UserButton /> */}
          {userInfo.success && userInfo.user && <ProfileMenu user={userInfo.user} />}
        </div>
      </nav>
    </header>
  )
}
