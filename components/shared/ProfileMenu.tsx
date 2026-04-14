"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, LogOut, Mail, Settings } from "lucide-react"
import { ProfileMenuUser } from "@/lib/validation"
import { authClient } from "@/lib/auth-client"
import { usePathname, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { canAccessAdmin, type UserRole } from "@/lib/permissions"

interface ProfileMenuProps {
    user: ProfileMenuUser
}

const ProfileMenu = ({ user }: ProfileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const settingsHref = (pathname?.startsWith("/admin") ?? false)
    ? "/admin/settings"
    : "/settings"

  const showAdminDashboardLink =
    canAccessAdmin(user.role as UserRole) &&
    !(pathname?.startsWith("/admin") ?? false)

  const initials = user.name?.split(" ").map((name) => name.charAt(0)).join("").toUpperCase()

  const clearCloseTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const handleOpen = () => {
    clearCloseTimeout()
    setIsOpen(true)
  }

  const handleClose = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 300) // 300ms delay before closing
  }, [])

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        method: "POST",
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Signed out successfully",
        })
        router.replace("/public-calendar")
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to sign out",
          variant: "destructive",
        })
      }
    })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative z-50" onMouseLeave={handleClose}>
      <Button
        variant="ghost"
        className="h-12 w-12 rounded-full"
        onMouseEnter={handleOpen}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Avatar className="h-10 w-10 flex items-center justify-center">
          {/* <AvatarImage src="/avatars/01.png" alt="@username" /> */}
          <AvatarFallback className="bg-emerald-500 text-white">{initials}</AvatarFallback>
        </Avatar>
      </Button>
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 z-[100] mt-4 w-80 rounded-2xl border border-border bg-popover p-6 text-popover-foreground shadow-xl animate-in fade-in zoom-in duration-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          onMouseEnter={clearCloseTimeout}
          onMouseLeave={handleClose}
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 shrink-0 border-2 border-primary/25 dark:border-emerald-500/30">
              <AvatarFallback className="bg-emerald-600 text-lg font-black text-white dark:bg-emerald-500">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-0.5">
              <h4 className="truncate text-lg font-black uppercase tracking-tight text-foreground">
                {user?.name}
              </h4>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                {user?.role?.toLowerCase()}
              </p>
              <div className="flex items-center pt-2">
                <Mail className="mr-2 h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
                <span
                  className="truncate text-[10px] font-semibold tracking-wide text-muted-foreground"
                  title={user?.email}
                >
                  {user?.email}
                </span>
              </div>
            </div>
          </div>

          <nav
            className="mt-6 space-y-0.5 border-t border-border pt-4 dark:border-zinc-800"
            aria-label="Account"
          >
            {showAdminDashboardLink ? (
              <Link
                href="/admin"
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted dark:hover:bg-zinc-800/80"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                Admin dashboard
              </Link>
            ) : null}
            <Link
              href={settingsHref}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted dark:hover:bg-zinc-800/80"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              Settings
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              onClick={() => {
                setIsOpen(false)
                void handleLogout()
              }}
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Sign out
            </button>
          </nav>

          <div className="mt-6 flex justify-center border-t border-border pt-4 dark:border-zinc-800">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              DEVOPS AFRICA Welfare System
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu;
