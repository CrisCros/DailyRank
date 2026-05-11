"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Notice } from "@/components/notice";

type LoginFormProps = {
  error?: string;
  success?: string;
};

export function LoginForm({ error: initialError, success }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState(initialError);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setError(undefined);

    const formData = new FormData(event.currentTarget);

    const result = await signIn("credentials", {
      identifier: formData.get("identifier"),
      password: formData.get("password"),
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setIsLoading(false);

    if (!result || result.error) {
      setError("Email, username o contraseña incorrectos.");
      return;
    }

    router.push(result.url ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Notice error={error} success={success} />

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

      <button
        className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}