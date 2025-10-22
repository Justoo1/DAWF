import UpcomingEvent from '@/components/shared/UpcomingEvent'
import UserCard from '@/components/shared/UserCard'
import { Card } from '@/components/ui/card'
import { fetchContributions } from '@/lib/actions/contribution'
import { fetchUpcomingEvents } from '@/lib/actions/events.actions'
import { fetchUserWithContributions } from '@/lib/actions/users.action'
import { cn } from '@/lib/utils'
import { auth } from "@/lib/auth"
import { Manrope } from 'next/font/google'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'
import { headers } from 'next/headers'

const manrope = Manrope({ 
  subsets: ["latin"], 
  weight: ["200","300", "400", "500", "600", "700"]
})

const Dashboard = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/sign-in")
  }

  // TODO: check for email verification

  const [contributions, userInfo, upcomingEvents] = await Promise.all([fetchContributions(), fetchUserWithContributions(session.user.email), fetchUpcomingEvents()])

  if (userInfo.error) {
    return (
      <div className='min-h-screen flex flex-col w-full'>
        <main className="mx-auto w-full max-w-7xl p-4 space-y-6 flex flex-col">
          <span className='text-red-500'>{userInfo.error}</span>
        </main>
      </div>
    )
  }
  else if (!userInfo.user) {
    return (
      <div className='min-h-screen flex flex-col w-full'>
        <main className="mx-auto w-full max-w-7xl p-4 space-y-6 flex flex-col">
          <span className='text-red-500'>User not found</span>
        </main>
      </div>
    )
  }
  
  return (
    <div className='flex flex-col w-full lg:max-h-screen '>
      <main className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8 space-y-6 flex flex-col ">
        <div className="flex flex-col justify-center items-center lg:flex-row w-full space-y-6 lg:space-y-0 lg:space-x-6">
          <div className="w-full lg:w-[25%] justify-center items-center">
            <UpcomingEvent upcomingEvents={upcomingEvents.events!} success={upcomingEvents.success} />
          </div>
          <div className="w-full lg:w-[75%] flex flex-col space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Link href="/dashboard" className='block h-full'>
                  <UserCard userData={userInfo.user!} />
                </Link>
              </div>
              <div className="flex flex-col space-y-6">
                <div className={cn("grid grid-cols-2 gap-2", manrope.className)}>
                  <Card className="bg-white p-4 flex-grow">
                    <div className="text-center mb-4">
                      <div className="text-3xl sm:text-4xl font-bold text-emerald-600">{userInfo.user?.totalContributionMonths}</div>
                      <div className="text-sm sm:text-base font-bold text-emerald-600">MONTHS</div>
                      <div className="mt-2 text-xs text-zinc-800 font-bold">
                        AMOUNT PAID:
                        <div className="text-emerald-600 font-semibold text-base">₵{userInfo.user?.totalAmountContributed}.00</div>
                      </div>
                    </div>
                  </Card>

                  <Link href="/events"  className=" flex flex-grow">
                    <Card className="bg-[url('/assets/images/event.svg')] bg-cover p-4 flex-grow justify-center items-center flex">
                      <div className="text-center ">
                        <div className="text-xl md:text-5xl font-extrabold text-[#DD3B08] leading-tight">
                          EVE<br/>NTS
                        </div>
                      </div>
                    </Card>
                  </Link>
                </div>
                <Card className="bg-emerald-600 p-4 lg:py-9 text-white">
                  <div className="flex items-center gap-3 leading-3 justify-center">
                    <div className="rounded-lg bg-white p-2">
                      <span className="text-xl sm:text-7xl font-bold text-emerald-600">₵</span>
                    </div>
                    <div>
                      <div className="text-xl sm:text-4xl font-bold">
                        {contributions.success ? `${contributions.totalContributions}.00` : '0.00'}
                      </div>
                      <div className="text-xs sm:text-base">
                        TOTAL AMOUNT
                        <br />
                        ACCUMULATED
                      </div>
                      <span className='text-muted-foreground text-xs mt-10 text-red-50'>Entire Employees</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            <p className='text-sm text-left text-white'>
                The Welfare team is dedicated to enhancing the overall well-being of members of the organization, thus, providing support and resources when and where necessary. This application provides each member access to various contributions made to the Welfare team and also the total amount accumulated by the Welfare team of DevOps Africa ltd.
              </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

