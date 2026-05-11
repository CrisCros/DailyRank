import type { ReactNode } from "react";
import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { Brand } from "@/components/brand";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-5">
      <header className="mb-8 flex items-center justify-between gap-4 rounded-full border border-slate-200 bg-white/85 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <Brand />
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link className="rounded-full px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900" href="/dashboard">
            Inicio
          </Link>
          <form action={logoutAction}>
            <button className="rounded-full bg-slate-950 px-3 py-2 text-white dark:bg-white dark:text-slate-950" type="submit">
              Salir
            </button>
          </form>
        </nav>
      </header>
      {children}
    </main>
  );
}
