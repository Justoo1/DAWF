"use client"

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React from 'react'

const Footer = () => {
  const pathname = usePathname();
  if (pathname === '/dawf') return null;

  return (
    <footer className="flex items-center gap-4 p-3 md:px-5 md:py-0 2xl:py-24 2xl:px-80">
        <Image
          src="/assets/images/DevOps-africa.png"
          alt="DevOps Africa Team Logo"
          width={32}
          height={32}
          className="object-contain"
        />
        <p className="text-xs text-white">
          Devops Africa Team © All Rights Reserved.
        </p>
      </footer>
  )
}

export default Footer