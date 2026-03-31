"use client"

import { Loader2 } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-background/50">
      <div className="flex flex-col items-center gap-4 text-muted-foreground animate-in fade-in duration-500 delay-150 fill-mode-both">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="font-semibold text-foreground">Loading Module</p>
          <p className="text-sm">Retrieving real-time data...</p>
        </div>
      </div>
    </div>
  )
}
