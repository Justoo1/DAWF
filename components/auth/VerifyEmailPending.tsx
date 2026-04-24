"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { Loader } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function VerifyEmailPending() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      const session = await authClient.getSession()
      if (!session.data?.user) {
        router.replace("/sign-in")
        return
      }
      const u = session.data.user as { email?: string; emailVerified?: boolean }
      if (u.emailVerified !== false) {
        router.replace("/home")
        return
      }
      setEmail(u.email ?? null)
      setLoading(false)
    }
    void run()
  }, [router])

  if (loading) {
    return (
      <Card className="w-full max-w-md border-none bg-[#10b9818C] text-white flex items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin text-white" />
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-none bg-[#146C43] text-white shadow-2xl rounded-3xl overflow-hidden p-4 md:p-8">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold tracking-tight">Finish signing in</CardTitle>
        <p className="text-white/80 text-sm leading-relaxed">
          This app uses <span className="font-semibold text-white">Google sign-in</span> only.
          {email ? (
            <>
              {" "}
              If you still see this screen for <span className="font-semibold">{email}</span>, ask
              an administrator to confirm your work email is correct and your user record is
              active, then sign in again with Google.
            </>
          ) : null}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full border-white/40 text-white hover:bg-white/10"
          onClick={() => router.push("/sign-in")}
        >
          Back to sign in
        </Button>
      </CardContent>
    </Card>
  )
}
