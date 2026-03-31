import { cn } from "@/lib/utils";
import React from "react";

export function AdminStatCardsWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full",
        className
      )}
    >
      {children}
    </div>
  );
}

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string | number; // e.g. "+15%"
  trendIsPositive?: boolean;
  trendLabel?: string; // e.g. "from last month"
  className?: string;
}

export function AdminStatCard({
  title,
  value,
  icon,
  trend,
  trendIsPositive,
  trendLabel,
  className,
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-5 md:p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-[800] uppercase tracking-wider text-slate-500">
          {title}
        </p>
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
            {icon}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </h3>
        
        {trend !== undefined && (
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide",
                trendIsPositive === undefined
                  ? "bg-slate-100 text-slate-600"
                  : trendIsPositive
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              )}
            >
              {trendIsPositive !== undefined && (
                <svg
                  className={cn("mr-1 h-3 w-3", trendIsPositive ? "" : "rotate-180")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              )}
              {trend}
            </span>
            {trendLabel && (
              <span className="text-[12px] font-medium text-slate-400">
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
