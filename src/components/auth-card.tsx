import type { ReactNode } from "react";

import { Brand } from "@/components/brand";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-8">
      <div className="mb-8 flex justify-center">
        <Brand />
      </div>
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-950/5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85 sm:p-8">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{title}</h1>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
