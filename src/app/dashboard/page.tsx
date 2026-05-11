import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AppShell>
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Fase 1</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Hola, {session.user.name}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
            Tu sesión privada está activa. Esta pantalla sirve como base protegida antes de construir perfiles editables, posts diarios, feed, likes, comentarios y estadísticas.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Auth", "Registro, login y logout con credenciales."],
            ["Validación", "Zod revisa entradas antes de tocar la base de datos."],
            ["Seguridad", "Contraseñas hasheadas y rutas privadas protegidas."]
          ].map(([title, text]) => (
            <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950" key={title}>
              <h2 className="font-bold text-slate-950 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
