import { Card } from '@/components/ui/card'
import { fetchPublicPolicies } from '@/lib/actions/policy.actions'
import { PolicyDetailsDialog } from '@/components/policy/PolicyDetailsDialog'
import { auth } from "@/lib/auth"
import { Manrope } from 'next/font/google'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200","300", "400", "500", "600", "700"]
})

const PolicyPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/sign-in")
  }

  const policiesResult = await fetchPublicPolicies()

  return (
    <div className='flex flex-col w-full max-h-screen'>
      <main className="mx-auto w-full max-w-5xl p-4 md:p-6 lg:p-8 space-y-6">
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Welfare Fund Policy
            </h1>
            <p className="text-muted-foreground">
              DEVOPS AFRICA Limited - Staff Welfare Fund Constitution
            </p>
          </div>

          {policiesResult.success && policiesResult.policies.length > 0 ? (
            <div className="space-y-4">
              {policiesResult.policies.map((policy) => {
                const plainContent = policy.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
                const preview = plainContent.length > 180 ? `${plainContent.slice(0, 180)}...` : plainContent

                return (
                  <PolicyDetailsDialog
                    key={policy.id}
                    policyId={policy.id}
                    title={policy.title}
                    createdAt={new Date(policy.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                    createdBy={policy.createdBy}
                    attachmentName={policy.attachmentName}
                    contentHtml={policy.content}
                    trigger={
                      <Card className="w-full cursor-pointer border border-border bg-card p-5 transition hover:border-primary/40 hover:bg-muted/30">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">{policy.title}</h3>
                            <span className="text-xs text-muted-foreground">Version {policy.version}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{preview || "No policy summary available."}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span>
                              Created {new Date(policy.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <span>By {policy.createdBy ?? "Not captured"}</span>
                            <span>{policy.attachmentName ? "Attachment available" : "No attachment"}</span>
                          </div>
                        </div>
                      </Card>
                    }
                  />
                )
              })}
            </div>
          ) : (
            <Card className="bg-card text-card-foreground border border-border p-6 md:p-8">
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Policy Not Available
                </h3>
                <p className="text-muted-foreground">
                  The welfare fund policy document is currently being updated. Please check back later.
                </p>
              </div>
            </Card>
          )}

          
        </div>
      </main>
    </div>
  )
}

export default PolicyPage
