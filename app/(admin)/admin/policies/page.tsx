import { fetchAllPolicies } from '@/lib/actions/policy.actions'
import { fetchAdminShellUser } from '@/lib/actions/users.action'
import { auth } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { headers } from "next/headers"
import { AdminPageContent } from "@/components/admin/layout/AdminPageContent"
import PoliciesClient from '@/components/admin/PoliciesClient'

const PoliciesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session){
    redirect('/')
  }

  const gate = await fetchAdminShellUser(session.user.email)

  if (!gate.success || !gate.user || gate.user.role !== "ADMIN"){
    redirect('/')
  }

  const policiesData = await fetchAllPolicies()

  return (
    <main className="admin-main">
      <AdminPageContent>
        <PoliciesClient 
          initialPolicies={policiesData.success ? policiesData.policies : []} 
          userEmail={session.user.email} 
        />
      </AdminPageContent>
    </main>
  )
}

export default PoliciesPage
