"use client"

import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Shapes,
  MoreVertical,
  CalendarDays,
  FilePenLine,
  Loader2
} from "lucide-react"
import { fetchLeavePolicies, createLeavePolicy } from "@/lib/actions/leave.actions"

type LeavePolicy = {
  id: string
  name: string
  defaultDays: number
  accrualType: "WORKING_DAYS" | "CALENDAR_DAYS"
  isFlexible: boolean
  isActive: boolean
}

export default function CreateLeavePage() {
  const { toast } = useToast()
  const [policies, setPolicies] = useState<LeavePolicy[]>([])
  const [loadingPolicies, setLoadingPolicies] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [defaultDays, setDefaultDays] = useState(20)
  const [accrualType, setAccrualType] = useState<"WORKING_DAYS" | "CALENDAR_DAYS">("WORKING_DAYS")
  const [isFlexible, setIsFlexible] = useState(true)

  const loadPolicies = async () => {
    setLoadingPolicies(true)
    const res = await fetchLeavePolicies()
    if (res.success && res.policies) {
      setPolicies(res.policies as LeavePolicy[])
    }
    setLoadingPolicies(false)
  }

  useEffect(() => {
    loadPolicies()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast({ title: "Error", description: "Leave name is required", variant: "destructive" })
      return
    }

    if (defaultDays <= 0) {
      toast({ title: "Error", description: "Default days must be greater than 0", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    const res = await createLeavePolicy({
      name: name.trim(),
      defaultDays,
      accrualType,
      isFlexible
    })

    if (res.success) {
      toast({ title: "Success", description: "Leave policy created successfully" })
      // Reset form
      setName("")
      setDefaultDays(20)
      setAccrualType("WORKING_DAYS")
      setIsFlexible(true)
      // Refresh list
      loadPolicies()
    } else {
      toast({ title: "Error", description: res.error || "Failed to create policy", variant: "destructive" })
    }
    setIsSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] p-6 lg:p-10 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <header className="mb-10">
          <h2 className="text-[28px] font-bold text-[#111827] dark:text-gray-100 tracking-tight">Create Leave</h2>
          <p className="text-[#6B7280] dark:text-gray-400 text-[15px] mt-1">Define, configure, and manage various leave types.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel */}
          <div className="flex-1 max-w-[640px] bg-white dark:bg-zinc-900 rounded-[24px] p-8 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-zinc-800">
            <h3 className="text-xl font-semibold mb-8 flex items-center gap-3 text-[#111827] dark:text-gray-100">
              <span className="text-emerald-500"><FilePenLine className="w-6 h-6" /></span>
              Policy Configuration
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-[#111827] dark:text-gray-200" htmlFor="leave-name">Leave Name</label>
                <input
                  id="leave-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 bg-[#F9FAFB] dark:bg-zinc-800 border border-[#E5E7EB] dark:border-zinc-700 rounded-[12px] px-4 text-[#111827] dark:text-gray-100 placeholder:text-[#9CA3AF] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="e.g. Annual Vacation Leave"
                  type="text"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#111827] dark:text-gray-200" htmlFor="default-days">Default Annual Days</label>
                  <input
                    id="default-days"
                    value={defaultDays}
                    onChange={(e) => setDefaultDays(parseInt(e.target.value) || 0)}
                    className="w-full h-12 bg-[#F9FAFB] dark:bg-zinc-800 border border-[#E5E7EB] dark:border-zinc-700 rounded-[12px] px-4 text-[#111827] dark:text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    type="number"
                    min="1"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#111827] dark:text-gray-200">Accrual Type</label>
                  <Select value={accrualType} onValueChange={(val: any) => setAccrualType(val)} disabled={isSubmitting}>
                    <SelectTrigger className="w-full h-12 bg-[#F9FAFB] dark:bg-zinc-800 border border-[#E5E7EB] dark:border-zinc-700 rounded-[12px] px-4 text-[#111827] dark:text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
                      <SelectValue placeholder="Select Accrual Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[12px]">
                      <SelectItem value="WORKING_DAYS">Working Days Only</SelectItem>
                      <SelectItem value="CALENDAR_DAYS">Calendar Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-[#F6FBFA] dark:bg-emerald-950/20 p-5 rounded-[12px] border border-[#E8F5F2] dark:border-emerald-900/40 flex items-center justify-between">
                <div className="flex flex-col gap-1 pr-4">
                  <span className="text-[14px] font-semibold text-[#111827] dark:text-gray-100">Flexibility Toggle</span>
                  <span className="text-[13px] text-[#6B7280] dark:text-gray-400 leading-tight">Allow manual adjustment by managers for individual employees</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    checked={isFlexible} 
                    onChange={(e) => setIsFlexible(e.target.checked)}
                    disabled={isSubmitting}
                    className="sr-only peer" 
                    type="checkbox" 
                  />
                  <div className="w-12 h-[26px] bg-gray-200 dark:bg-zinc-700 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="w-full h-12 mt-8 flex items-center justify-center bg-[#10B981] hover:bg-[#059669] text-white font-medium text-[15px] rounded-[12px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</>
                ) : "Create Policy"}
              </button>
            </form>
          </div>

          {/* Right Panel */}
          <div className="flex-1 max-w-[540px] bg-white dark:bg-zinc-900 rounded-[24px] p-8 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-zinc-800 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-[#111827] dark:text-gray-100">
                <span className="text-emerald-500"><Shapes className="w-5 h-5" /></span>
                Active Policies
              </h3>
              <span className="bg-[#ECFDF5] dark:bg-emerald-500/10 text-[#10B981] text-[11px] font-bold px-2.5 py-1 rounded-[6px]">
                {loadingPolicies ? "..." : `${policies.filter(p => p.isActive).length} ACTIVE`}
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {loadingPolicies ? (
                <div className="py-12 flex flex-col items-center justify-center text-[#6B7280]">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
                  <p className="text-sm">Loading policies...</p>
                </div>
              ) : policies.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <Shapes className="w-6 h-6 text-gray-400" />
                  </div>
                  <h4 className="text-[15px] font-semibold text-[#111827] dark:text-gray-100">No Policies Created</h4>
                  <p className="text-[13px] text-[#6B7280] dark:text-gray-400 mt-1 max-w-[250px]">
                    Use the form on the left to create your first leave policy.
                  </p>
                </div>
              ) : (
                policies.map(policy => (
                  <div key={policy.id} className="flex items-center justify-between p-4 bg-[#F9FAFB] dark:bg-zinc-800/50 rounded-[16px] border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-[46px] w-[46px] bg-[#EEF2FF] dark:bg-[#EEF2FF]/10 text-[#6366F1] rounded-[12px] flex items-center justify-center">
                        <CalendarDays className="h-[22px] w-[22px]" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[15px] font-semibold text-[#111827] dark:text-gray-100">{policy.name}</p>
                        <p className="text-[13px] text-[#6B7280] dark:text-gray-400 font-medium mt-0.5">{policy.defaultDays} Days</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 shrink-0">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 flex items-center gap-3 p-4 rounded-[12px] border border-dashed border-[#A7F3D0] dark:border-emerald-800/60 bg-[#FAFBFA] dark:bg-emerald-950/10 shrink-0">
              <p className="text-[11px] font-bold text-[#10B981] whitespace-nowrap">PRO TIP</p>
              <p className="text-[13px] text-[#6B7280] dark:text-gray-400">
                Accrual types need to match regional labor laws.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
