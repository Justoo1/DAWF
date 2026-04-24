import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { AddClientDialog } from "@/components/admin/AddClientDialog"
import { ClientsTable } from "@/components/admin/ClientsTable"
import { AdminPageContent } from "@/components/admin/layout/AdminPageContent"
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader"
import { AdminStatCard, AdminStatCardsWrapper } from "@/components/admin/layout/AdminStatCards"
import { Building2, CheckCircle2, CircleOff, Users } from "lucide-react"

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

  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.isActive).length
  const inactiveClients = totalClients - activeClients
  const totalEmployeesAssigned = clients.reduce(
    (sum, c) => sum + c._count.users,
    0
  )

  const rows = clients.map((c) => ({
    id: c.id,
    name: c.name,
    address: c.address,
    isActive: c.isActive,
    employeeCount: c._count.users,
  }))

  return (
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Clients"
          description="Manage client organizations. Employees are assigned to a client when they are added."
          action={<AddClientDialog />}
        />

        <AdminStatCardsWrapper>
          <AdminStatCard
            title="Total clients"
            value={totalClients}
            icon={<Building2 size={20} strokeWidth={2.5} />}
          />
          <AdminStatCard
            title="Active"
            value={activeClients}
            icon={<CheckCircle2 size={20} strokeWidth={2.5} />}
          />
          <AdminStatCard
            title="Inactive"
            value={inactiveClients}
            icon={<CircleOff size={20} strokeWidth={2.5} />}
          />
          <AdminStatCard
            title="Employees assigned"
            value={totalEmployeesAssigned}
            icon={<Users size={20} strokeWidth={2.5} />}
          />
        </AdminStatCardsWrapper>

        <ClientsTable clients={rows} />
      </AdminPageContent>
    </main>
  )
}
