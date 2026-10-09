import { Loader2 } from "lucide-react"

/** Shown immediately while a (root) page streams in, so navigation feels responsive. */
export default function RootLoading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-1 items-center justify-center" role="status" aria-label="Loading">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
