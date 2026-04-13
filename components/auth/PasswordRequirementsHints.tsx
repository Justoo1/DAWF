"use client";

import { getPasswordRequirements } from "@/lib/password-policy";
import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";

type Variant = "light" | "auth";

export function PasswordRequirementsHints({
  password,
  variant = "light",
  className,
}: {
  password: string;
  variant?: Variant;
  className?: string;
}) {
  const reqs = getPasswordRequirements(password);

  return (
    <ul
      className={cn(
        "space-y-1.5 text-[11px] leading-snug",
        variant === "auth" && "text-white/75",
        variant === "light" && "text-muted-foreground",
        className
      )}
      aria-live="polite"
    >
      {reqs.map((r) => (
        <li
          key={r.id}
          className={cn(
            "flex items-start gap-2 transition-colors",
            variant === "auth" && r.met && "text-emerald-200",
            variant === "light" && r.met && "text-emerald-700"
          )}
        >
          {r.met ? (
            <Check
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
              aria-hidden
            />
          ) : (
            <Circle
              className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-40"
              aria-hidden
            />
          )}
          <span>{r.label}</span>
        </li>
      ))}
    </ul>
  );
}
