"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { useState } from "react"

const PREVIEW_LIMIT = 5

interface SelectionUsersListProps {
  itemName: string
  users: string[]
}

const SelectionUsersList = ({ itemName, users }: SelectionUsersListProps) => {
  const [open, setOpen] = useState(false)
  const previewUsers = users.slice(0, PREVIEW_LIMIT)
  const remaining = users.length - previewUsers.length

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {previewUsers.map((userName, idx) => (
          <span
            key={idx}
            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm dark:bg-zinc-800 dark:text-zinc-300"
          >
            {userName}
          </span>
        ))}
        {remaining > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="h-7 rounded-full px-3 text-xs font-medium"
          >
            <Users className="h-3 w-3 mr-1.5" />
            +{remaining} more
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{itemName}</DialogTitle>
            <DialogDescription>
              {users.length} {users.length === 1 ? "person" : "people"} selected this
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto -mx-1 px-1">
            <ol className="divide-y divide-border">
              {users.map((userName, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 py-2.5 text-sm text-foreground"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {idx + 1}
                  </span>
                  {userName}
                </li>
              ))}
            </ol>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SelectionUsersList
