"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { authClient } from "@/lib/auth-client"
import { Loader, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { postEmailVerificationCallbackUrlForClient } from "@/lib/auth-app-url"

export function VerifyEmailPending() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      const session = await authClient.getSession()
      if (!session.data?.user) {
        router.replace("/sign-in")
        return
      }
      const u = session.data.user as { email?: string; pendingInvite?: boolean }
      if (!u.pendingInvite) {
        router.replace("/dawf")
        return
      }
      setEmail(u.email ?? null)
      setLoading(false)
    }
    void run()
  }, [router])

  const resend = async () => {
    if (!email) return
    setSending(true)
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: postEmailVerificationCallbackUrlForClient(),
      })
      toast({
        title: "Email sent",
        description: "Check your inbox for the verification link.",
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not resend email"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md border-none bg-[#10A0748C] text-white flex items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin text-white" />
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-none bg-[#146C43] text-white shadow-2xl rounded-3xl overflow-hidden p-4 md:p-8">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold tracking-tight">Verify your email</CardTitle>
        <p className="text-white/80 text-sm">
          We sent a verification link to <span className="font-semibold">{email}</span>. Open that email
          and click the link to activate your account, then sign in with Google.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="secondary"
          className="w-full gap-2"
          onClick={() => void resend()}
          disabled={sending || !email}
        >
          {sending ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Resend verification email
        </Button>
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
