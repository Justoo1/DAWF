"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AdminSearchField({
  placeholder = "Search…",
  value,
  onChange,
  className,
  inputClassName,
}: {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  inputClassName?: string;
}) {
  return (
    <div className={cn("relative min-w-[200px] flex-1", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 text-[13px] shadow-none focus-visible:ring-1 focus-visible:ring-primary/50 text-slate-800",
          inputClassName
        )}
      />
    </div>
  );
}
