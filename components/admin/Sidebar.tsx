"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  Users,
  FileText,
  BarChart,
  ChartBar,
  ListCheckIcon,
  Calendar,
  BookOpen,
  X,
  DoorOpen,
  UtensilsCrossed,
  Store,
   MenuSquare,
  Settings,
  Building2,
  Layers,
  CalendarDays,
  Inbox,
  ChevronDown,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { hasPermission, type UserRole } from "@/lib/permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: UserRole;
  collapsed?: boolean;
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  showTooltips,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed: boolean;
  showTooltips: boolean;
}) {
  const linkBase =
    "flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-semibold";
  const linkInactive =
    "text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary";
  const linkActive =
    "bg-primary text-primary-foreground shadow-sm shadow-primary/20";
  const linkClass = cn(
    linkBase,
    active ? linkActive : linkInactive,
    collapsed && "md:justify-center md:gap-0 md:px-2 md:py-2.5"
  );
  const inner = (
    <>
      <Icon size={20} className="shrink-0" />
      <span className={cn("truncate", collapsed && "md:sr-only")}>{label}</span>
    </>
  );

  if (showTooltips) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link href={href} className={linkClass}>
            {inner}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Link href={href} className={linkClass}>
      {inner}
    </Link>
  );
}

const SIDEBAR_SECTION_STORAGE_KEY = "admin-sidebar-sections";
/** Sections that can be collapsed; Overview and People stay expanded. */
const COLLAPSIBLE_SECTION_IDS = ["leave", "welfare", "events", "food"] as const;
type CollapsibleSectionId = (typeof COLLAPSIBLE_SECTION_IDS)[number];

function defaultCollapsibleOpenState(): Record<CollapsibleSectionId, boolean> {
  return {
    leave: true,
    welfare: true,
    events: true,
    food: true,
  };
}

function StaticNavSection({
  title,
  accent,
  collapsed,
  isMd,
  children,
}: {
  title: string;
  accent?: boolean;
  collapsed: boolean;
  isMd: boolean;
  children: ReactNode;
}) {
  const railMode = collapsed && isMd;

  if (railMode) {
    return <div className="space-y-1">{children}</div>;
  }

  return (
    <div className="space-y-1">
      <p
        className={cn(
          "mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.15em]",
          accent
            ? "text-primary"
            : "text-slate-400 dark:text-slate-500"
        )}
      >
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function CollapsibleNavSection({
  sectionId,
  title,
  accent,
  collapsed,
  isMd,
  open,
  onToggle,
  children,
}: {
  sectionId: CollapsibleSectionId;
  title: string;
  accent?: boolean;
  collapsed: boolean;
  isMd: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const railMode = collapsed && isMd;

  if (railMode) {
    return <div className="space-y-1">{children}</div>;
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        id={`sidebar-section-trigger-${sectionId}`}
        aria-expanded={open}
        aria-controls={`sidebar-section-panel-${sectionId}`}
        onClick={onToggle}
        className={cn(
          "mb-1 flex w-full items-center justify-between gap-2 rounded-lg px-4 py-1.5 text-left transition-colors",
          "hover:bg-primary/5 dark:hover:bg-primary/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
        )}
      >
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.15em]",
            accent
              ? "text-primary"
              : "text-slate-400 dark:text-slate-500"
          )}
        >
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-500",
            open ? "rotate-180" : "rotate-0"
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={`sidebar-section-panel-${sectionId}`}
          role="region"
          aria-labelledby={`sidebar-section-trigger-${sectionId}`}
          className="space-y-1"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar({
  isOpen = false,
  onClose,
  userRole = "EMPLOYEE",
  collapsed = false,
}: SidebarProps) {
  const pathName = usePathname();
  const [isMd, setIsMd] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(defaultCollapsibleOpenState);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsMd(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SIDEBAR_SECTION_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      setSectionOpen((prev) => {
        const next = { ...prev };
        for (const id of COLLAPSIBLE_SECTION_IDS) {
          if (typeof parsed[id] === "boolean") next[id] = parsed[id];
        }
        return next;
      });
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSection = (id: CollapsibleSectionId) => {
    setSectionOpen((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(SIDEBAR_SECTION_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const showTooltips = collapsed && isMd;

  const isActive = (href: string) => {
    if (href === "/admin") return pathName === "/admin";
    return pathName === href || pathName.startsWith(`${href}/`);
  };

  const peopleSectionActive =
    isActive("/admin/employees") ||
    isActive("/admin/clients") ||
    isActive("/admin/leave-management/departments");

  const leaveManagementActive = isActive("/admin/leave-management");

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <TooltipProvider delayDuration={showTooltips ? 0 : 300}>
        <div
          className={cn(
            "flex h-dvh shrink-0 flex-col overflow-hidden border-r border-primary/10 bg-white dark:bg-zinc-950/60",
            "w-72 transition-[width] motion-safe:duration-300 motion-safe:ease-in-out",
            "fixed left-0 top-0 z-50 h-dvh md:relative md:top-auto md:left-auto md:h-full md:max-h-none md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full",
            collapsed ? "md:w-16" : "md:w-72"
          )}
        >
          <div
            className={cn(
              "p-6 flex items-center gap-2 shrink-0 min-h-[4.5rem] border-b border-primary/5",
              collapsed && "md:px-3"
            )}
          >
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shrink-0">
              <Calendar size={20} />
            </div>
            <h1
              className={cn(
                "font-bold text-sm tracking-wider uppercase text-slate-700 dark:text-slate-200 truncate flex-1 min-w-0",
                collapsed && "md:hidden"
              )}
            >
              HR Portal
            </h1>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors md:hidden text-slate-600 dark:text-slate-400 ml-auto shrink-0"
              aria-label="Close sidebar"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 pb-6 space-y-6 overflow-y-auto overflow-x-hidden">
            {(hasPermission(userRole, "view_dashboard") ||
              hasPermission(userRole, "view_policies") ||
              hasPermission(userRole, "view_reports") ||
              hasPermission(userRole, "view_analytics") ||
              hasPermission(userRole, "view_conference_rooms")) && (
              <StaticNavSection title="Overview" collapsed={collapsed} isMd={isMd}>
                {hasPermission(userRole, "view_dashboard") && (
                  <NavItem
                    href="/admin"
                    label="Dashboard"
                    icon={Home}
                    active={isActive("/admin")}
                    collapsed={collapsed}
                    showTooltips={showTooltips}
                  />
                )}
                {hasPermission(userRole, "view_policies") && (
                  <NavItem
                    href="/admin/policies"
                    label="Policies"
                    icon={BookOpen}
                    active={isActive("/admin/policies")}
                    collapsed={collapsed}
                    showTooltips={showTooltips}
                  />
                )}
                {hasPermission(userRole, "view_reports") && (
                  <NavItem
                    href="/admin/reports"
                    label="Reports"
                    icon={ChartBar}
                    active={isActive("/admin/reports")}
                    collapsed={collapsed}
                    showTooltips={showTooltips}
                  />
                )}
                {hasPermission(userRole, "view_analytics") && (
                  <NavItem
                    href="/admin/analytics"
                    label="Analytics"
                    icon={BarChart}
                    active={isActive("/admin/analytics")}
                    collapsed={collapsed}
                    showTooltips={showTooltips}
                  />
                )}
                {hasPermission(userRole, "view_conference_rooms") && (
                  <NavItem
                    href="/admin/conference-rooms"
                    label="Bookings"
                    icon={DoorOpen}
                    active={isActive("/admin/conference-rooms")}
                    collapsed={collapsed}
                    showTooltips={showTooltips}
                  />
                )}
              </StaticNavSection>
            )}

            {hasPermission(userRole, "view_employees") && (
              <StaticNavSection
                title="People"
                accent={peopleSectionActive}
                collapsed={collapsed}
                isMd={isMd}
              >
                <NavItem
                  href="/admin/employees"
                  label="Employees"
                  icon={Users}
                  active={isActive("/admin/employees")}
                  collapsed={collapsed}
                  showTooltips={showTooltips}
                />
                <NavItem
                  href="/admin/clients"
                  label="Clients"
                  icon={Store}
                  active={isActive("/admin/clients")}
                  collapsed={collapsed}
                  showTooltips={showTooltips}
                />
                <NavItem
                  href="/admin/leave-management/departments"
                  label="Departments"
                  icon={Building2}
                  active={isActive("/admin/leave-management/departments")}
                  collapsed={collapsed}
                  showTooltips={showTooltips}
                />
              </StaticNavSection>
            )}

            {hasPermission(userRole, "view_employees") && (
              <CollapsibleNavSection
                sectionId="leave"
                title="Leave Management"
                accent={leaveManagementActive}
                collapsed={collapsed}
                isMd={isMd}
                open={sectionOpen.leave}
                onToggle={() => toggleSection("leave")}
              >
                <NavItem
                  href="/admin/leave-management/create"
                  label="Leave Types"
                  icon={Layers}
                  active={isActive("/admin/leave-management/create")}
                  collapsed={collapsed}
                  showTooltips={showTooltips}
                />
                <NavItem
                  href="/admin/leave-management/calendar"
                  label="Leave Calendar"
                  icon={Calendar}
                  active={isActive("/admin/leave-management/calendar")}
                  collapsed={collapsed}
                  showTooltips={showTooltips}
                />
                <NavItem
                  href="/admin/leave-management/leaves"
                  label="Leave"
                  icon={CalendarDays}
                  active={isActive("/admin/leave-management/leaves")}
                  collapsed={collapsed}
                  showTooltips={showTooltips}
                />
                <NavItem
                  href="/admin/leave-management/requests"
                  label="Leave Requests"
                  icon={Inbox}
                  active={isActive("/admin/leave-management/requests")}
                  collapsed={collapsed}
                  showTooltips={showTooltips}
                />
              </CollapsibleNavSection>
            )}

            {(hasPermission(userRole, "view_contributions") ||
              hasPermission(userRole, "manage_contributions") ||
              hasPermission(userRole, "view_expenses") ||
              hasPermission(userRole, "manage_expenses")) && (
              <CollapsibleNavSection
                sectionId="welfare"
                title="Welfare"
                collapsed={collapsed}
                isMd={isMd}
                open={sectionOpen.welfare}
                onToggle={() => toggleSection("welfare")}
              >
                {hasPermission(userRole, "view_contributions") && (
                  <NavItem
                    href="/admin/contribution"
                    label="Contributors"
                    icon={ListCheckIcon}
                    active={isActive("/admin/contribution")}
                    collapsed={collapsed}
                    showTooltips={showTooltips}
                  />
                )}
                {hasPermission(userRole, "view_expenses") && (
                  <NavItem
                    href="/admin/expenses"
                    label="Expenses"
                    icon={FileText}
                    active={isActive("/admin/expenses")}
                    collapsed={collapsed}
                    showTooltips={showTooltips}
                  />
                )}
              </CollapsibleNavSection>
            )}

            {hasPermission(userRole, "view_events") && (
              <CollapsibleNavSection
                sectionId="events"
                title="Events"
                collapsed={collapsed}
                isMd={isMd}
                open={sectionOpen.events}
                onToggle={() => toggleSection("events")}
              >
                <NavItem
                  href="/admin/events"
                  label="Events"
                  icon={Calendar}
                  active={isActive("/admin/events")}
                  collapsed={collapsed}
                  showTooltips={showTooltips}
                />
              </CollapsibleNavSection>
            )}

            {hasPermission(userRole, "view_food_management") && (
              <CollapsibleNavSection
                sectionId="food"
                title="Food Management"
                accent={isActive("/admin/food-management")}
                collapsed={collapsed}
                isMd={isMd}
                open={sectionOpen.food}
                onToggle={() => toggleSection("food")}
              >
                {hasPermission(userRole, "manage_food_vendors") && (
                  <NavItem
                    href="/admin/food-management/vendors"
                    label="Food Vendors"
                    icon={Store}
                    active={isActive("/admin/food-management/vendors")}
                    collapsed={collapsed}
                    showTooltips={showTooltips}
                  />
                )}
                {hasPermission(userRole, "manage_food_vendors") && (
                  <NavItem
                    href="/admin/food-management/foods"
                    label="Food Items"
                    icon={UtensilsCrossed}
                    active={isActive("/admin/food-management/foods")}
                    collapsed={collapsed}
                    showTooltips={showTooltips}
                  />
                )}
                {hasPermission(userRole, "manage_food_menus") && (
                  <NavItem
                    href="/admin/food-management/menus"
                    label="Weekly Menus"
                    icon={MenuSquare}
                    active={isActive("/admin/food-management/menus")}
                    collapsed={collapsed}
                    showTooltips={showTooltips}
                  />
                )}
              </CollapsibleNavSection>
            )}
          </nav>

          <div className="p-4 border-t border-primary/10 shrink-0">
            {showTooltips ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg cursor-default",
                      collapsed && "md:justify-center md:px-2"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Settings size={16} />
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium text-slate-600 dark:text-slate-400",
                        collapsed && "md:sr-only"
                      )}
                    >
                      Settings
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Settings
                </TooltipContent>
              </Tooltip>
            ) : (
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  collapsed && "md:justify-center md:px-2"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Settings size={16} />
                </div>
                <span
                  className={cn(
                    "text-sm font-medium text-slate-600 dark:text-slate-400",
                    collapsed && "md:sr-only"
                  )}
                >
                  Settings
                </span>
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    </>
  );
}
