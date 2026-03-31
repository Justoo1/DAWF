"use client"

import Link from "next/link";
import ProfileMenu from "../shared/ProfileMenu";
import { ChevronLeft, ChevronRight, Menu, Settings, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { fetchUserWithContributions } from "@/lib/actions/users.action";
import { UserValues } from "@/lib/validation";
import { AdminSearchField } from "@/components/admin/layout/AdminSearchField";
import NotificationBell from "@/components/shared/NotificationBell";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
  /** When true, desktop sidebar is in icon-only rail mode */
  sidebarCollapsed?: boolean;
  /** Toggle expand/collapse on desktop (md+); no-op if omitted */
  onToggleSidebarCollapse?: () => void;
}

const Header = ({
  onMenuClick,
  sidebarCollapsed = false,
  onToggleSidebarCollapse,
}: HeaderProps) => {
  const { data: session } = authClient.useSession();
  const [userInfo, setUserInfo] = useState<UserValues | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      if (session?.user?.email) {
        const data = await fetchUserWithContributions(session.user.email);
        if (data.success && data.user) {
          setUserInfo(data.user);
        }
      }
    };
    loadUser();
  }, [session]);

  return (
    <header
      className="sticky top-0 z-40 shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-md py-3 px-4 sm:px-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
            type="button"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-foreground" />
          </button>
          {onToggleSidebarCollapse && (
            <button
              type="button"
              onClick={onToggleSidebarCollapse}
              className="hidden md:inline-flex p-2 rounded-lg hover:bg-muted transition-colors shrink-0 text-foreground border border-border/60 bg-muted/30 shadow-sm"
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              title={
                sidebarCollapsed ? "Show sidebar labels" : "Hide sidebar labels"
              }
            >
              {sidebarCollapsed ? (
                <ChevronRight size={18} aria-hidden />
              ) : (
                <ChevronLeft size={18} aria-hidden />
              )}
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-sm">
            <Link
              href="/admin"
              className="font-medium text-muted-foreground hover:text-primary transition-colors truncate"
            >
              Admin Dashboard
            </Link>
            <div className="h-4 w-px bg-border/60 rotate-12" />
            <Link
              href="/"
              className="font-medium text-foreground hover:text-primary transition-colors truncate"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center px-4 md:px-8">
          <div className="w-full max-w-4xl hidden sm:block">
            <AdminSearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search employees, departments, policies..."
              className="w-full"
            />
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-end gap-1 sm:gap-2 min-w-[3rem]">
          <div className="hidden sm:flex items-center gap-1">
            <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10 text-foreground transition-colors text-slate-500">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10 text-foreground transition-colors text-slate-500">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          {userInfo?.id && (
            <div className="hidden sm:flex">
              <NotificationBell userId={userInfo.id} />
            </div>
          )}
          <div className="pl-2 border-l border-border/40 ml-1">
            {userInfo && <ProfileMenu user={userInfo} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
