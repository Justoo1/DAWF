'use client'

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { fetchAccountGateState } from "@/lib/account-gate-client"

export function ProfileChecker() {
  const router = useRouter()
  const pathname = usePathname()
  // The account gate only needs to be verified once per page load, not on every navigation.
  const checkedRef = useRef(false)

  useEffect(() => {
    if (checkedRef.current) return
    const checkProfile = async () => {
      if (
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up") ||
        pathname.startsWith("/wrong-email") ||
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
        checkedRef.current = true
        const [session, gate] = await Promise.all([
          authClient.getSession(),
          fetchAccountGateState(),
        ])

        if (!session.data?.user) {
          return
        }

        const sessionUser = session.data.user as {
          dateOfBirth?: Date | null
          emailVerified?: boolean
        }

        if (sessionUser.emailVerified === false) {
          router.push("/verify-email-pending")
          return
        }

        if (!gate.authenticated) {
          return
        }

        if (!gate.isActive) {
          await authClient.signOut()
          router.push("/account-deactivated")
          return
        }

        // Profile completion is surfaced as UI state on `/home` instead of forcing
        // navigation to a dedicated completion route.
      } catch (error) {
        console.error("Error checking profile:", error)
      }
    }

    checkProfile()
  }, [pathname, router])

  return null
}
