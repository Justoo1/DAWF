import { cn } from "@/lib/utils";

/** Shared admin data table surface (crisp clean style; dark surfaces match admin-main) */
export const adminTableShellClass =
  "overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm ring-0 dark:border-slate-800 dark:bg-zinc-950";

export const adminToolbarClass =
  "flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-zinc-950 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)]";

/** Bottom filter row inside AdminToolbar (below search); replaces raw bg-white */
export const adminToolbarFilterRowClass =
  "flex flex-col sm:flex-row sm:items-center justify-start gap-3 sm:gap-4 px-6 sm:px-8 py-5 bg-slate-50/80 dark:bg-zinc-900/50";

/** Border between search block and filter row in AdminToolbar */
export const adminToolbarDividerClass = "border-b border-slate-100 dark:border-zinc-800";

/** Standard admin filter dropdown trigger (matches Employees / Leave Requests dark styling) */
export const adminFilterSelectTriggerClass =
  "h-10 rounded-lg border-slate-200 dark:border-zinc-700 text-[13px] font-medium text-slate-600 dark:text-zinc-200 bg-white dark:bg-zinc-900/90 shadow-sm dark:shadow-none";

/** Radix SelectContent surface for admin filters */
export const adminSelectContentSurfaceClass = "dark:border-zinc-800 dark:bg-zinc-950";

/** Sortable table header cell (use with adminThClass) */
export const adminThSortableClass =
  "cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors group";

export const adminTheadRowClass =
  "border-b border-slate-100 bg-white dark:border-slate-800 dark:bg-zinc-950";

export const adminThClass =
  "whitespace-nowrap px-4 sm:px-8 py-3 sm:py-5 text-left text-[10px] sm:text-[11px] font-[800] tracking-[0.08em] text-slate-400 uppercase dark:text-slate-500";

export const adminTdClass =
  "px-4 sm:px-8 py-4 sm:py-6 align-middle text-[12px] sm:text-[13px] text-slate-700 font-medium dark:text-slate-200";

export const adminTbodyRowClass =
  "border-b border-slate-100 hover:bg-slate-50/50 transition-colors dark:border-slate-800 dark:hover:bg-slate-900/60";

export function adminTableClassName(extra?: string) {
  return cn("w-full min-w-[800px] border-collapse text-left", extra);
}

