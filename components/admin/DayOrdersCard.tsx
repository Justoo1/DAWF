"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import SelectionUsersList from "@/components/admin/SelectionUsersList"

interface DayOrdersCardProps {
  day: string
  totalOrders: number
  items: Array<{ itemName: string; count: number; users: string[] }>
  defaultOpen?: boolean
}

const DayOrdersCard = ({ day, totalOrders, items, defaultOpen = true }: DayOrdersCardProps) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Card>
      <CardHeader
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setOpen((v) => !v)
          }
        }}
        className="flex flex-row items-center justify-between cursor-pointer select-none"
      >
        <CardTitle className="text-lg">{day}</CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {totalOrders} {totalOrders === 1 ? "selection" : "selections"}
          </span>
          <ChevronDown
            className={cn("h-5 w-5 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
          />
        </div>
      </CardHeader>
      {open && (
        <CardContent>
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-lg">{item.itemName}</h4>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                    {item.count} {item.count === 1 ? "order" : "orders"}
                  </span>
                </div>
                <SelectionUsersList itemName={item.itemName} users={item.users} />
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default DayOrdersCard
