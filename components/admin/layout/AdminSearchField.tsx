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
    <Input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      leftIcon={<Search className="h-4 w-4" />}
      className={cn(
        "h-12 rounded-2xl border-none bg-slate-50 text-[14px] shadow-none focus-visible:ring-1 focus-visible:ring-[#10A074] text-slate-800 pl-14",
        inputClassName
      )}
    />
  );
}
