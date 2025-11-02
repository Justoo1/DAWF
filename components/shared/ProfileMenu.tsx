"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, Mail, User as UserIcon, ShieldCheck } from 'lucide-react'
// import { signOut } from "next-auth/react"
import { User } from "@/lib/validation"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
// import { authClient } from "@/lib/auth-client"

type EnhancedUser = Omit<User, "password" | "clerkId" | "department"> & {
  department: string | null;
  contributionsCount: number;
  eventsCount: number;
  expensesCount: number;
  totalAmountContributed: number;
  totalContributionMonths: number;
}

interface ProfileMenuProps {
    user: EnhancedUser
}

const ProfileMenu = ({ user }: ProfileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()

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
        router.replace("/sign-in")
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
        <Avatar className="h-10 w-10 flex items-center justify-center bg-green-700">
          <AvatarImage src="/avatars/01.png" alt="@username" />
          <AvatarFallback className="bg-emerald-500 text-wh">{initials}</AvatarFallback>
        </Avatar>
      </Button>
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-80 rounded-md bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5"
          onMouseEnter={clearCloseTimeout}
          onMouseLeave={handleClose}
        >
          <div className="flex gap-3">
            <Avatar className="h-16 w-16 flex-shrink-0">
              <AvatarImage src="/avatars/01.png" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-1">
              <h4 className="text-lg font-semibold truncate">{user?.name}</h4>
              <p className="text-sm text-muted-foreground capitalize">
                {user?.role?.toLowerCase()}
              </p>
              <div className="flex items-center pt-1">
                <Mail className="mr-2 h-4 w-4 opacity-70 flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate" title={user?.email}>
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {user?.role === "ADMIN" && (
              <Link href="/admin">
                <Button variant="outline" className="w-full justify-start">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Button>
              </Link>
            )}
            <Button variant="outline" className="justify-start hidden">
              <UserIcon className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Button variant="outline" className="justify-start text-red-600 hover:text-red-700 hover:bg-red-100" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu;
