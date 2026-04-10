"use client"

import React from 'react'
import { Card } from '@/components/ui/card'
import { UtensilsCrossed, FileText, BookOpen } from 'lucide-react'
import Link from 'next/link'

const actions = [
  {
    icon: UtensilsCrossed,
    label: "FOOD ORDERS",
    href: "/food-orders",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: FileText,
    label: "LEAVE REQUEST",
    href: "/conference-rooms", // Temporarily mapping to rooms since I don't see leaves
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: BookOpen,
    label: "COMPANY POLICY",
    href: "/policy",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
]

export function DashboardQuickActions() {
  return (
    <div className="flex flex-col gap-4">
      {actions.map((action, idx) => {
        const Icon = action.icon
        return (
          <Link key={idx} href={action.href}>
            <Card className="w-28 h-28 md:w-32 md:h-32 flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-zinc-900 border-none shadow-xl hover:scale-105 transition-all text-center group rounded-3xl">
              <div className={`p-3 rounded-2xl ${action.bgColor} group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <span className={`text-[10px] font-black leading-tight tracking-wider ${action.color}`}>
                {action.label.split(' ')[0]}<br/>{action.label.split(' ')[1] || ""}
              </span>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
