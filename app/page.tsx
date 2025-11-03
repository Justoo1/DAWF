import { redirect } from 'next/navigation'
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function RootPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // If user is authenticated, redirect to dashboard
  if (session) {
    redirect("/dawf")
  }

  // If not authenticated, redirect to public calendar
  redirect("/public-calendar")
}
