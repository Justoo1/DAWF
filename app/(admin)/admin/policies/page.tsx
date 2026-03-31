import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchAllPolicies } from '@/lib/actions/policy.actions'
import { fetchUserWithContributions } from '@/lib/actions/users.action'
import { auth } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { headers } from "next/headers"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { FileText, Plus, Edit, Eye } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { AdminPageContent } from "@/components/admin/layout/AdminPageContent"
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader"

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
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Policies"
          description="Create and manage policy documents."
          action={
            <Link href="/admin/policies/add">
              <Button className="shadow-sm">
                <Plus className="h-4 w-4" />
                Add New Policy
              </Button>
            </Link>
          }
        />

        {policiesData.success && policiesData.policies.length > 0 ? (
          <div className="grid gap-6">
            {policiesData.policies.map((policy) => (
              <Card
                key={policy.id}
                className="border-border/50 shadow-sm ring-1 ring-border/30"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <FileText className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-foreground truncate">
                        {policy.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span>
                          Slug:{" "}
                          <code className="rounded bg-muted/60 px-2 py-1 text-xs text-foreground">
                            {policy.slug}
                          </code>
                        </span>
                        <span className="text-border">•</span>
                        <span>Version {policy.version}</span>
                        <span className="text-border">•</span>
                        <Badge
                          variant={policy.isActive ? "default" : "secondary"}
                          className={policy.isActive ? "bg-primary/15 text-primary hover:bg-primary/15" : undefined}
                        >
                          {policy.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Last updated:{" "}
                        {new Date(policy.updatedAt).toLocaleDateString('en-GB', {
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
                      <Button variant="outline" size="sm" className="shadow-sm">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/policies/edit/${policy.id}`}>
                      <Button variant="outline" size="sm" className="shadow-sm">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {policy.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Policies Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get started by creating your first policy document.
              </p>
              <Link href="/admin/policies/add">
                <Button className="shadow-sm">
                  <Plus className="h-4 w-4" />
                  Create Policy
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </AdminPageContent>
    </main>
  )
}

export default PoliciesPage
