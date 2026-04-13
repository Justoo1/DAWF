"use client"

import { useState } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/actions/clients.actions"
import { PlusCircle, Building2 } from "lucide-react"

export function AddClientDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await createClient({ name })
      if (res.success) {
        toast({ title: "Client created", description: `${name.trim()} has been added.` })
        setName("")
        setOpen(false)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.error || "Could not create client",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <PlusCircle className="h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>New client</DialogTitle>
            <DialogDescription>
              Clients group employees. Each employee must be assigned a client when they are created.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client name *</Label>
              <Input
                id="clientName"
                required
                className="h-11 rounded-lg"
                leftIcon={<Building2 className="h-4 w-4" />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Create client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
