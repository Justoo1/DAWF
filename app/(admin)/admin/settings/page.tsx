import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AdminPageContent } from "@/components/admin/layout/AdminPageContent"
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader"
import { Settings } from "lucide-react"

export default async function AdminSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  return (
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Settings"
          description="Account and application preferences."
        />
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground dark:bg-zinc-900/40">
          <Settings className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <p>
            More options will appear here as we add preferences. Use the rest of
            the admin area to manage employees, leave, and welfare tools.
          </p>
        </div>
      </AdminPageContent>
    </main>
  )
}
