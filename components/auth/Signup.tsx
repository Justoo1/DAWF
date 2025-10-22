'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
import Link from "next/link"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { z } from "zod"
// import { signupSchema } from "@/lib/validation"
import { useToast } from "@/hooks/use-toast"
// import { Loader } from "lucide-react"
// import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"



const Signup = () => {
    const { toast } = useToast()
    // const router = useRouter()

    // Commented out manual form - keeping for potential future use
    // const form = useForm<z.infer<typeof signupSchema>>({
    //     resolver: zodResolver(signupSchema),
    //     defaultValues: {
    //       name: "",
    //       email: "",
    //       password: "",
    //     },
    //   })

    const handleGoogleSignUp = async () => {
      try {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "/complete-profile", // Redirect to complete profile to collect birthday
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

    // Commented out manual registration handler - keeping for potential future use
    //   const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    //     try {
    //         const {email, name, password} = values
    //         // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //         const { data, error } = await authClient.signUp.email({
    //           email,
    //           name,
    //           password,
    //           callbackURL: "/sign-in"
    //         }, {
    //             // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //             onRequest: (ctx) => {
    //              toast({
    //               title: "Signing up please wait...",
    //              })
    //             },
    //             // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //             onSuccess: (ctx) => {
    //               //redirect to the dashboard
    //               form.reset();
    //               // router.replace("/login")
    //             },
    //             onError: (ctx) => {
    //               toast({
    //                 title: "Error",
    //                 description: ctx.error.message,
    //                 variant: "destructive",
    //               })
    //             },
    //           });
    //     } catch (error) {
    //       const message = error instanceof Error ? error.message : "Something went wrong"
    //        toast({
    //         title: "Error",
    //         description: message,
    //         variant: "destructive",
    //        })
    //     }
    //   }
  return (
    <Card className="w-full max-w-md border-none bg-[#10A0748C] text-white overflow-y-auto max-h-full">
      <CardHeader>
        <CardTitle className="text-2xl">Sign up for DAWF</CardTitle>
        <p className="text-white/90">Create an account to get started</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Manual Registration Form - Commented out for Google OAuth only */}
        {/* <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-white/20 bg-transparent text-white placeholder:text-white/50"
                      placeholder="Enter your full name"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-white/20 bg-transparent text-white placeholder:text-white/50"
                      placeholder="Enter your email address"
                      type="email"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-white/20 bg-transparent text-white placeholder:text-white/50"
                      placeholder="Create a password"
                      type="password"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-[#E84E1B] font-medium hover:bg-[#E84E1B]/90"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : "Sign up"}
            </Button>
          </form>
        </Form>
        <div className="relative mt-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#2F7A67] px-2 text-white/50">or</span>
          </div>
        </div> */}
        <Button
          onClick={handleGoogleSignUp}
          type="button"
          className="mt-4 w-full bg-white text-zinc-900 hover:bg-white/90"
          variant="outline"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
          Continue with Google
        </Button>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link className="text-[#E84E1B] hover:underline" href="/sign-in">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default Signup;