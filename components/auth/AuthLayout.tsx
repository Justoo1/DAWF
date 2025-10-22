import { cn } from "@/lib/utils"
import Image from "next/image"
import { type ReactNode } from "react"

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
    <div className={cn("flex min-h-screen items-center justify-center p-4 overflow-hidden", flexStart && "flex-start")}>
    <div className="grid h-[100vh] max-h-[800px] w-full max-w-6xl grid-cols-1 gap-8 overflow-hidden rounded-xl lg:grid-cols-[1fr,1fr,1.5fr]">
      <div className="flex items-center justify-center overflow-y-auto">{children}</div>
      <div className="hidden lg:flex lg:items-center lg:justify-center overflow-hidden">
            <div className={cn("relative h-[27.8rem] w-full overflow-hidden rounded-lg bg-white", className)}>
            <Image
                src={teamImage}
                alt="Team"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
            />
            </div>
        </div>
      <div className={cn("hidden lg:flex lg:flex-col lg:justify-center overflow-y-auto space-y-8 leading-10")}>
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl lg:text-5xl tracking-widest font-bold text-white">DAWF</h2>
            <p className="text-sm text-white">DEVOPS AFRICA LTD <br /> WELFARE FUND</p>
          </div>
          <Image
                src="/assets/images/logo.png"
                alt="DAWF Logo"
                width={400}
                height={400}
                className="object-contain size-24"
            />
        </div>
        <p className=" text-white/90 text-xl leading-9">{description}</p>
        {secondaryDescription && <p className=" text-white/90 text-xl leading-9">{secondaryDescription}</p>}
      </div>
    </div>
  </div>
  )
}

export default AuthLayout;