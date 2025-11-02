import { Card } from '@/components/ui/card'
import { fetchPolicyBySlug } from '@/lib/actions/policy.actions'
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

  // Fetch the welfare policy
  const policyResult = await fetchPolicyBySlug('welfare-fund-constitution')

  return (
    <div className='flex flex-col w-full max-h-screen'>
      <main className="mx-auto w-full max-w-5xl p-4 md:p-6 lg:p-8 space-y-6">
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Welfare Fund Policy
            </h1>
            <p className="text-gray-300">
              DevOps Africa Limited - Staff Welfare Fund Constitution
            </p>
          </div>

          {policyResult.success && policyResult.policy ? (
            <Card className="bg-white p-6 md:p-8 max-h-96 2xl:max-h-[32rem] overflow-auto">
              <article
                className={`prose prose-sm md:prose-base max-w-none ${manrope.className}`}
                dangerouslySetInnerHTML={{ __html: policyResult.policy.content }}
              />
            </Card>
          ) : (
            <Card className="bg-white p-6 md:p-8">
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Policy Not Available
                </h3>
                <p className="text-gray-600">
                  The welfare fund policy document is currently being updated. Please check back later.
                </p>
              </div>
            </Card>
          )}

          {policyResult.success && policyResult.policy && (
            <div className="text-sm text-gray-400 text-center">
              Last updated: {new Date(policyResult.policy.updatedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })} • Version {policyResult.policy.version}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default PolicyPage
