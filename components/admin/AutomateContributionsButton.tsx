"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calculator, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createMonthlyContributions } from "@/lib/actions/contribution"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function AutomateContributionsButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleAutomate = async () => {
    setLoading(true)
    try {
      const result = await createMonthlyContributions()
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Monthly contributions generated successfully",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to automate contributions",
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="border-[#10b981] text-[#10b981] hover:bg-[#10b981]/10">
          <Calculator className="mr-2 h-4 w-4" />
          Generate This Month
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Automate Monthly Contributions?</AlertDialogTitle>
          <AlertDialogDescription>
            This will automatically create a PENDING contribution record for all active contributors for the current month. Duplicates will be skipped.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleAutomate}
            disabled={loading}
            className="bg-[#10b981] hover:bg-[#10b981]/90 text-white"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
