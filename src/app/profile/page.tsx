import { CalendarDays, Mail, UserRound } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      username: true,
      email: true,
      bio: true,
      createdAt: true,
      settings: {
        select: { theme: true },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const joinedAt = new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(user.createdAt);

  return (
    <AppShell>
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500" />
          <div className="px-6 pb-6">
            <div className="-mt-12 flex size-24 items-center justify-center rounded-[2rem] border-4 border-white bg-slate-950 text-3xl font-black text-white shadow-lg dark:border-slate-950 dark:bg-white dark:text-slate-950">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                  Perfil
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                  {user.name}
                </h1>
                <p className="mt-1 text-slate-600 dark:text-slate-300">@{user.username}</p>
              </div>

              <div className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
                Tema: {user.settings?.theme === "DARK" ? "Oscuro" : user.settings?.theme === "SYSTEM" ? "Sistema" : "Claro"}
              </div>
            </div>

            <p className="mt-6 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
              {user.bio ?? "Este usuario todavía no ha añadido una biografía."}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <UserRound className="size-5 text-indigo-600 dark:text-indigo-300" />
            <h2 className="mt-4 font-bold text-slate-950 dark:text-white">Username</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">@{user.username}</p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <Mail className="size-5 text-indigo-600 dark:text-indigo-300" />
            <h2 className="mt-4 font-bold text-slate-950 dark:text-white">Email</h2>
            <p className="mt-2 break-all text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <CalendarDays className="size-5 text-indigo-600 dark:text-indigo-300" />
            <h2 className="mt-4 font-bold text-slate-950 dark:text-white">Miembro desde</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{joinedAt}</p>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
