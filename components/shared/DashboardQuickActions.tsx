"use client"

import React from 'react'
import { Card } from '@/components/ui/card'
import { UtensilsCrossed, FileText, BookOpen, Calendar } from 'lucide-react'
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
    href: "/leave", 
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
  {
    icon: Calendar,
    label: "MY SCHEDULE",
    href: "/events",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: FileText,
    label: "REPORTS",
    href: "/approvals",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
]

export function DashboardQuickActions() {
  return (
    <div className="h-[480px] overflow-y-auto pr-4 custom-scrollbar">
        <div className="flex flex-col gap-6 pb-6">
        {actions.map((action, idx) => {
            const Icon = action.icon
            return (
            <Link key={idx} href={action.href}>
                <Card className="w-32 h-32 md:w-36 md:h-36 flex flex-col items-center justify-center gap-3 p-6 bg-white border-none shadow-xl hover:scale-105 transition-all text-center group rounded-2xl">
                <div className={`p-4 rounded-xl ${action.bgColor} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${action.color}`} />
                </div>
                <span className={`text-[10px] md:text-xs font-black leading-tight tracking-[0.05em] ${action.color}`}>
                    {action.label.split(' ')[0]}<br/>{action.label.split(' ')[1] || ""}
                </span>
                </Card>
            </Link>
            )
        })}
        </div>
    </div>
  )
}
