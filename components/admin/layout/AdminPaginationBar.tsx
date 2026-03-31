"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPaginationItems } from "@/lib/admin-pagination";

type BaseProps = {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  entityLabel?: string;
};

type AdminPaginationBarProps = BaseProps &
  (
    | { onPageChange: (page: number) => void; hrefForPage?: never; hrefTemplate?: never }
    | { onPageChange?: never; hrefForPage: (page: number) => string; hrefTemplate?: never }
    | { onPageChange?: never; hrefForPage?: never; hrefTemplate: string }
  );

export function AdminPaginationBar({
  page,
  totalPages,
  totalCount,
  pageSize,
  entityLabel = "results",
  onPageChange,
  hrefForPage,
  hrefTemplate,
}: AdminPaginationBarProps) {
  if (!onPageChange && !hrefForPage && !hrefTemplate) {
    throw new Error("AdminPaginationBar requires onPageChange, hrefForPage, or hrefTemplate");
  }

  const generateHref = (p: number) => {
    if (hrefTemplate) return hrefTemplate.replace("{page}", p.toString());
    if (hrefForPage) return hrefForPage(p);
    return "#";
  };

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  const items = getPaginationItems(totalPages, page);

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  const pageButtonClass = (active: boolean) =>
    cn(
      "inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold transition-colors",
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:bg-muted/60"
    );

  const iconNavClass = (disabled: boolean) =>
    cn(
      "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-colors hover:text-primary",
      disabled && "pointer-events-none opacity-50"
    );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-semibold text-foreground">{start}</span>
        {totalCount > 0 ? (
          <>
            {" "}
            to <span className="font-semibold text-foreground">{end}</span>
          </>
        ) : null}{" "}
        of <span className="font-semibold text-foreground">{totalCount}</span>{" "}
        {entityLabel}
      </p>
      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-end gap-1">
          {(hrefForPage || hrefTemplate) ? (
            <Link
              href={generateHref(prevPage)}
              aria-disabled={page <= 1}
              className={iconNavClass(page <= 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-border/60 bg-background"
              disabled={page <= 1}
              onClick={() => onPageChange!(Math.max(1, page - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {items.map((item, idx) =>
            item === "gap" ? (
              <span
                key={`gap-${idx}`}
                className="px-1 text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            ) : (hrefForPage || hrefTemplate) ? (
              <Link
                key={item}
                href={generateHref(item as number)}
                className={pageButtonClass(item === page)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </Link>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === page ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 min-w-8 rounded-full px-2 text-xs font-semibold",
                  item === page && "shadow-sm"
                )}
                onClick={() => onPageChange!(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </Button>
            )
          )}
          {(hrefForPage || hrefTemplate) ? (
            <Link
              href={generateHref(nextPage)}
              aria-disabled={page >= totalPages}
              className={iconNavClass(page >= totalPages)}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-border/60 bg-background"
              disabled={page >= totalPages}
              onClick={() => onPageChange!(Math.min(totalPages, page + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
