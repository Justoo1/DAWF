"use client"

import { useEffect, useState } from "react"
import { Info, Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import { fetchUsersIdAndName } from "@/lib/actions/users.action"
import { fetchLeavePolicies, submitLeaveRequest } from "@/lib/actions/leave.actions"

type UserOption = { id: string; name: string }
type PolicyOption = { id: string; name: string; defaultDays: number }

export default function RequestLeaveModal() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [users, setUsers] = useState<UserOption[]>([])
  const [policies, setPolicies] = useState<PolicyOption[]>([])

  const [employeeId, setEmployeeId] = useState("")
  const [policyId, setPolicyId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [days, setDays] = useState<number>(1)
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (open && users.length === 0) {
      setIsLoading(true)
      Promise.all([fetchUsersIdAndName(), fetchLeavePolicies()]).then(([usersRes, policiesRes]) => {
        if (usersRes.success && usersRes.users) {
          setUsers(usersRes.users.filter(u => u.isActive).map(u => ({ id: u.id, name: u.name || "Unnamed" })))
        }
        if (policiesRes.success && policiesRes.policies) {
          setPolicies(
            policiesRes.policies
              .filter((p) => p.isActive)
              .map((p) => ({
                id: p.id,
                name: p.name,
                defaultDays: p.defaultDays,
              }))
          )
        }
        setIsLoading(false)
      })
    }
  }, [open, users.length])

  const handleSubmit = async () => {
    if (!employeeId || !policyId || !startDate || !endDate || days <= 0) {
      toast({ title: "Validation Error", description: "Please fill all required fields correctly.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    const res = await submitLeaveRequest({
      userId: employeeId,
      policyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      days,
      reason: reason || undefined
    })

    if (res.success) {
      toast({ title: "Request submitted", description: "Leave request successfully logged." })
      setOpen(false)
      // Reset form
      setEmployeeId("")
      setPolicyId("")
      setStartDate("")
      setEndDate("")
      setDays(1)
      setReason("")
    } else {
      toast({ title: "Submission Failed", description: res.error || "Failed to submit leave", variant: "destructive" })
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Request
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[min(90vh,920px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[600px]">
        <DialogHeader className="border-b border-border/60 px-6 py-4 text-left">
          <DialogTitle>Request Leave</DialogTitle>
          <DialogDescription>
            Create a new leave application for an employee
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              <p>Loading database records...</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Employee Selection</Label>
                <Select value={employeeId} onValueChange={setEmployeeId} disabled={isSubmitting}>
                  <SelectTrigger className="h-11 rounded-lg">
                    <SelectValue placeholder="Select an active employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {policies.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Info className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Company Policies
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                    {policies.slice(0, 3).map((p, idx, arr) => (
                      <div key={p.id} className={`flex flex-col flex-1 items-center ${idx < arr.length - 1 ? "border-r border-primary/10" : ""}`}>
                        <span className="text-primary text-lg">{p.defaultDays}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter truncate max-w-[80px]">
                          {p.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select value={policyId} onValueChange={setPolicyId} disabled={isSubmitting}>
                    <SelectTrigger className="h-11 rounded-lg">
                      <SelectValue placeholder="Select leave policy" />
                    </SelectTrigger>
                    <SelectContent>
                      {policies.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Total Days</Label>
                  <Input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="h-11 rounded-lg"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11 rounded-lg"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-11 rounded-lg auto"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Reason (Optional)</Label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Additional notes for approval..."
                  className="h-11 rounded-lg"
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="border-t border-border/60 bg-muted/30 px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="shadow-sm gap-2"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
            ) : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
