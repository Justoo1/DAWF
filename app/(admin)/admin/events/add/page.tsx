import EventAdd from '@/components/admin/AddEvent'
import QuickActions from '@/components/admin/QuickActions'
import { fetchUser } from '@/lib/actions/users.action'
// import { auth } from '@clerk/nextjs/server'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const AddEventPage = async () => {
    // const { userId } = await auth()
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if(!session) {
        redirect('/sign-in')
    }
    
    const data = await fetchUser(session.user.email)
    if(!data.success ) {
        redirect('/admin')
    }

  return (
      <main className="admin-main">
      <div className="mx-auto max-w-7xl lg:p-8 bg-white dark:bg-zinc-950 rounded-md shadow-sm border border-slate-200 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-zinc-100 mb-6">Add Event</h2>
        <EventAdd userId={data.user!.id} />
      </div>
      <QuickActions />
    </main>
  )
}

export default AddEventPage