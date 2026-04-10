'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { authClient } from "@/lib/auth-client"

const Signup = () => {
    const { toast } = useToast()

    const handleGoogleSignUp = async () => {
      try {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "/complete-profile",
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to sign up with Google"
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
      }
    }

  return (
    <Card className="w-full max-w-md border-none bg-[#146C43] text-white shadow-2xl rounded-3xl overflow-hidden p-4 md:p-8">
      <CardHeader className="space-y-4 pb-8">
        <CardTitle className="text-4xl font-bold tracking-tight">Create Account</CardTitle>
        <p className="text-white/70 text-base">
          Join DAWF Welfare Program to access exclusive benefits
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <Button
          onClick={handleGoogleSignUp}
          type="button"
          className="w-full h-14 bg-white text-[#121212] hover:bg-white/90 transition-all rounded-xl flex items-center justify-center gap-3 font-semibold text-base shadow-sm"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign up with Google
        </Button>
        
        <div className="text-left py-2 font-medium">
          Already have an account ? <Link href="/sign-in" className="text-[#F15A24] hover:underline font-bold transition-all ml-1">Sign In</Link>
        </div>

        <div className="w-full h-px bg-white/10" />

        <p className="text-xs text-white/50 text-center leading-relaxed">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardContent>
    </Card>
  )
}

export default Signup;