"use client";

import { useState } from "react";
import { AdminToolbar } from "@/components/admin/layout/AdminToolbar";
import { AdminSearchField } from "@/components/admin/layout/AdminSearchField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ManageEmployeesToolbar({
  departments,
}: {
  departments: string[];
}) {
  const [search, setSearch] = useState("");

  return (
    <AdminToolbar>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <AdminSearchField
          placeholder="Search employees by name, ID or email…"
          value={search}
          onChange={setSearch}
          className="min-w-[min(100%,280px)]"
        />
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Select defaultValue="__all_departments__">
            <SelectTrigger className="h-10 w-[min(100vw-2rem,220px)] rounded-lg border-border/60 bg-muted/40 dark:bg-zinc-900/80 dark:border-zinc-700 dark:text-zinc-200 shadow-none focus:ring-2 focus:ring-primary/25">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="dark:border-zinc-800 dark:bg-zinc-950">
              <SelectItem value="__all_departments__">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="active">
            <SelectTrigger className="h-10 w-[min(100vw-2rem,200px)] rounded-lg border-border/60 bg-muted/40 dark:bg-zinc-900/80 dark:border-zinc-700 dark:text-zinc-200 shadow-none focus:ring-2 focus:ring-primary/25">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:border-zinc-800 dark:bg-zinc-950">
              <SelectItem value="active">Status: Active</SelectItem>
              <SelectItem value="inactive">Status: Inactive</SelectItem>
              <SelectItem value="all">Status: All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </AdminToolbar>
  );
}
