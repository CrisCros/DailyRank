import Link from "next/link";

import { loginAction } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth-card";
import { Notice } from "@/components/notice";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthCard title="Inicia sesión" subtitle="Accede a tu espacio privado de DayRank.">
      <form action={loginAction} className="space-y-4">
        <Notice error={params.error} success={params.success} />
        <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Email o username</span>
          <input
            autoComplete="username"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            name="identifier"
            placeholder="tu@email.com o username"
            required
            type="text"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Contraseña</span>
          <input
            autoComplete="current-password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            name="password"
            placeholder="••••••••"
            required
            type="password"
          />
        </label>
        <button className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500" type="submit">
          Entrar
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        ¿No tienes cuenta? {" "}
        <Link className="font-semibold text-indigo-600 dark:text-indigo-300" href="/register">
          Regístrate
        </Link>
      </p>
    </AuthCard>
  );
}
