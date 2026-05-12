"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Camera,
  Home,
  Search,
  User,
  type LucideIcon,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  unreadNotificationsCount?: number;
};

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  activePrefixes?: string[];
  featured?: boolean;
};

const appNavItems: NavItem[] = [
  { href: "/feed", label: "Inicio", icon: Home },
  { href: "/friends", label: "Buscar", icon: Search },
  {
    href: "/day",
    label: "Daily",
    icon: Camera,
    activePrefixes: ["/day", "/posts"],
  },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/notifications", label: "Avisos", icon: Bell },
  { href: "/profile", label: "Perfil", icon: User },
];

const mobileNavItems: NavItem[] = [
  { href: "/friends", label: "Buscar", icon: Search },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/feed", label: "Inicio", icon: Home, featured: true },
  { href: "/notifications", label: "Avisos", icon: Bell },
  { href: "/profile", label: "Perfil", icon: User },
];

export function AppShell({
  children,
  unreadNotificationsCount = 0,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-32 pt-4 sm:px-5 sm:pb-10 sm:pt-6">
      <header className="sticky top-0 z-30 -mx-4 mb-5 border-b border-slate-200/80 bg-slate-50/90 px-4 py-3 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/90 sm:static sm:mx-0 sm:mb-8 sm:rounded-[2rem] sm:border sm:bg-white/80 sm:px-5 dark:sm:bg-slate-950/80">
        <div className="flex items-center justify-between gap-3">
          <Brand />

          <nav className="hidden items-center gap-2 text-sm font-semibold sm:flex">
            {appNavItems
              .filter((item) => item.href !== "/notifications")
              .map((item) => {
                const Icon = item.icon;
                const isActive = item.activePrefixes
                  ? item.activePrefixes.some((prefix) =>
                      pathname.startsWith(prefix),
                    )
                  : pathname === item.href;

                return (
                  <Link
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-slate-900",
                      isActive &&
                        "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200",
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    <Icon className="size-4" /> {item.label}
                  </Link>
                );
              })}
          </nav>

          <NotificationBell count={unreadNotificationsCount} />
        </div>
      </header>

      {children}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-2xl shadow-slate-950/10 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.activePrefixes
              ? item.activePrefixes.some((prefix) =>
                  pathname.startsWith(prefix),
                )
              : pathname === item.href;

            return (
              <Link
                aria-label={item.label}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-slate-500 transition active:scale-95 dark:text-slate-400",
                  item.featured &&
                    "-mt-8 mx-auto size-16 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 dark:bg-indigo-500",
                  isActive &&
                    !item.featured &&
                    "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200",
                  isActive &&
                    item.featured &&
                    "ring-4 ring-indigo-200 dark:ring-indigo-900",
                )}
                href={item.href}
                key={item.href}
              >
                <Icon className={cn("size-5", item.featured && "size-7")} />
                <span className="sr-only">{item.label}</span>
                {item.href === "/notifications" &&
                unreadNotificationsCount > 0 ? (
                  <Badge count={unreadNotificationsCount} compact />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}

function NotificationBell({ count }: { count: number }) {
  return (
    <Link
      aria-label={
        count > 0 ? `${count} notificaciones sin leer` : "Notificaciones"
      }
      className="relative inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-indigo-300"
      href="/notifications"
    >
      <Bell className="size-5" />
      {count > 0 ? <Badge count={count} /> : null}
    </Link>
  );
}

function Badge({
  count,
  compact = false,
}: {
  count: number;
  compact?: boolean;
}) {
  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className={cn(
        "absolute min-w-5 rounded-full bg-rose-600 px-1.5 text-center text-[0.65rem] font-black leading-5 text-white ring-2 ring-white dark:ring-slate-950",
        compact ? "right-1 top-1" : "-right-1 -top-1",
      )}
    >
      {label}
    </span>
  );
}
