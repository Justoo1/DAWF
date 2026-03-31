import { adminToolbarClass } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

export function AdminToolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(adminToolbarClass, className)}>{children}</div>
  );
}
