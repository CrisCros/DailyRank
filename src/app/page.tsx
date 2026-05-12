import Link from "next/link";
import { ArrowRight, Lock, Smartphone, Users, type LucideIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { Brand } from "@/components/brand";

const featureCards: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Smartphone, title: "Mobile-first", text: "Interfaz cómoda para probar desde el móvil." },
  { icon: Lock, title: "Autenticación segura", text: "Credenciales validadas, hash de contraseña y sesiones protegidas." },
  { icon: Users, title: "Base social privada", text: "Arquitectura preparada para amigos, feed y estadísticas." }
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/feed");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6">
      <header className="flex items-center justify-between gap-4">
        <Brand />
        <Link
          className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:!text-slate-950 dark:hover:bg-slate-200"
          href="/login"
        >
          Login
        </Link>
      </header>

      <section className="grid flex-1 items-center gap-10 py-14 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-7">
          <div className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200">
            MVP privado para probar con amigos
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-6xl">
              Puntúa tu día. Comparte el ranking de tu vida real.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
              DayRank empieza como una web mobile-first segura: registro, login y rutas privadas listos para construir el feed social en siguientes fases.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-500"
              href="/register"
            >
              Crear cuenta <ArrowRight className="size-4" />
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              href="/login"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-950">
          <div className="space-y-4 rounded-[1.5rem] bg-slate-50 p-4 dark:bg-slate-900">
            {featureCards.map(({ icon: Icon, title, text }) => (
              <div className="flex gap-4 rounded-2xl bg-white p-4 dark:bg-slate-950" key={title}>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950 dark:text-white">{title}</h2>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}