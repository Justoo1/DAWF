'use client'

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function ProfileChecker() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkProfile = async () => {
      // Skip check for auth pages
      if (
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up") ||
        pathname.startsWith("/wrong-email") ||
        pathname.startsWith("/complete-profile")
      ) {
        return
      }

      try {
        const session = await authClient.getSession()

        if (session.data?.user) {
          const user = session.data.user as { dateOfBirth?: Date | null }

          // If user is logged in but doesn't have a birthday, redirect to complete-profile
          if (!user.dateOfBirth) {
            router.push("/complete-profile")
          }
        }
      } catch (error) {
        console.error("Error checking profile:", error)
      }
    }

    checkProfile()
  }, [pathname, router])

  return null
}
