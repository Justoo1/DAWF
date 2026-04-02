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

function SectionLabel({
  children,
  collapsed,
  accent,
}: {
  children: ReactNode;
  collapsed: boolean;
  accent?: boolean;
}) {
  return (
    <p
      className={cn(
        "px-4 text-[10px] font-bold uppercase tracking-[0.15em] mb-2 transition-opacity motion-safe:duration-200",
        accent
          ? "text-primary"
          : "text-slate-400 dark:text-slate-500",
        collapsed && "md:sr-only md:h-0 md:mb-0 md:overflow-hidden md:opacity-0"
      )}
    >
      {children}
    </p>
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

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsMd(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const showTooltips = collapsed && isMd;

  const isActive = (href: string) => {
    if (href === "/admin") return pathName === "/admin";
    return pathName === href || pathName.startsWith(`${href}/`);
  };

  const peopleSectionActive =
    isActive("/admin/employees") ||
    isActive("/admin/leave-management/departments");

  const leaveManagementActive =
    isActive("/admin/leave-management") || isActive("/admin/manage-employees");

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
            "w-72 shrink-0 border-r border-primary/10 bg-white dark:bg-zinc-950/60 flex flex-col h-full overflow-hidden",
            "transition-[width] motion-safe:duration-300 motion-safe:ease-in-out",
            "fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0",
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
              <div>
                <div className="space-y-1">
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
                </div>
              </div>
            )}

            {hasPermission(userRole, "view_employees") && (
              <div>
                <SectionLabel collapsed={collapsed} accent={peopleSectionActive}>
                  People
                </SectionLabel>
                <div className="space-y-1">
                  <NavItem
                    href="/admin/employees"
                    label="Employees"
                    icon={Users}
                    active={isActive("/admin/employees")}
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
                </div>
              </div>
            )}

            {hasPermission(userRole, "view_employees") && (
              <div>
                <SectionLabel collapsed={collapsed} accent={leaveManagementActive}>
                  Leave Management
                </SectionLabel>
                <div className="space-y-1">
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
                    href="/admin/manage-employees"
                    label="Leaves"
                    icon={CalendarDays}
                    active={isActive("/admin/manage-employees")}
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
                </div>
              </div>
            )}

            {(hasPermission(userRole, "view_contributions") ||
              hasPermission(userRole, "manage_contributions") ||
              hasPermission(userRole, "view_expenses") ||
              hasPermission(userRole, "manage_expenses")) && (
              <div>
                <SectionLabel collapsed={collapsed}>Welfare</SectionLabel>
                <div className="space-y-1">
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
                </div>
              </div>
            )}

            {hasPermission(userRole, "view_events") && (
              <div>
                <SectionLabel collapsed={collapsed}>Events</SectionLabel>
                <div className="space-y-1">
                  <NavItem
                    href="/admin/events"
                    label="Events"
                    icon={Calendar}
                    active={isActive("/admin/events")}
                    collapsed={collapsed}
                    showTooltips={showTooltips}
                  />
                </div>
              </div>
            )}

            {hasPermission(userRole, "view_food_management") && (
              <div>
                <SectionLabel
                  collapsed={collapsed}
                  accent={isActive("/admin/food-management")}
                >
                  Food Management
                </SectionLabel>
                <div className="space-y-1">
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
                </div>
              </div>
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
