"use client"

import React, { useState, useEffect, useMemo } from 'react'
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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Calendar as CalendarIcon,
  FileText,
  ArrowLeft,
  Loader2,
  Info,
  Pencil,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import {
  fetchLeavePolicies,
  fetchUserLeaveBalances,
  fetchLeaveRequests,
  fetchPublicHolidays,
  submitLeaveRequest,
  updatePendingLeaveRequest,
  deletePendingLeaveRequest,
} from '@/lib/actions/leave.actions'
import { countLeaveWorkingDays, type HolidayRow } from '@/lib/leave-working-days'
import { useToast } from '@/hooks/use-toast'
import { authClient } from '@/lib/auth-client'
import { format } from 'date-fns'

interface LeavePolicy {
    id: string;
    name: string;
    isActive: boolean;
    defaultDays: number;
    isUnlimited: boolean;
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

function isLeaveRequestMutable(status: LeaveRequest['status']) {
    return status === 'PENDING'
}

function getLeaveStatusLabel(status: LeaveRequest['status']): string {
    return status === 'REJECTED' ? 'DECLINED' : status
}

function hasWeekendInRange(startIso: string, endIso: string): boolean {
    if (!startIso || !endIso) return false
    const cursor = new Date(startIso)
    const end = new Date(endIso)
    while (cursor <= end) {
        const day = cursor.getDay()
        if (day === 0 || day === 6) return true
        cursor.setDate(cursor.getDate() + 1)
    }
    return false
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
    const [publicHolidays, setPublicHolidays] = useState<HolidayRow[]>([])
    
    // Form state
    const [selectedPolicy, setSelectedPolicy] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [reason, setReason] = useState("")
    const [maxDays, setMaxDays] = useState<number | null>(null)

    const [editOpen, setEditOpen] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [editPolicy, setEditPolicy] = useState("")
    const [editStart, setEditStart] = useState("")
    const [editEnd, setEditEnd] = useState("")
    const [editReason, setEditReason] = useState("")
    const [editMaxDays, setEditMaxDays] = useState<number | null>(null)
    const [isEditSubmitting, setIsEditSubmitting] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<LeaveRequest | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Check if form is valid
    const isFormValid = selectedPolicy && startDate && endDate

    // Working days Mon–Fri (UTC, aligned with date inputs), excluding configured public holidays
    const calculateWorkingDays = (start: Date, end: Date): number =>
        countLeaveWorkingDays(start, end, publicHolidays)

    // Calculate duration based on start and end dates
    const calculatedDays = startDate && endDate ? calculateWorkingDays(new Date(startDate), new Date(endDate)) : 0
    const editCalculatedDays =
        editStart && editEnd ? calculateWorkingDays(new Date(editStart), new Date(editEnd)) : 0
    const todayIso = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
    const selectedPolicyMeta = policies.find((p: LeavePolicy) => p.id === selectedPolicy)
    const editPolicyMeta = policies.find((p: LeavePolicy) => p.id === editPolicy)

    useEffect(() => {
        const loadData = async () => {
            if (!session?.user?.id) return
            
            setIsLoading(true)
            const [policiesRes, balancesRes, requestsRes, holidaysRes] = await Promise.all([
                fetchLeavePolicies(),
                fetchUserLeaveBalances(session.user.id, new Date().getFullYear()),
                fetchLeaveRequests(session.user.id, { scope: "self" }),
                fetchPublicHolidays(),
            ])

            if (policiesRes.success) setPolicies(policiesRes.policies || [])
            if (balancesRes.success) setBalances(balancesRes.balances || [])
            if (requestsRes.success) setRequests(requestsRes.requests || [])
            if (holidaysRes.success && holidaysRes.holidays) {
                setPublicHolidays(
                    holidaysRes.holidays.map((h) => ({
                        date: new Date(h.date),
                        isRecurring: h.isRecurring,
                    }))
                )
            }
            
            setIsLoading(false)
        }

        loadData()
    }, [session?.user?.id])

    // Update maxDays when policy changes
    useEffect(() => {
        if (selectedPolicy) {
            const policy = policies.find((p: LeavePolicy) => p.id === selectedPolicy)
            if (policy?.isUnlimited) {
                setMaxDays(null)
                return
            }
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

    useEffect(() => {
        if (!editPolicy) {
            setEditMaxDays(null)
            return
        }
        const policy = policies.find((p: LeavePolicy) => p.id === editPolicy)
        if (policy?.isUnlimited) {
            setEditMaxDays(null)
            return
        }
        const balance = balances.find((b: LeaveBalance) => b.policyId === editPolicy)
        const approvedRequests = requests.filter(
            (r: LeaveRequest) => r.policyId === editPolicy && r.status === 'APPROVED'
        )
        const approvedDaysUsed = approvedRequests.reduce(
            (sum: number, r: LeaveRequest) => sum + r.days,
            0
        )
        const totalDays = balance ? balance.daysAllocated : policy?.defaultDays || 0
        const remainingDays = totalDays - approvedDaysUsed
        setEditMaxDays(remainingDays > 0 ? remainingDays : 0)
    }, [editPolicy, policies, balances, requests])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const daysNum = calculatedDays
        if (!selectedPolicy || !startDate || !endDate || !session?.user?.id || daysNum <= 0) {
            toast({ title: "Validation Error", description: "Please fill all required fields.", variant: "destructive" })
            return
        }
        if (hasWeekendInRange(startDate, endDate)) {
            toast({
                title: "Validation Error",
                description: "Leave request range cannot include weekends. Please select weekdays only.",
                variant: "destructive",
            })
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
            const requestsRes = await fetchLeaveRequests(session.user.id, { scope: "self" })
            if (requestsRes.success) setRequests(requestsRes.requests || [])
        } else {
            toast({ title: "Error", description: res.error || "Failed to submit request", variant: "destructive" })
        }
        setIsSubmitting(false)
    }

    const openEdit = (req: LeaveRequest) => {
        if (!isLeaveRequestMutable(req.status)) return
        setEditId(req.id)
        setEditPolicy(req.policyId)
        setEditStart(format(new Date(req.startDate), 'yyyy-MM-dd'))
        setEditEnd(format(new Date(req.endDate), 'yyyy-MM-dd'))
        setEditReason(req.reason || '')
        setEditOpen(true)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const daysNum = editCalculatedDays
        if (!editId || !editPolicy || !editStart || !editEnd || !session?.user?.id || daysNum <= 0) {
            toast({
                title: 'Validation Error',
                description: 'Please fill all required fields.',
                variant: 'destructive',
            })
            return
        }
        if (hasWeekendInRange(editStart, editEnd)) {
            toast({
                title: 'Validation Error',
                description: 'Leave request range cannot include weekends. Please select weekdays only.',
                variant: 'destructive',
            })
            return
        }
        if (editMaxDays !== null && daysNum > editMaxDays) {
            toast({
                title: 'Validation Error',
                description: `You can only request up to ${editMaxDays} days for this leave type.`,
                variant: 'destructive',
            })
            return
        }
        setIsEditSubmitting(true)
        const res = await updatePendingLeaveRequest(editId, {
            policyId: editPolicy,
            startDate: new Date(editStart),
            endDate: new Date(editEnd),
            days: daysNum,
            reason: editReason,
        })
        if (res.success) {
            toast({ title: 'Request updated', description: 'Your pending leave request has been updated.' })
            setEditOpen(false)
            setEditId(null)
            const requestsRes = await fetchLeaveRequests(session.user.id, { scope: "self" })
            if (requestsRes.success) setRequests(requestsRes.requests || [])
        } else {
            toast({
                title: 'Could not update',
                description: res.error || 'Failed to update request',
                variant: 'destructive',
            })
        }
        setIsEditSubmitting(false)
    }

    const handleConfirmDelete = async () => {
        if (!deleteTarget || !session?.user?.id) return
        setIsDeleting(true)
        const res = await deletePendingLeaveRequest(deleteTarget.id)
        if (res.success) {
            toast({ title: 'Request withdrawn', description: 'Your pending leave request has been removed.' })
            setDeleteTarget(null)
            const requestsRes = await fetchLeaveRequests(session.user.id, { scope: "self" })
            if (requestsRes.success) setRequests(requestsRes.requests || [])
        } else {
            toast({
                title: 'Could not remove',
                description: res.error || 'Failed to delete request',
                variant: 'destructive',
            })
        }
        setIsDeleting(false)
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-50 text-foreground pb-10 dark:bg-zinc-950 dark:text-zinc-100">
            {/* Minimal Header */}
            <header className="px-6 py-5 md:px-12 lg:px-20 flex items-center justify-between sticky top-0 z-40 border-b border-zinc-200/90 bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-950/80 dark:shadow-none">
                <div className="space-y-1.5">
                    <Link href="/home" className="flex items-center gap-2 text-zinc-600 hover:text-emerald-700 dark:text-zinc-500 dark:hover:text-emerald-500 transition-all group">
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
                    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase italic">Request Leave</DialogTitle>
                            <DialogDescription>
                                Submit a new leave request for approval
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="leave-type"
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 dark:text-zinc-500"
                                >
                                    Leave Type <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={selectedPolicy || undefined}
                                    onValueChange={setSelectedPolicy}
                                >
                                    <SelectTrigger
                                        id="leave-type"
                                        className="h-11 rounded-lg bg-zinc-50 border-zinc-200 text-zinc-900 font-bold hover:bg-zinc-100 dark:bg-zinc-950/50 dark:border-white/[0.05] dark:text-zinc-300 dark:hover:bg-zinc-950 transition-colors"
                                    >
                                        <SelectValue placeholder="Select leave type" />
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
                                            min={todayIso}
                                            onChange={(e) => {
                                                const nextStart = e.target.value
                                                setStartDate(nextStart)
                                                if (endDate && nextStart && endDate < nextStart) {
                                                    setEndDate(nextStart)
                                                }
                                            }}
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
                                            min={startDate || todayIso}
                                            disabled={!startDate}
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
                                    {selectedPolicyMeta?.isUnlimited ? (
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] dark:text-zinc-600">Available</p>
                                            <p className="text-2xl font-black mt-1 text-emerald-600">
                                                Unlimited
                                            </p>
                                        </div>
                                    ) : maxDays !== null && (
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] dark:text-zinc-600">Available</p>
                                            <p className={`text-2xl font-black mt-1 ${calculatedDays > maxDays ? 'text-red-500' : 'text-emerald-600'}`}>
                                                {maxDays} <span className="text-sm font-bold text-zinc-500">days</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[9px] text-zinc-500 mt-2 dark:text-zinc-600">
                                    Weekends and public holidays from the company calendar are excluded. The same rules apply when your request is saved.
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

                <Dialog
                    open={editOpen}
                    onOpenChange={(open) => {
                        setEditOpen(open)
                        if (!open) setEditId(null)
                    }}
                >
                    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase italic">Edit leave request</DialogTitle>
                            <DialogDescription>
                                You can only update a request while it is still pending. After approval or decline, it
                                cannot be changed here.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-5 mt-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="edit-leave-type"
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 dark:text-zinc-500"
                                >
                                    Leave Type <span className="text-red-500">*</span>
                                </Label>
                                <Select value={editPolicy || undefined} onValueChange={setEditPolicy}>
                                    <SelectTrigger
                                        id="edit-leave-type"
                                        className="h-11 rounded-lg bg-zinc-50 border-zinc-200 text-zinc-900 font-bold hover:bg-zinc-100 dark:bg-zinc-950/50 dark:border-white/[0.05] dark:text-zinc-300 dark:hover:bg-zinc-950 transition-colors"
                                    >
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-zinc-200 text-zinc-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300">
                                        {policies.filter((p) => p.isActive).map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name}
                                            </SelectItem>
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
                                            value={editStart}
                                            min={todayIso}
                                            onChange={(e) => {
                                                const nextStart = e.target.value
                                                setEditStart(nextStart)
                                                if (editEnd && nextStart && editEnd < nextStart) {
                                                    setEditEnd(nextStart)
                                                }
                                            }}
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
                                            value={editEnd}
                                            min={editStart || todayIso}
                                            disabled={!editStart}
                                            onChange={(e) => setEditEnd(e.target.value)}
                                            className="h-11 pl-10 rounded-lg bg-zinc-50 border-zinc-200 text-zinc-900 font-bold focus:bg-zinc-100 dark:bg-zinc-950/50 dark:border-white/[0.05] dark:text-zinc-300 dark:focus:bg-zinc-950"
                                        />
                                        <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-zinc-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 dark:bg-zinc-950/50 dark:border-zinc-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] dark:text-zinc-600">
                                            Calculated Duration
                                        </p>
                                        <p className="text-2xl font-black text-zinc-900 mt-1 dark:text-white">
                                            {editCalculatedDays}{' '}
                                            <span className="text-sm font-bold text-zinc-500">working days</span>
                                        </p>
                                    </div>
                                    {editPolicyMeta?.isUnlimited ? (
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] dark:text-zinc-600">
                                                Available
                                            </p>
                                            <p className="text-2xl font-black mt-1 text-emerald-600">
                                                Unlimited
                                            </p>
                                        </div>
                                    ) : editMaxDays !== null && (
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] dark:text-zinc-600">
                                                Available
                                            </p>
                                            <p
                                                className={`text-2xl font-black mt-1 ${editCalculatedDays > editMaxDays ? 'text-red-500' : 'text-emerald-600'}`}
                                            >
                                                {editMaxDays}{' '}
                                                <span className="text-sm font-bold text-zinc-500">days</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 dark:text-zinc-500">
                                    Reason (Optional)
                                </Label>
                                <Textarea
                                    value={editReason}
                                    onChange={(e) => setEditReason(e.target.value)}
                                    placeholder="Briefly state reason for leave request..."
                                    className="min-h-[80px] rounded-lg bg-zinc-50 border-zinc-200 text-zinc-900 font-bold focus:bg-zinc-100 dark:bg-zinc-950/50 dark:border-white/[0.05] dark:text-zinc-300 dark:focus:bg-zinc-950 resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={
                                    isEditSubmitting || !editPolicy || !editStart || !editEnd
                                }
                                className="w-full h-11 bg-[#10A074] hover:bg-[#0d8a62] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-lg shadow-lg hover:translate-y-[-1px] transition-all active:scale-[0.98] dark:shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isEditSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                                    </>
                                ) : (
                                    'Save changes'
                                )}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>

            <main className="mx-auto w-full max-w-[1600px] px-6 py-8 md:px-12 lg:px-20">
                <div className="space-y-10">
                    
                    {/* Leave Balances */}
                    <div className="space-y-7">
                        {/* Section Header */}
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="h-1 w-10 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-500/80" aria-hidden />
                            <h2 className="text-xs font-black uppercase tracking-[0.32em] text-zinc-900 dark:text-emerald-500">
                                Leave balances
                            </h2>
                            <div className="flex-1 h-px min-w-[2rem] bg-zinc-200 dark:bg-zinc-800/60" />
                        </div>

                        {/* Balances: leave type cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
                                    <div
                                        key={policy.id}
                                        className="group rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-emerald-500/30 hover:shadow-sm dark:bg-card/50"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`p-2.5 rounded-lg ${hasBalance ? 'bg-emerald-500/10 dark:bg-emerald-500/15' : 'bg-muted'}`}>
                                                <FileText className={`w-4 h-4 ${hasBalance ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
                                            </div>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                                {new Date().getFullYear()}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-semibold text-foreground mb-3">
                                            {policy.name}
                                        </h4>
                                        {policy.isUnlimited ? (
                                            <div>
                                                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                                    Unlimited
                                                </span>
                                            </div>
                                        ) : totalDays > 0 ? (
                                            <div className="space-y-2">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-bold text-foreground">
                                                        {daysRemaining}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-muted-foreground uppercase">
                                                        Days left
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>
                                                        <span className="font-semibold text-foreground">{daysUsed}</span> used
                                                    </span>
                                                    <span>of {totalDays} total</span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-muted">
                                                    <div 
                                                        className="h-full rounded-full bg-emerald-500 transition-all duration-500" 
                                                        style={{ width: `${totalDays > 0 ? (daysUsed / totalDays) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <span className="text-sm font-semibold text-muted-foreground">
                                                    No Allocation
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )
                            }) : (
                                <div className="col-span-full rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                                    <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-sm font-semibold text-muted-foreground mb-1">No Leave Balances Found</p>
                                    <p className="text-xs text-muted-foreground">
                                        Leave balances need to be assigned by your administrator.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* My Requests */}
                    <div className="space-y-6 pt-2">
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="h-1 w-10 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-500/80" aria-hidden />
                            <h2 className="text-xs font-black uppercase tracking-[0.32em] text-zinc-900 dark:text-emerald-500">
                                My requests
                            </h2>
                            <div className="flex-1 h-px min-w-[2rem] bg-zinc-200 dark:bg-zinc-800/60" />
                        </div>

                        <div className="space-y-3">
                            {requests.length > 0 ? requests.map((req: LeaveRequest) => (
                                <div
                                    key={req.id}
                                    className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-emerald-500/30 hover:shadow-sm dark:bg-card/50"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className={`text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-md border ${
                                                    req.status === "APPROVED"
                                                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                                        : req.status === "REJECTED"
                                                          ? "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400"
                                                          : req.status === "CANCELLED"
                                                            ? "border-border bg-muted text-muted-foreground"
                                                            : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-500"
                                                }`}
                                            >
                                                {getLeaveStatusLabel(req.status)}
                                            </span>
                                            <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                                                #{req.id.slice(-4).toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <h4 className="text-sm font-semibold text-foreground">{req.policy.name}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(req.startDate), "MMM d")} → {format(new Date(req.endDate), "MMM d, yyyy")}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 text-xs">
                                            <span className="font-medium text-foreground">
                                                {req.days} {req.days === 1 ? "day" : "days"}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {req.managerName ? `Via ${req.managerName.split(" ")[0]}` : "Via system"}
                                            </span>
                                        </div>

                                        {isLeaveRequestMutable(req.status) && (
                                            <div className="flex items-center gap-2 pt-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 flex-1 text-[10px] font-semibold uppercase tracking-wider"
                                                    onClick={() => openEdit(req)}
                                                >
                                                    <Pencil className="h-3 w-3 mr-1.5" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 flex-1 text-[10px] font-semibold uppercase tracking-wider border-red-500/30 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                                                    onClick={() => setDeleteTarget(req)}
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1.5" />
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 p-8">
                                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                                    <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                                        No leave requests yet
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Withdraw this request?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This removes your pending leave request. You cannot undo this for requests that have already
                            been approved or declined.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => void handleConfirmDelete()}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                    Removing...
                                </>
                            ) : (
                                'Withdraw request'
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default LeaveRequestPage
