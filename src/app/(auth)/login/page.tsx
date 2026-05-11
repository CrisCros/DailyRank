import Link from "next/link";

import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "@/components/login-form";

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
      <LoginForm error={params.error} success={params.success} />

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        ¿No tienes cuenta?{" "}
        <Link className="font-semibold text-indigo-600 dark:text-indigo-300" href="/register">
          Regístrate
        </Link>
      </p>
    </AuthCard>
  );
}