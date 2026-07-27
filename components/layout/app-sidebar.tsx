"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  Package,
  BarChart3,
  Settings as SettingsIcon,
  Laptop,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserSwitcher } from "@/components/layout/user-switcher";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  itOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/requests", label: "Requests", icon: ListChecks },
  { href: "/requests/new", label: "New Request", icon: PlusCircle, exact: true },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: SettingsIcon, itOnly: true },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarBrand() {
  return (
    <div className="flex items-center gap-2 px-6 pt-7 pb-6">
      <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Laptop className="size-5" />
      </span>
      <div>
        <h2 className="text-xl font-semibold leading-tight">Vesta</h2>
        <span className="text-xs text-sidebar-foreground/70">
          IT Equipment Ordering
        </span>
      </div>
    </div>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data } = useCurrentUser();
  const isIT = data?.currentUser.role === "IT";

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.filter((item) => !item.itOnly || isIT).map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarFooter() {
  return (
    <div className="mt-auto border-t border-sidebar-border p-3">
      <div className="mb-1 flex items-center justify-between px-2">
        <span className="text-xs font-medium uppercase tracking-wide text-sidebar-foreground/60">
          Preferences
        </span>
        <ThemeToggle />
      </div>
      <UserSwitcher />
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col overflow-y-auto bg-sidebar text-sidebar-foreground md:flex">
      <SidebarBrand />
      <SidebarNav />
      <SidebarFooter />
    </aside>
  );
}
