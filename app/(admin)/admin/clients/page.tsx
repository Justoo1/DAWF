import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { AddClientDialog } from "@/components/admin/AddClientDialog"
import {
  adminTableClassName,
  adminTdClass,
  adminThClass,
  adminTheadRowClass,
  adminTbodyRowClass,
} from "@/lib/admin-ui"
import { Badge } from "@/components/ui/badge"

export default async function AdminClientsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  })

  if (!user || user.role !== "ADMIN") {
    redirect("/admin")
  }

  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { users: true } },
    },
  })

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Clients
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage client organizations. Employees are assigned to a client when they are added.
          </p>
        </div>
        <AddClientDialog />
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <table className={adminTableClassName()}>
          <thead>
            <tr className={adminTheadRowClass}>
              <th className={adminThClass}>Client</th>
              <th className={adminThClass}>Employees</th>
              <th className={adminThClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className={adminTbodyRowClass}>
                <td className={adminTdClass}>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</span>
                </td>
                <td className={adminTdClass}>{c._count.users}</td>
                <td className={adminTdClass}>
                  <Badge
                    variant="outline"
                    className={
                      c.isActive
                        ? "border-emerald-300 text-emerald-800 bg-emerald-50"
                        : "border-slate-300 text-slate-600"
                    }
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No clients yet. Create one to assign employees.</p>
        ) : null}
      </div>
    </div>
  )
}
