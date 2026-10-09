'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { useToast } from "@/hooks/use-toast"
import { SESSION_IDLE_TIMEOUT_S } from "@/lib/session-policy"

const LAST_ACTIVITY_KEY = "dawf-last-activity"
const IDLE_TIMEOUT_MS = SESSION_IDLE_TIMEOUT_S * 1000
const CHECK_INTERVAL_MS = 60 * 1000
const ACTIVITY_THROTTLE_MS = 15 * 1000
const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll", "click"] as const

function readLastActivity(): number {
  try {
    const raw = localStorage.getItem(LAST_ACTIVITY_KEY)
    const parsed = raw ? Number(raw) : NaN
    return Number.isFinite(parsed) ? parsed : Date.now()
  } catch {
    return Date.now()
  }
}

function writeLastActivity(ts: number) {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(ts))
  } catch {
    /* ignore */
  }
}

/**
 * Signs the user out after SESSION_IDLE_TIMEOUT_S of inactivity. Activity is shared across
 * tabs via localStorage, and the check also runs when a sleeping tab becomes visible again.
 */
export function IdleLogout() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = authClient.useSession()
  const signedIn = Boolean(session?.user)

  useEffect(() => {
    if (!signedIn) return

    writeLastActivity(Date.now())
    let lastWrite = Date.now()
    let signingOut = false

    const expire = async () => {
      if (signingOut) return
      signingOut = true
      try {
        await authClient.signOut()
      } catch {
        /* session may already be gone server-side */
      }
      toast({
        title: "Session expired",
        description: "You were signed out due to inactivity. Please sign in again.",
      })
      router.replace("/sign-in")
    }

    const check = () => {
      if (Date.now() - readLastActivity() >= IDLE_TIMEOUT_MS) void expire()
    }

    const onActivity = () => {
      const now = Date.now()
      if (now - lastWrite < ACTIVITY_THROTTLE_MS) return
      lastWrite = now
      writeLastActivity(now)
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") check()
    }

    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))
    document.addEventListener("visibilitychange", onVisible)
    const interval = setInterval(check, CHECK_INTERVAL_MS)

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity))
      document.removeEventListener("visibilitychange", onVisible)
      clearInterval(interval)
    }
  }, [signedIn, router, toast])

  return null
}
