"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Edit, Eye } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader"
import { PolicyModal } from './PolicyModal'
import type { PolicySummary } from '@/lib/actions/policy.actions'
import Link from 'next/link'

interface PoliciesClientProps {
  initialPolicies: PolicySummary[]
  userEmail: string
}

export default function PoliciesClient({ initialPolicies, userEmail }: PoliciesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<PolicySummary | undefined>(undefined)
  const [mode, setMode] = useState<'create' | 'edit'>('create')

  const handleAddPolicy = () => {
    setSelectedPolicy(undefined)
    setMode('create')
    setIsModalOpen(true)
  }

  const handleEditPolicy = (policy: PolicySummary) => {
    setSelectedPolicy(policy)
    setMode('edit')
    setIsModalOpen(true)
  }

  return (
    <>
      <AdminPageHeader
        title="Policies"
        description="Create and manage policy documents."
        action={
          <Button onClick={handleAddPolicy} className="shadow-md h-10 px-5 rounded-xl bg-[#10A074] hover:bg-[#0d8460] text-white font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95">
            <Plus className="h-4 w-4 mr-2" />
            Add New Policy
          </Button>
        }
      />

      {initialPolicies.length > 0 ? (
        <div className="grid gap-6">
          {initialPolicies.map((policy) => (
            <Card
              key={policy.id}
              className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/30 transition-all group rounded-2xl overflow-hidden"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-primary group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
                      {policy.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1.5">
                        Slug:
                        <code className="rounded-lg bg-slate-100 dark:bg-slate-900 px-2 py-0.5 text-[10px] text-slate-700 dark:text-slate-200 font-bold border border-slate-200/50 dark:border-slate-800">
                          {policy.slug}
                        </code>
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span>Version {policy.version}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <Badge
                        variant={policy.isActive ? "default" : "secondary"}
                        className={policy.isActive ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 border-none rounded-lg font-bold px-2 py-0 text-[10px]" : "rounded-lg font-bold px-2 py-0 text-[10px]"}
                      >
                        {policy.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      Last updated:{" "}
                      <span className="text-slate-500">
                        {new Date(policy.updatedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      {policy.updatedBy && (
                        <>
                          <span className="mx-1">•</span>
                          BY <span className="text-primary">{policy.updatedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/policy`} target="_blank">
                    <Button variant="ghost" size="sm" className="h-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-all font-bold text-[10px] uppercase tracking-wider">
                      <Eye className="h-4 w-4 mr-1.5" />
                      View
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditPolicy(policy)}
                    className="h-9 rounded-xl hover:bg-amber-500/5 hover:text-amber-600 transition-all font-bold text-[10px] uppercase tracking-wider"
                  >
                    <Edit className="h-4 w-4 mr-1.5" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed opacity-80">
                  {policy.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl">
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No Policies Yet</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto font-medium leading-relaxed">
              Get started by creating your first policy document. These documents define the rules and guidelines for your organization.
            </p>
            <Button onClick={handleAddPolicy} className="shadow-lg h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-[12px] transition-all active:scale-95">
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </CardContent>
        </Card>
      )}

      <PolicyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userEmail={userEmail}
        policy={selectedPolicy}
        mode={mode}
      />
    </>
  )
}
