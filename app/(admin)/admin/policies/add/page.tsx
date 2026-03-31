import { Card } from "@/components/ui/card"
import { fetchUserWithContributions } from '@/lib/actions/users.action'
import { auth } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { headers } from "next/headers"
import PolicyForm from '@/components/admin/PolicyForm'

const AddPolicyPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session){
    redirect('/')
  }

  const userData = await fetchUserWithContributions(session.user.email)

  if (userData.user?.role !== "ADMIN"){
    redirect('/')
  }

  return (
    <main className="admin-main">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New Policy</h2>

        <Card className="p-6">
          <PolicyForm userEmail={session.user.email} mode="create" />
        </Card>
      </div>
    </main>
  )
}

export default AddPolicyPage
