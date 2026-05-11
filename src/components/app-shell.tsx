"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";

import { Brand } from "@/components/brand";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-6">
      <header className="mb-8 flex items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <Brand />

        <nav className="flex items-center gap-3 text-sm font-semibold">
          <Link className="text-slate-700 hover:text-indigo-600 dark:text-slate-200" href="/dashboard">
            Inicio
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Salir
          </button>
        </nav>
      </header>

      {children}
    </main>
  );
}