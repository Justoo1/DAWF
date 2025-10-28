import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchAllPolicies } from '@/lib/actions/policy.actions'
import { fetchUserWithContributions } from '@/lib/actions/users.action'
import { auth } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { headers } from "next/headers"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { FileText, Plus, Edit, Eye } from 'lucide-react'

const PoliciesPage = async () => {
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

  const policiesData = await fetchAllPolicies()

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Policy Management</h2>
        <Link href="/admin/policies/add">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Policy
          </Button>
        </Link>
      </div>

      {policiesData.success && policiesData.policies.length > 0 ? (
        <div className="grid gap-6">
          {policiesData.policies.map((policy) => (
            <Card key={policy.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="flex items-start space-x-3 flex-1">
                  <FileText className="h-5 w-5 text-emerald-600 mt-1" />
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {policy.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                      <span>Slug: <code className="bg-gray-100 px-2 py-1 rounded">{policy.slug}</code></span>
                      <span>•</span>
                      <span>Version {policy.version}</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        policy.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {policy.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Last updated: {new Date(policy.updatedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {policy.updatedBy && ` by ${policy.updatedBy}`}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/policy`} target="_blank">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/admin/policies/edit/${policy.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 line-clamp-2">
                  {policy.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Policies Yet</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first policy document.
            </p>
            <Link href="/admin/policies/add">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Policy
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  )
}

export default PoliciesPage
