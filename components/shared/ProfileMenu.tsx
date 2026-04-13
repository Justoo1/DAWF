"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, Mail, User as UserIcon, ShieldCheck } from 'lucide-react'
import { UserValues } from "@/lib/validation"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface ProfileMenuProps {
    user: UserValues
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
          className="absolute right-0 mt-4 w-80 rounded-2xl bg-zinc-950/90 backdrop-blur-xl p-6 shadow-2xl border border-zinc-800 animate-in fade-in zoom-in duration-200"
          onMouseEnter={clearCloseTimeout}
          onMouseLeave={handleClose}
        >
          <div className="flex gap-4 items-center">
            <Avatar className="h-16 w-16 flex-shrink-0 border-2 border-emerald-500/20">
              <AvatarFallback className="bg-emerald-500 text-white font-black text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-0.5">
              <h4 className="text-lg font-black text-white tracking-tight truncate uppercase">{user?.name}</h4>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] opacity-80">
                {user?.role?.toLowerCase()}
              </p>
              <div className="flex items-center pt-2">
                <Mail className="mr-2 h-3 w-3 text-zinc-500 flex-shrink-0" />
                <span className="text-[10px] font-bold text-zinc-400 truncate tracking-wide" title={user?.email}>
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid gap-3">
            {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
              <Link href="/admin">
                <Button variant="outline" className="w-full justify-start bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all rounded-xl py-6 font-black text-[11px] uppercase tracking-widest">
                  <ShieldCheck className="mr-3 h-4 w-4" />
                  Admin Control
                </Button>
              </Link>
            )}
            
            <Button 
                variant="outline" 
                className="w-full justify-start bg-zinc-900 border-zinc-800 text-red-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-all rounded-xl py-6 font-black text-[11px] uppercase tracking-widest mt-2" 
                onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-center">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">DEVOPS AFRICA Welfare System</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu;
