import Link from "next/link";

import { registerAction } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth-card";
import { Notice } from "@/components/notice";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return (
    <AuthCard title="Crea tu cuenta" subtitle="Empieza con una cuenta privada para probar DayRank con amigos.">
      <form action={registerAction} className="space-y-4">
        <Notice error={params.error} />
        <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Nombre</span>
          <input
            autoComplete="name"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            maxLength={80}
            minLength={2}
            name="name"
            placeholder="Tu nombre"
            required
            type="text"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Username</span>
          <input
            autoComplete="username"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            maxLength={20}
            minLength={3}
            name="username"
            pattern="[a-zA-Z0-9_]{3,20}"
            placeholder="dayranker"
            required
            type="text"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Email</span>
          <input
            autoComplete="email"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            name="email"
            placeholder="tu@email.com"
            required
            type="email"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Contraseña</span>
          <input
            autoComplete="new-password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            minLength={8}
            name="password"
            placeholder="Mínimo 8 caracteres"
            required
            type="password"
          />
        </label>
        <button className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500" type="submit">
          Crear cuenta
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        ¿Ya tienes cuenta? {" "}
        <Link className="font-semibold text-indigo-600 dark:text-indigo-300" href="/login">
          Inicia sesión
        </Link>
      </p>
    </AuthCard>
  );
}
