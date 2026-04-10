import { DashboardQuickActions } from '@/components/shared/DashboardQuickActions'
import UserCard from '@/components/shared/UserCard'
import { Card } from '@/components/ui/card'
import { fetchContributions } from '@/lib/actions/contribution'
import { fetchUpcomingEvents } from '@/lib/actions/events.actions'
import { fetchUserWithContributions } from '@/lib/actions/users.action'
import { auth } from "@/lib/auth"
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'
import { headers } from 'next/headers'
import { Calendar, Layers, Home, Bell, Settings } from 'lucide-react'
import { formatDateParts } from '@/lib/utils'

const Dashboard = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/sign-in")
  }

  const [contributions, userInfo, upcomingEvents] = await Promise.all([
    fetchContributions(1, 10, false),
    fetchUserWithContributions(session.user.email),
    fetchUpcomingEvents()
  ])

  if (userInfo.error || !userInfo.user) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <p className='text-destructive font-bold uppercase tracking-widest'>
          {userInfo.error || "User not found"}
        </p>
      </div>
    )
  }

  const latestEvent = upcomingEvents.events && upcomingEvents.events[0]
  const { day, month, year } = latestEvent ? formatDateParts(new Date(latestEvent.start)) : { day: '15', month: 'SEP', year: '2026' }
  
  return (
    <div className='flex flex-col w-full min-h-screen relative overflow-hidden bg-background'>
      {/* Background Logo Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/assets/images/logo.png')] bg-[length:120px_120px] bg-repeat z-0" />
      
      {/* Specialized Dashboard Header */}
      <header className="relative z-20 flex items-center justify-between px-8 py-8 md:px-20 md:py-12">
        <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-all">
                <Home className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-xs font-black text-foreground tracking-[0.2em] uppercase transition-colors group-hover:text-emerald-500">Home</span>
        </Link>
        <div className="flex items-center gap-8">
            <Link href="/events" className="text-xs font-black text-foreground tracking-[0.2em] uppercase hover:text-emerald-500 transition-colors">Events</Link>
            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
                    <Bell className="w-4 h-4 text-foreground/60" />
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                </button>
                <button className="p-2 rounded-full hover:bg-muted transition-colors text-orange-500">
                    <Settings className="w-4 h-4" />
                </button>
            </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] px-8 py-4 md:px-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          
          {/* Column 1: Quick Actions */}
          <div className="flex-shrink-0 flex items-center gap-6">
             <DashboardQuickActions />
             <div className="hidden lg:block w-[1px] h-64 bg-border/50 self-center mx-4" />
          </div>

          {/* Column 2: Center Card & Branding */}
          <div className="flex-grow w-full max-w-[800px] space-y-12">
            <Link href="/dashboard" className="block transform transition-transform hover:scale-[1.01] active:scale-[0.99]">
              <UserCard userData={userInfo.user} />
            </Link>
            
            <div className="space-y-4 max-w-2xl px-2">
                <p className='text-sm leading-relaxed text-muted-foreground/80 font-medium'>
                    The team is dedicated to enhancing the overall well-being of members of the organization, thus, providing support and resources when and where necessary.
                </p>
            </div>
          </div>

          {/* Column 3: Stats & Events */}
          <div className="w-full lg:w-[400px] flex flex-col gap-6">
            
            <div className="grid grid-cols-2 gap-4">
               {/* Months Paid Card */}
               <Card className="bg-card border-border p-8 flex flex-col items-center justify-center text-center gap-2 rounded-[2rem] shadow-2xl transition-all group border-none">
                    <div className="text-5xl font-black text-emerald-500 tracking-tighter group-hover:scale-110 transition-transform">
                        {userInfo.user?.totalContributionMonths || 0}
                    </div>
                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">
                        Months
                    </div>
                    <div className="pt-4 border-t border-border w-full">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Amount Paid:</p>
                        <p className="text-lg font-black text-emerald-500 tracking-wider">₵{userInfo.user?.totalAmountContributed}.00</p>
                    </div>
               </Card>

               {/* Upcoming Event Card */}
               <Link href="/events" className="block h-full">
                    <Card className="relative h-full overflow-hidden p-8 rounded-[2rem] shadow-2xl border-border group border-none">
                        <div className="absolute inset-0 border-2 border-white/10 rounded-[2rem]" />
                        <div className="relative z-10 flex flex-col h-full justify-between items-center text-center">
                            <div className="space-y-1">
                                <h3 className="text-[9px] font-black text-white/80 uppercase tracking-[0.2em]">PURPLEWAVE HACKATHON</h3>
                                <p className="text-4xl font-black text-orange-600 uppercase leading-tight italic">15</p>
                                <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">SEP, 2026</p>
                            </div>
                        </div>
                    </Card>
               </Link>
            </div>

            {/* Total Accumulated Card */}
            <Card className="bg-emerald-600 border-none p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="flex items-center gap-8 relative z-10">
                    <div className="flex-shrink-0 w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-inner">
                        <span className="text-7xl font-black text-white">₵</span>
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                            {contributions.success ? `${contributions.totalContributions}.00` : '0.00'}
                        </h2>
                        <div className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-tight">
                            Total amount<br/>accumulated
                        </div>
                    </div>
                </div>
            </Card>

          </div>
        </div>

        {/* Footer info */}
        <div className="mt-20 flex">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground/60 underline">Devops Africa Team</span>
                <span className="text-[10px] text-muted-foreground/60">© All Rights Reserved.</span>
             </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

