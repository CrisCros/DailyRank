"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/70 dark:bg-slate-950 dark:text-rose-200 dark:hover:bg-rose-950/40 sm:w-auto"
      onClick={() => signOut({ callbackUrl: "/login" })}
      type="button"
    >
      <LogOut className="size-4" /> Cerrar sesión
    </button>
  );
}
