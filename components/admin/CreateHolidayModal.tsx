"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { createPublicHoliday } from "@/lib/actions/leave.actions"
import { syncPublicHolidays } from "@/lib/actions/holidays.actions"
import { useToast } from "@/hooks/use-toast"

export function CreateHolidayModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [name, setName] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSyncHolidays = async () => {
    setSyncLoading(true)
    try {
      const year = new Date().getFullYear()
      const result = await syncPublicHolidays(year)
      
      if (result.success) {
        toast({
          title: "Successfully Synced",
          description: `Imported ${result.created} new holidays. (${result.skipped} already existed)`,
        })
        router.refresh()
        setOpen(false)
      } else {
        toast({
          title: "Sync Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred during sync.",
        variant: "destructive",
      })
    } finally {
      setSyncLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !date) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await createPublicHoliday({
        name,
        date,
        isRecurring,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Public holiday created successfully",
        })
        setOpen(false)
        setName("")
        setDate(undefined)
        setIsRecurring(false)
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create holiday",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#10A074] hover:bg-[#10A074]/90 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Public Holiday
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Public Holiday Management</DialogTitle>
          <DialogDescription>
            Automate syncing official holidays or add a custom company holiday.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Button 
            variant="outline" 
            className="w-full justify-center border-dashed border-2 hover:bg-slate-50 text-[13px] h-12"
            onClick={handleSyncHolidays}
            disabled={syncLoading || loading}
          >
            {syncLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CalendarIcon className="mr-2 h-4 w-4 text-[#10A074]" />
            )}
            Sync Official Holidays ({new Date().getFullYear()})
          </Button>
        </div>

        <div className="flex items-center gap-2 py-2">
          <div className="flex-1 border-t border-slate-100" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold whitespace-nowrap">OR MANUALLY ADD</span>
          <div className="flex-1 border-t border-slate-100" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Holiday Name</Label>
              <Input
                id="name"
                placeholder="e.g. Christmas Day"
                leftIcon={<CalendarIcon className="h-4 w-4" />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || syncLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    disabled={loading || syncLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
                disabled={loading || syncLoading}
              />
              <Label htmlFor="recurring">Recurring (same date every year)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading || syncLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#10A074] hover:bg-[#10A074]/90 text-white"
              disabled={loading || syncLoading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Holiday
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
