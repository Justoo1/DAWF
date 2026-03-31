import { cn } from "@/lib/utils";

export function AdminPageContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1600px] flex flex-col gap-6 md:gap-8 lg:gap-10", className)}>
      {children}
    </div>
  );
}
