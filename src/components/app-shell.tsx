"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";

import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/feed", label: "Feed" },
  { href: "/friends", label: "Amigos" },
  { href: "/day", label: "Mi día", activePrefixes: ["/day", "/posts"] },
  { href: "/profile", label: "Perfil" },
  { href: "/settings", label: "Configuración" },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-6">
      <header className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <Brand />

        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {navItems.map((item) => {
            const isActive = item.activePrefixes
              ? item.activePrefixes.some((prefix) => pathname.startsWith(prefix))
              : pathname === item.href;

            return (
              <Link
                className={cn(
                  "rounded-full px-3 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-slate-900",
                  isActive && "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            Salir
          </button>
        </nav>
      </header>

      {children}
    </main>
  );
}
