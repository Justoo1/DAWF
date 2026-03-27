"use client"

import { useEffect, useRef, useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LeaveRequestActions({
  requestId,
  employeeName,
}: {
  requestId: string
  employeeName: string
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  const approve = () => {
    setOpen(false)
    toast({
      title: "Approved",
      description: `Approved leave request for ${employeeName}.`,
    })
  }

  const decline = () => {
    setOpen(false)
    const ok = window.confirm(`Decline leave request for ${employeeName}?`)
    if (!ok) return
    toast({
      title: "Declined",
      description: `Declined leave request for ${employeeName}.`,
      variant: "destructive",
    })
  }

  return (
    <div className="relative inline-block" ref={rootRef} data-request-id={requestId}>
      <button
        className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition-colors"
        aria-label="Request actions"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-lg border border-primary/10 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden z-50">
          <button
            onClick={approve}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-primary/5"
          >
            Approve
          </button>
          <button
            onClick={decline}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  )
}

