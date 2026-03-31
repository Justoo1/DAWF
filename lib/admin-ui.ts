import { cn } from "@/lib/utils";

/** Shared admin data table surface (crisp clean style) */
export const adminTableShellClass =
  "overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm ring-0";

export const adminToolbarClass =
  "flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm";

export const adminTheadRowClass = "border-b border-slate-100 bg-white";

export const adminThClass =
  "whitespace-nowrap px-4 sm:px-8 py-3 sm:py-5 text-left text-[10px] sm:text-[11px] font-[800] tracking-[0.08em] text-slate-400 uppercase";

export const adminTdClass =
  "px-4 sm:px-8 py-4 sm:py-6 align-middle text-[12px] sm:text-[13px] text-slate-700 font-medium";

export const adminTbodyRowClass =
  "border-b border-slate-100 hover:bg-slate-50/50 transition-colors";

export function adminTableClassName(extra?: string) {
  return cn("w-full min-w-[800px] border-collapse text-left", extra);
}

