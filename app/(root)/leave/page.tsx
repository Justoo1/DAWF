"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar as CalendarIcon,
  FileText,
  ArrowLeft,
  Loader2,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { fetchLeavePolicies, fetchUserLeaveBalances, fetchLeaveRequests, submitLeaveRequest } from '@/lib/actions/leave.actions'
import { useToast } from '@/hooks/use-toast'
import { authClient } from '@/lib/auth-client'
import { format } from 'date-fns'

interface LeavePolicy {
    id: string;
    name: string;
    isActive: boolean;
    defaultDays: number;
}

interface LeaveBalance {
    id: string;
    policyId: string;
    userId: string;
    year: number;
    daysAllocated: number;
    policy: LeavePolicy;
}

interface LeaveRequest {
    id: string;
    userId: string;
    policyId: string;
    startDate: string | Date;
    endDate: string | Date;
    days: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    reason: string | null;
    policy: LeavePolicy;
    managerName?: string;
}

const LeaveRequestPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { data: session } = authClient.useSession()
    const { toast } = useToast()

    const [policies, setPolicies] = useState<LeavePolicy[]>([])
    const [balances, setBalances] = useState<LeaveBalance[]>([])
    const [requests, setRequests] = useState<LeaveRequest[]>([])
    
    // Form state
    const [selectedPolicy, setSelectedPolicy] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [reason, setReason] = useState("")
    const [maxDays, setMaxDays] = useState<number | null>(null)

    // Check if form is valid
    const isFormValid = selectedPolicy && startDate && endDate

    // Calculate working days between two dates (excluding weekends)
    // TODO: Add public holiday exclusion when holiday database/table is available
    const calculateWorkingDays = (start: Date, end: Date): number => {
        let count = 0
        let current = new Date(start)
        const endDate = new Date(end)

        while (current <= endDate) {
            const dayOfWeek = current.getDay()
            // 0 = Sunday, 6 = Saturday
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++
            }
            current.setDate(current.getDate() + 1)
        }

        return count
    }

    // Calculate duration based on start and end dates
    const calculatedDays = startDate && endDate ? calculateWorkingDays(new Date(startDate), new Date(endDate)) : 0

    useEffect(() => {
        const loadData = async () => {
            if (!session?.user?.id) return
            
            setIsLoading(true)
            const [policiesRes, balancesRes, requestsRes] = await Promise.all([
                fetchLeavePolicies(),
                fetchUserLeaveBalances(session.user.id, new Date().getFullYear()),
                fetchLeaveRequests(session.user.id)
            ])

            if (policiesRes.success) setPolicies(policiesRes.policies || [])
            if (balancesRes.success) setBalances(balancesRes.balances || [])
            if (requestsRes.success) setRequests(requestsRes.requests || [])
            
            setIsLoading(false)
        }

        loadData()
    }, [session?.user?.id])

    // Update maxDays when policy changes
    useEffect(() => {
        if (selectedPolicy) {
            const policy = policies.find((p: LeavePolicy) => p.id === selectedPolicy)
            const balance = balances.find((b: LeaveBalance) => b.policyId === selectedPolicy)

            // Calculate approved days used
            const approvedRequests = requests.filter((r: LeaveRequest) =>
                r.policyId === selectedPolicy && r.status === 'APPROVED'
            )
            const approvedDaysUsed = approvedRequests.reduce((sum: number, r: LeaveRequest) => sum + r.days, 0)

            // Use balance allocation if exists, otherwise use policy defaultDays
            const totalDays = balance ? balance.daysAllocated : (policy?.defaultDays || 0)
            const remainingDays = totalDays - approvedDaysUsed

            setMaxDays(remainingDays > 0 ? remainingDays : 0)
        } else {
            setMaxDays(null)
        }
    }, [selectedPolicy, policies, balances, requests])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const daysNum = calculatedDays
        if (!selectedPolicy || !startDate || !endDate || !session?.user?.id || daysNum <= 0) {
            toast({ title: "Validation Error", description: "Please fill all required fields.", variant: "destructive" })
            return
        }

        // Validate days against max available
        if (maxDays !== null && daysNum > maxDays) {
            toast({
                title: "Validation Error",
                description: `You can only request up to ${maxDays} days for this leave type.`,
                variant: "destructive"
            })
            return
        }

        setIsSubmitting(true)
        const res = await submitLeaveRequest({
            userId: session.user.id,
            policyId: selectedPolicy,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            days: daysNum,
            reason
        })

        if (res.success) {
            toast({ title: "Request Submitted", description: "Your leave request has been sent to your manager for approval." })
            // Reset form
            setSelectedPolicy("")
            setStartDate("")
            setEndDate("")
            setReason("")
            setMaxDays(null)
            // Close modal
            setIsModalOpen(false)
            
            // Refresh requests
            const requestsRes = await fetchLeaveRequests(session.user.id)
            if (requestsRes.success) setRequests(requestsRes.requests || [])
        } else {
            toast({ title: "Error", description: res.error || "Failed to submit request", variant: "destructive" })
        }
        setIsSubmitting(false)
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-8 dark:bg-zinc-950 dark:text-zinc-100">
            {/* Minimal Header */}
            <header className="px-6 py-5 md:px-12 lg:px-20 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-zinc-200 dark:bg-zinc-950/80 dark:border-zinc-800">
                <div className="space-y-1">
                    <Link href="/dawf" className="flex items-center gap-2 text-zinc-600 hover:text-emerald-600 dark:text-zinc-500 dark:hover:text-emerald-500 transition-all group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">Back to Dashboard</span>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">
                        Leave Management
                    </h1>
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-11 bg-[#10A074] hover:bg-[#0d8a62] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-lg shadow-lg hover:translate-y-[-1px] transition-all active:scale-[0.98] dark:shadow-emerald-900/20">
                            <FileText className="w-4 h-4 mr-2" /> Request Leave
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase italic">Request Leave</DialogTitle>
                            <DialogDescription>
                                Submit a new leave request for approval
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 dark:text-zinc-500">
                                    Policy Category <span className="text-red-500">*</span>
                                </Label>
                                <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
                                    <SelectTrigger className="h-11 rounded-lg bg-zinc-50 border-zinc-200 text-zinc-900 font-bold hover:bg-zinc-100 dark:bg-zinc-950/50 dark:border-white/[0.05] dark:text-zinc-300 dark:hover:bg-zinc-950 transition-colors">
                                        <SelectValue placeholder="Select Policy" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-zinc-200 text-zinc-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300">
                                        {policies.filter((p) => p.isActive).map((p) => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 dark:text-zinc-500">
                                        Start Date <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input 
                                            type="date" 
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="h-11 pl-10 rounded-lg bg-zinc-50 border-zinc-200 text-zinc-900 font-bold focus:bg-zinc-100 dark:bg-zinc-950/50 dark:border-white/[0.05] dark:text-zinc-300 dark:focus:bg-zinc-950"
                                        />
                                        <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-zinc-600" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 dark:text-zinc-500">
                                        End Date <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input 
                                            type="date" 
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="h-11 pl-10 rounded-lg bg-zinc-50 border-zinc-200 text-zinc-900 font-bold focus:bg-zinc-100 dark:bg-zinc-950/50 dark:border-white/[0.05] dark:text-zinc-300 dark:focus:bg-zinc-950"
                                        />
                                        <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-zinc-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Calculated Duration Display */}
                            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 dark:bg-zinc-950/50 dark:border-zinc-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] dark:text-zinc-600">Calculated Duration</p>
                                        <p className="text-2xl font-black text-zinc-900 mt-1 dark:text-white">
                                            {calculatedDays} <span className="text-sm font-bold text-zinc-500">working days</span>
                                        </p>
                                    </div>
                                    {maxDays !== null && (
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] dark:text-zinc-600">Available</p>
                                            <p className={`text-2xl font-black mt-1 ${calculatedDays > maxDays ? 'text-red-500' : 'text-emerald-600'}`}>
                                                {maxDays} <span className="text-sm font-bold text-zinc-500">days</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[9px] text-zinc-500 mt-2 dark:text-zinc-600">
                                    Weekends are excluded from the calculation. Public holidays will be factored in when configured.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 dark:text-zinc-500">Reason (Optional)</Label>
                                <Textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Briefly state reason for leave request..."
                                    className="min-h-[80px] rounded-lg bg-zinc-50 border-zinc-200 text-zinc-900 font-bold focus:bg-zinc-100 dark:bg-zinc-950/50 dark:border-white/[0.05] dark:text-zinc-300 dark:focus:bg-zinc-950 resize-none"
                                />
                            </div>

                            <div className="pt-2 flex flex-col gap-4">
                                <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-500/10">
                                    <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0 dark:text-emerald-500" />
                                    <p className="text-[9px] font-bold text-emerald-700 leading-relaxed uppercase tracking-[0.1em] dark:text-emerald-500/80">
                                        This request will be routed to your <span className="text-emerald-900 dark:text-white">Manager</span> for approval. 
                                        You&apos;ll receive status updates via notifications.
                                    </p>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !isFormValid}
                                    className="w-full h-11 bg-[#10A074] hover:bg-[#0d8a62] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-lg shadow-lg hover:translate-y-[-1px] transition-all active:scale-[0.98] dark:shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
                                    ) : "Submit Request"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>

            <main className="mx-auto w-full max-w-[1600px] px-6 py-6 md:px-12 lg:px-20">
                <div className="grid lg:grid-cols-[1fr,380px] gap-8 lg:gap-10">
                    
                    {/* Primary Flow */}
                    <div className="space-y-8">
                        {/* Section Header */}
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-[1px] bg-emerald-400 dark:bg-emerald-500/30" />
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-600 dark:text-emerald-500">Leave Balances</h2>
                        </div>

                        {/* Balances: Leave Type Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {policies.filter((p: LeavePolicy) => p.isActive).length > 0 ? policies.filter((p: LeavePolicy) => p.isActive).map((policy: LeavePolicy) => {
                                const balance = balances.find((b: LeaveBalance) => b.policyId === policy.id)
                                const hasBalance = balance !== undefined
                                
                                // Calculate approved days used for this policy
                                const approvedRequests = requests.filter((r: LeaveRequest) => 
                                    r.policyId === policy.id && r.status === 'APPROVED'
                                )
                                const approvedDaysUsed = approvedRequests.reduce((sum: number, r: LeaveRequest) => sum + r.days, 0)
                                
                                // Use policy defaultDays if no balance, otherwise use balance allocation
                                const totalDays = hasBalance ? balance.daysAllocated : policy.defaultDays || 0
                                const daysUsed = hasBalance ? approvedDaysUsed : approvedDaysUsed
                                const daysRemaining = totalDays - daysUsed

                                return (
                                    <div key={policy.id} className="group relative overflow-hidden bg-white border border-zinc-200 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 dark:bg-zinc-900/30 dark:border-white/[0.05] dark:hover:border-emerald-500/30 dark:hover:shadow-none">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 dark:from-emerald-500/20" />
                                        <div className="relative">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`p-3 rounded-xl ${hasBalance ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                                                    <FileText className={`w-5 h-5 ${hasBalance ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
                                                </div>
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider dark:text-zinc-500">
                                                    {new Date().getFullYear()}
                                                </span>
                                            </div>
                                            <h4 className="text-base font-bold text-zinc-900 dark:text-white leading-tight mb-4 line-clamp-2">
                                                {policy.name}
                                            </h4>
                                            {totalDays > 0 ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                                                            {daysRemaining}
                                                        </span>
                                                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                            Days Left
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-zinc-500 dark:text-zinc-400">
                                                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{daysUsed}</span> used
                                                        </span>
                                                        <span className="text-zinc-400 dark:text-zinc-500">
                                                            of {totalDays} total
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out" 
                                                            style={{ width: `${totalDays > 0 ? (daysUsed / totalDays) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-black text-zinc-400 dark:text-zinc-600 tracking-tight">
                                                            --
                                                        </span>
                                                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                                            No Allocation
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                                        No days allocated for this policy
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="col-span-full p-12 border border-dashed border-zinc-300 rounded-2xl text-center bg-white dark:border-zinc-800/50 dark:bg-transparent">
                                    <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-4 dark:text-zinc-600" />
                                    <p className="text-sm font-bold text-zinc-600 mb-2 dark:text-zinc-400">No Leave Balances Found</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                                        Leave balances need to be assigned by your administrator. Please contact your admin if you believe this is an error.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Secondary: My Requests */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-600 dark:text-zinc-500">My Requests</h2>
                            <div className="flex-1 h-[1px] bg-zinc-200 dark:bg-zinc-800/30" />
                        </div>

                        <div className="space-y-3">
                            {requests.length > 0 ? requests.map((req: LeaveRequest) => (
                                <div key={req.id} className="p-4 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-all group shadow-sm dark:bg-zinc-900/20 dark:border-white/[0.05] dark:hover:bg-zinc-900/40 dark:shadow-none">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-2 py-0.5 rounded-full ${
                                                req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500' :
                                                req.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-500' :
                                                'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-500'
                                            }`}>
                                                {req.status}
                                            </span>
                                            <span className="text-[8px] font-black text-zinc-400 tracking-[0.2em] uppercase dark:text-zinc-700">
                                                #{req.id.slice(-4)}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider dark:text-white">{req.policy.name}</h4>
                                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-loose dark:text-zinc-600">
                                                {format(new Date(req.startDate), 'MMM dd')} → {format(new Date(req.endDate), 'MMM dd')}
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between dark:border-white/[0.05]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-zinc-900 tracking-widest dark:text-white">{req.days}d</span>
                                            </div>
                                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest italic dark:text-zinc-600">
                                                via {req.managerName?.split(' ')[0] || "System"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 border border-dashed border-zinc-300 rounded-lg flex flex-col items-center gap-3 bg-white opacity-50 dark:border-zinc-900 dark:bg-transparent dark:opacity-30">
                                    <CalendarIcon className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] dark:text-zinc-600">No Leave Requests Yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default LeaveRequestPage
