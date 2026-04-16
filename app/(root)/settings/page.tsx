import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Settings } from "lucide-react"
import prisma from "@/lib/prisma"
import CompleteProfileForm from "@/components/auth/CompleteProfileForm"

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  const userRow = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { dateOfBirth: true },
  })

  const isProfileComplete = Boolean(userRow?.dateOfBirth)

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-8 md:py-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-zinc-400">
          Account and application preferences.
        </p>
      </div>

      {!isProfileComplete ? (
        <div className="mt-8">
          <CompleteProfileForm />
        </div>
      ) : (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-6 text-sm text-emerald-50">
          <Settings className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden />
          <div>
            <p className="font-semibold">Your profile is complete</p>
            <p className="text-xs text-emerald-100/80 mt-1">
              Thanks! You can continue using the app.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-6 text-sm text-zinc-400">
        <Settings className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
        <p>
          More options will appear here as we add preferences. Contact HR if you
          need changes to your profile or access.
        </p>
      </div>
    </main>
  )
}
