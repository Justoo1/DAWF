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
import {
  adminFilterSelectTriggerClass,
  adminSelectContentSurfaceClass,
} from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

export function ManageEmployeesToolbar({
  departments,
}: {
  departments: string[];
}) {
  const [search, setSearch] = useState("");

  return (
    <AdminToolbar className="shadow-premium dark:shadow-black/30">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <AdminSearchField
          placeholder="Search employees by name, ID or email…"
          value={search}
          onChange={setSearch}
          className="min-w-[min(100%,280px)]"
        />
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Select defaultValue="__all_departments__">
            <SelectTrigger
              className={cn(
                adminFilterSelectTriggerClass,
                "w-[min(100vw-2rem,220px)] shadow-none focus:ring-2 focus:ring-primary/25"
              )}
            >
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className={adminSelectContentSurfaceClass}>
              <SelectItem value="__all_departments__">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="active">
            <SelectTrigger
              className={cn(
                adminFilterSelectTriggerClass,
                "w-[min(100vw-2rem,200px)] shadow-none focus:ring-2 focus:ring-primary/25"
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={adminSelectContentSurfaceClass}>
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
