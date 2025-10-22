'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { Loader } from "lucide-react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { useEffect, useState } from "react"

const birthdaySchema = z.object({
  dateOfBirth: z.string().min(1, "Birthday is required"),
})

const CompleteProfileForm = () => {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const form = useForm<z.infer<typeof birthdaySchema>>({
    resolver: zodResolver(birthdaySchema),
    defaultValues: {
      dateOfBirth: "",
    },
  })

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const session = await authClient.getSession()
      if (!session.data) {
        // Not authenticated, redirect to sign-up
        router.push("/sign-up")
      } else {
        // Check if user already has birthday set
        const user = session.data.user as { dateOfBirth?: Date | null }
        if (user?.dateOfBirth) {
          // Already has birthday, redirect to home
          router.push("/")
        } else {
          setLoading(false)
        }
      }
    }
    checkAuth()
  }, [router])

  const onSubmit = async (values: z.infer<typeof birthdaySchema>) => {
    try {
      const response = await fetch("/api/users/update-birthday", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dateOfBirth: values.dateOfBirth }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile completed successfully!",
        })
        router.push("/")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
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
    <Card className="w-full max-w-md border-none bg-[#10A0748C] text-white">
      <CardHeader>
        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        <p className="text-white/90">Please provide your birthday to complete registration</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="border-white/20 bg-transparent text-white placeholder:text-white/50 [color-scheme:dark]"
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
              {form.formState.isSubmitting ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Complete Profile"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default CompleteProfileForm
