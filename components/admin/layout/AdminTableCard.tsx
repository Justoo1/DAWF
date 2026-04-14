import { adminTableShellClass } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

export function AdminTableCard({
  children,
  title,
  footer,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(adminTableShellClass, className)} aria-label={title}>
      <div className="overflow-x-auto">{children}</div>
      {footer ? (
        <div className="border-t border-slate-100 bg-white px-6 py-5 sm:px-8 dark:border-slate-800 dark:bg-zinc-950">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
