'use client'

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { getAccountGateState } from "@/lib/actions/account-gate.action"

export function ProfileChecker() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkProfile = async () => {
      if (
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up") ||
        pathname.startsWith("/wrong-email") ||
        pathname.startsWith("/complete-profile") ||
        pathname.startsWith("/verify-email-pending") ||
        pathname.startsWith("/account-deactivated") ||
        pathname.startsWith("/set-password") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password") ||
        pathname.startsWith("/change-initial-password")
      ) {
        return
      }

      try {
        const session = await authClient.getSession()

        if (!session.data?.user) {
          return
        }

        const gate = await getAccountGateState()
        if (!gate.authenticated) {
          return
        }

        if (!gate.isActive) {
          await authClient.signOut()
          router.push("/account-deactivated")
          return
        }

        if (gate.pendingInvite) {
          router.push("/verify-email-pending")
          return
        }

        if (gate.mustChangePassword) {
          router.push("/change-initial-password")
          return
        }

        const user = session.data.user as { dateOfBirth?: Date | null }

        if (!user.dateOfBirth) {
          router.push("/complete-profile")
        }
      } catch (error) {
        console.error("Error checking profile:", error)
      }
    }

    checkProfile()
  }, [pathname, router])

  return null
}
