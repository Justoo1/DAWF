import { cn } from "@/lib/utils"
import Image from "next/image"
import { type ReactNode } from "react"
import { Home } from 'lucide-react'
import Link from "next/link"
import { COMPANY_LEGAL_NAME, PLATFORM_NAME } from "@/lib/brand"

interface AuthLayoutProps {
  children: ReactNode
  description: string
  secondaryDescription?: string
  teamImage: string
  className?: string
  flexStart?: boolean
}

const AuthLayout = ({ children, description, secondaryDescription, teamImage, className, flexStart }: AuthLayoutProps) => {
  return (
    <div className={cn("relative min-h-screen flex flex-col items-center justify-center bg-[#121212] overflow-hidden font-sans", flexStart && "items-start")}>
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/assets/images/logo.png')] bg-repeat bg-[length:200px_200px] grayscale brightness-0 invert" />
      </div>

      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6 md:px-16">
        <Link href="/" className="flex items-center gap-2 group transition-all">
          <div className="p-1.5 rounded-md bg-[#10b981]/10">
            <Home className="text-[#10b981] w-5 h-5" />
          </div>
          <span className="text-white text-sm font-semibold tracking-[0.2em] uppercase">Home</span>
        </Link>
        <div className="flex items-center gap-8 md:gap-12">
          <Link href="/public-calendar" className="text-white text-sm font-semibold tracking-[0.2em] uppercase hover:text-[#10b981] transition-colors">
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
              <Image
                src={teamImage}
                alt="Team"
                fill
                className="object-contain p-8"
                sizes="400px"
                priority
              />
            </div>
          </div>

          {/* Right Column: Info Section */}
          <div className="hidden lg:flex flex-col justify-center space-y-6 text-white pl-8">
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter leading-tight">{PLATFORM_NAME}</h2>
                <div className="text-sm font-bold tracking-[0.1em] text-white/80 uppercase">
                  {COMPANY_LEGAL_NAME}
                </div>
              </div>
              <div className="relative size-24 bg-[#10b981] rounded-full flex items-center justify-center overflow-hidden">
                <Image
                  src="/assets/images/logo.png"
                  alt="DevOps Africa logo"
                  width={120}
                  height={120}
                  className="object-contain brightness-0 invert opacity-40 scale-150"
                />
              </div>
            </div>

            <div className="w-full h-px bg-white/10 my-4" />

            <div className="space-y-8">
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