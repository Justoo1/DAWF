"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { updateFoodMenuDeadline } from "@/lib/actions/foodMenu.actions"
import { Clock } from "lucide-react"

interface EditDeadlineDialogProps {
  menuId: string
  currentDeadline: Date
}

const formatForInput = (date: Date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const EditDeadlineDialog = ({ menuId, currentDeadline }: EditDeadlineDialogProps) => {
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(() => formatForInput(currentDeadline))
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const result = await updateFoodMenuDeadline(menuId, value)
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error })
      } else {
        toast({ title: "Deadline updated", description: "The menu and selections were left untouched." })
        setOpen(false)
        router.refresh()
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setValue(formatForInput(currentDeadline))
          setOpen(true)
        }}
      >
        <Clock className="h-4 w-4" />
        Edit Deadline
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Selection Deadline</DialogTitle>
              <DialogDescription>
                Only the deadline changes. The menu items and any selections already made stay exactly as they are.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="deadline-input">Selection Close Date</Label>
              <Input
                id="deadline-input"
                type="datetime-local"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="h-11 rounded-lg"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Deadline"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EditDeadlineDialog
