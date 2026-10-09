import { cn } from "@/lib/utils"
import Image from "next/image"
import { type ReactNode } from "react"
import { Home } from 'lucide-react'
import Link from "next/link"
import { AuthImageCarousel } from "./AuthImageCarousel"

interface AuthLayoutProps {
  children: ReactNode
  description: string
  secondaryDescription?: string
  teamImage: string
  className?: string
  flexStart?: boolean
  title?: string
  subtitle?: string
}

const AuthLayout = ({ children, description, secondaryDescription, teamImage, className, flexStart, title = "Devops Africa", subtitle = "Employee Management System" }: AuthLayoutProps) => {
  return (
    <div className={cn("relative min-h-screen flex flex-col items-center justify-center bg-[#121212] overflow-hidden font-sans", flexStart && "items-start")}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/assets/images/bg-background.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#121212]/70" />
      </div>

      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6 md:px-16">
        <Link href="/" className="flex items-center gap-2 group transition-all">
          <div className="p-1.5 rounded-md bg-[#d33f2b]/10">
            <Home className="text-[#d33f2b] w-5 h-5" />
          </div>
          <span className="text-white text-sm font-semibold tracking-[0.2em] uppercase">Home</span>
        </Link>
        <div className="flex items-center gap-8 md:gap-12">
          <Link href="/public-calendar" className="text-white text-sm font-semibold tracking-[0.2em] uppercase hover:text-[#d33f2b] transition-colors">
            Events
          </Link>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-[1400px] px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-3 lg:items-stretch">
          {/* Left Column: Auth form */}
          <div className="flex w-full justify-center lg:h-full lg:min-h-0">
            <div className="flex w-full max-w-[400px] flex-col lg:h-full lg:min-h-0">
              {children}
            </div>
          </div>

          {/* Middle Column: Team Card — same max width/height as auth card (row stretch on lg) */}
          <div className="hidden w-full justify-center lg:flex lg:h-full lg:min-h-0">
            <div
              className={cn(
                "relative h-full w-full max-w-[400px] overflow-hidden rounded-3xl bg-white shadow-2xl lg:min-h-0",
                className
              )}
            >
              <AuthImageCarousel firstImage={teamImage} />
            </div>
          </div>

          {/* Right Column: Info Section */}
          <div className="hidden lg:flex flex-col justify-center space-y-4 text-white pl-8">
            <div className="flex items-center gap-4">
              <div className="flex flex-col uppercase text-left">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">{title}</h2>
                <p className="mt-1 text-xs font-black text-white/80 tracking-[0.2em] leading-tight">
                  {subtitle}
                </p>
              </div>
              <div className="relative size-14 flex items-center justify-center overflow-hidden">
                <Image
                  src="/assets/images/dem-logo.svg"
                  alt="DEM logo"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
            </div>

            <div className="w-full h-px bg-white/10" />

            <div className="space-y-4">
              <p className="text-white/80 text-lg leading-relaxed font-light">
                {description}
              </p>
              {secondaryDescription && (
                <p className="text-white/80 text-lg leading-relaxed font-light">
                  {secondaryDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 left-8 md:left-16 z-10">
        <p className="text-white/40 text-sm font-medium">
          <Link href="#" className="hover:text-white underline decoration-white/20 underline-offset-4 transition-colors">DevOps Africa Team</Link> © All Rights Reserved.
        </p>
      </footer>
    </div>
  )
}

export default AuthLayout;