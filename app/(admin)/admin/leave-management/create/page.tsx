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
  Loader2,
  Edit2,
  Power,
  Trash2,
  Info
} from "lucide-react"
import { 
  fetchLeavePolicies, 
  createLeavePolicy, 
  updateLeavePolicy, 
  toggleLeavePolicyStatus, 
  deleteLeavePolicy 
} from "@/lib/actions/leave.actions"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

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
  const [isActionLoading, setIsActionLoading] = useState(false)

  // Create form state
  const [name, setName] = useState("")
  const [defaultDays, setDefaultDays] = useState(20)
  const [accrualType, setAccrualType] = useState<"WORKING_DAYS" | "CALENDAR_DAYS">("WORKING_DAYS")
  const [isFlexible, setIsFlexible] = useState(true)

  // Edit/Delete state
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null)
  const [editName, setEditName] = useState("")
  const [editDefaultDays, setEditDefaultDays] = useState(0)
  const [editAccrualType, setEditAccrualType] = useState<"WORKING_DAYS" | "CALENDAR_DAYS">("WORKING_DAYS")
  const [editIsFlexible, setEditIsFlexible] = useState(true)
  const [deletingPolicyId, setDeletingPolicyId] = useState<string | null>(null)

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
      setName("")
      setDefaultDays(20)
      setAccrualType("WORKING_DAYS")
      setIsFlexible(true)
      loadPolicies()
    } else {
      toast({ title: "Error", description: res.error || "Failed to create policy", variant: "destructive" })
    }
    setIsSubmitting(false)
  }

  const handleUpdate = async () => {
    if (!editingPolicy) return
    if (!editName.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" })
      return
    }

    setIsActionLoading(true)
    const res = await updateLeavePolicy(editingPolicy.id, {
      name: editName.trim(),
      defaultDays: editDefaultDays,
      accrualType: editAccrualType,
      isFlexible: editIsFlexible
    })

    if (res.success) {
      toast({ title: "Success", description: "Leave policy updated" })
      setEditingPolicy(null)
      loadPolicies()
    } else {
      toast({ title: "Error", description: res.error || "Failed to update", variant: "destructive" })
    }
    setIsActionLoading(false)
  }

  const handleToggleStatus = async (id: string, current: boolean) => {
    setIsActionLoading(true)
    const res = await toggleLeavePolicyStatus(id, !current)
    if (res.success) {
      toast({ title: "Success", description: `Policy ${!current ? 'activated' : 'deactivated'}` })
      loadPolicies()
    } else {
      toast({ title: "Error", description: res.error || "Failed to update status", variant: "destructive" })
    }
    setIsActionLoading(false)
  }

  const handleDelete = async () => {
    if (!deletingPolicyId) return
    setIsActionLoading(true)
    const res = await deleteLeavePolicy(deletingPolicyId)
    if (res.success) {
      toast({ title: "Success", description: "Leave policy deleted" })
      setDeletingPolicyId(null)
      loadPolicies()
    } else {
      toast({ title: "Error", description: res.error || "Failed to delete", variant: "destructive" })
    }
    setIsActionLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] p-6 lg:p-10 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <header className="mb-10">
          <h2 className="text-[28px] font-bold text-[#111827] dark:text-gray-100 tracking-tight">Leave Types</h2>
          <p className="text-[#6B7280] dark:text-gray-400 text-[15px] mt-1">Define, configure, and manage various leave categories and their defaults.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel - Create */}
          <div className="flex-1 max-w-[640px] bg-white dark:bg-zinc-900 rounded-[24px] p-8 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-zinc-800 self-start">
            <h3 className="text-xl font-semibold mb-8 flex items-center gap-3 text-[#111827] dark:text-gray-100">
              <span className="text-emerald-500"><FilePenLine className="w-6 h-6" /></span>
              Add New Type
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
                  <label className="text-[14px] font-medium text-[#111827] dark:text-gray-200" htmlFor="default-days">Default Days/Year</label>
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
                  <label className="text-[14px] font-medium text-[#111827] dark:text-gray-200">Accrual Basis</label>
                  <Select value={accrualType} onValueChange={(val: "WORKING_DAYS" | "CALENDAR_DAYS") => setAccrualType(val)} disabled={isSubmitting}>
                    <SelectTrigger className="w-full h-12 bg-[#F9FAFB] dark:bg-zinc-800 border border-[#E5E7EB] dark:border-zinc-700 rounded-[12px] px-4 text-[#111827] dark:text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
                      <SelectValue placeholder="Basis" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[12px]">
                      <SelectItem value="WORKING_DAYS">Working Days</SelectItem>
                      <SelectItem value="CALENDAR_DAYS">Calendar Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-[#F6FBFA] dark:bg-emerald-950/20 p-5 rounded-[12px] border border-[#E8F5F2] dark:border-emerald-900/40 flex items-center justify-between">
                <div className="flex flex-col gap-1 pr-4">
                  <span className="text-[14px] font-semibold text-[#111827] dark:text-gray-100">Policy Flexibility</span>
                  <span className="text-[13px] text-[#6B7280] dark:text-gray-400 leading-tight">Allow managers to adjust totals for specific employees manually</span>
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
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                ) : "Create Leave Type"}
              </button>
            </form>
          </div>

          {/* Right Panel - List */}
          <div className="flex-1 max-w-[540px] bg-white dark:bg-zinc-900 rounded-[24px] p-8 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-zinc-800 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-[#111827] dark:text-gray-100">
                <span className="text-emerald-500"><Shapes className="w-5 h-5" /></span>
                Existing Types
              </h3>
              <span className="bg-[#ECFDF5] dark:bg-emerald-500/10 text-[#10B981] text-[11px] font-bold px-2.5 py-1 rounded-[6px] tracking-wider">
                {loadingPolicies ? "..." : `${policies.filter(p => p.isActive).length} ACTIVE`}
              </span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {loadingPolicies ? (
                <div className="py-24 flex flex-col items-center justify-center text-[#6B7280]">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
                  <p className="text-sm font-medium">Fetching types...</p>
                </div>
              ) : policies.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
                    <Shapes className="w-8 h-8 text-gray-300" />
                  </div>
                  <h4 className="text-base font-semibold text-[#111827] dark:text-gray-100">No types defined</h4>
                  <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-2 max-w-[280px] mx-auto leading-relaxed">
                    Once you define a leave type on the left, it will appear here for management.
                  </p>
                </div>
              ) : (
                policies.map(policy => (
                  <div 
                    key={policy.id} 
                    className={cn(
                      "group flex items-center justify-between p-4 rounded-[20px] border transition-all duration-200",
                      policy.isActive 
                        ? "bg-[#F9FAFB] dark:bg-zinc-800/40 border-transparent hover:border-gray-200 dark:hover:border-zinc-700" 
                        : "bg-gray-50 dark:bg-zinc-900/50 border-transparent opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-[14px] flex items-center justify-center transition-colors",
                        policy.isActive ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600" : "bg-gray-200 dark:bg-zinc-800 text-gray-500"
                      )}>
                        <CalendarDays className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-bold text-[#111827] dark:text-gray-100 tracking-tight">{policy.name}</p>
                          {!policy.isActive && (
                             <span className="text-[9px] font-black uppercase tracking-tighter bg-gray-200 dark:bg-zinc-700 text-gray-500 px-1.5 py-0.5 rounded">Inactive</span>
                          )}
                        </div>
                        <p className="text-[13px] text-[#6B7280] dark:text-gray-400 font-medium mt-0.5">
                          {policy.defaultDays} {policy.accrualType === "WORKING_DAYS" ? "Working Days" : "Calendar Days"}
                        </p>
                      </div>
                    </div>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-gray-400 hover:text-[#111827] dark:hover:text-gray-200 p-2 shrink-0 rounded-full hover:bg-white dark:hover:bg-zinc-700 transition-all">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[180px] p-1.5 rounded-xl border-gray-100 dark:border-zinc-800 shadow-xl">
                        <div className="flex flex-col gap-0.5">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-3 h-9 text-[13px] font-medium rounded-lg"
                            onClick={() => {
                              setEditingPolicy(policy)
                              setEditName(policy.name)
                              setEditDefaultDays(policy.defaultDays)
                              setEditAccrualType(policy.accrualType)
                              setEditIsFlexible(policy.isFlexible)
                            }}
                          >
                            <Edit2 className="h-4 w-4 text-gray-500" />
                            Edit details
                          </Button>
                          <Button 
                            variant="ghost" 
                            className={cn(
                              "w-full justify-start gap-3 h-9 text-[13px] font-medium rounded-lg",
                              policy.isActive ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                            )}
                            onClick={() => handleToggleStatus(policy.id, policy.isActive)}
                            disabled={isActionLoading}
                          >
                            <Power className="h-4 w-4" />
                            {policy.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1 mx-1" />
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-3 h-9 text-[13px] font-medium rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                            onClick={() => setDeletingPolicyId(policy.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 flex items-start gap-3 p-4 rounded-[16px] border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 shrink-0">
              <span className="mt-0.5 text-blue-500"><Info className="h-4 w-4" /></span>
              <p className="text-[12px] text-[#4B5563] dark:text-gray-400 leading-relaxed font-medium">
                Changes to policies will reflect in new leave balance calculations. Existing requests remain unaffected.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPolicy} onOpenChange={(open) => !open && setEditingPolicy(null)}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-[24px]">
          <DialogHeader className="px-8 pt-8 pb-4">
            <DialogTitle className="text-xl font-bold tracking-tight">Edit Leave Type</DialogTitle>
            <DialogDescription className="text-sm">Update configuration for {editingPolicy?.name}.</DialogDescription>
          </DialogHeader>
          <div className="px-8 py-4 space-y-6">
            <div className="space-y-2">
              <Label>Policy Name</Label>
              <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-11 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  type="text"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Days</Label>
                <input
                    value={editDefaultDays}
                    onChange={(e) => setEditDefaultDays(parseInt(e.target.value) || 0)}
                    className="w-full h-11 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    type="number"
                />
              </div>
              <div className="space-y-2">
                <Label>Accrual Type</Label>
                <Select value={editAccrualType} onValueChange={(val: "WORKING_DAYS" | "CALENDAR_DAYS") => setEditAccrualType(val)}>
                  <SelectTrigger className="w-full h-11 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="WORKING_DAYS">Working Days</SelectItem>
                    <SelectItem value="CALENDAR_DAYS">Calendar Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700">
               <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold">Policy Flexibility</span>
                  <p className="text-[12px] text-muted-foreground leading-tight">Allow exceptions by managers</p>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    checked={editIsFlexible} 
                    onChange={(e) => setEditIsFlexible(e.target.checked)}
                    className="sr-only peer" 
                    type="checkbox" 
                  />
                  <div className="w-11 h-[24px] bg-gray-200 dark:bg-zinc-700 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
            </div>
          </div>
          <DialogFooter className="bg-gray-50 dark:bg-zinc-900/50 px-8 py-6 gap-3">
             <Button variant="outline" onClick={() => setEditingPolicy(null)} className="rounded-xl h-11 px-6">Cancel</Button>
             <Button 
                onClick={handleUpdate} 
                disabled={isActionLoading || !editName.trim()} 
                className="rounded-xl h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
             >
               {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
               Save Changes
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingPolicyId} onOpenChange={(open) => !open && setDeletingPolicyId(null)}>
        <AlertDialogContent className="rounded-[24px] overflow-hidden p-0 border-none shadow-2xl">
          <div className="p-8">
            <AlertDialogHeader>
              <div className="h-12 w-12 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mb-6">
                <Trash2 className="h-6 w-6" />
              </div>
              <AlertDialogTitle className="text-xl font-bold tracking-tight">Delete Leave Type?</AlertDialogTitle>
              <AlertDialogDescription className="text-[15px] leading-relaxed mt-2">
                This action cannot be undone. You will only be able to delete this type if it is not linked to any existing leave requests. 
                Consider deactivating it instead to preserve history.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="bg-gray-50 dark:bg-zinc-900/50 px-8 py-6 gap-3 border-t dark:border-zinc-800">
            <AlertDialogCancel className="rounded-xl h-11 border-gray-200 dark:border-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isActionLoading}
              className="rounded-xl h-11 bg-red-600 hover:bg-red-700 text-white border-none px-6"
            >
              {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
