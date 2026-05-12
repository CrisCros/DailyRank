import { Bell, UserPlus, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { markNotificationsAsReadAction } from "@/app/actions/notifications";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { SubmitButton } from "@/components/submit-button";
import { formatDateTime } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const notificationCopy = {
  FRIEND_REQUEST_RECEIVED: {
    icon: UserPlus,
    title: "Solicitud de amistad recibida",
    text: "quiere ser tu amigo/a en DayRank.",
  },
  FRIEND_REQUEST_ACCEPTED: {
    icon: Users,
    title: "Solicitud aceptada",
    text: "aceptó tu solicitud de amistad.",
  },
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        readAt: true,
        createdAt: true,
        actor: { select: { name: true, username: true } },
      },
    }),
    prisma.notification.count({ where: { recipientId: session.user.id, readAt: null } }),
  ]);

  return (
    <AppShell unreadNotificationsCount={unreadCount}>
      <section className="mx-auto max-w-3xl space-y-5">
        <div className="flex items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
              <Bell className="size-4" /> Notificaciones
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Actividad reciente</h1>
          </div>
          {unreadCount > 0 ? (
            <form action={markNotificationsAsReadAction} className="shrink-0">
              <SubmitButton pendingText="Marcando...">Marcar leídas</SubmitButton>
            </form>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto size-10 text-slate-400" />
              <h2 className="mt-4 text-xl font-black text-slate-950 dark:text-white">Sin notificaciones todavía</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Aquí aparecerán solicitudes de amistad y amistades aceptadas.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((notification) => {
                const copy = notificationCopy[notification.type];
                const Icon = copy.icon;
                return (
                  <article className="flex gap-4 p-5" key={notification.id}>
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-200">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="font-black text-slate-950 dark:text-white">{copy.title}</h2>
                        {!notification.readAt ? <span className="mt-1 size-2 rounded-full bg-rose-500" aria-label="Sin leer" /> : null}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        <strong>{notification.actor.name}</strong> @{notification.actor.username} {copy.text}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{formatDateTime(notification.createdAt)}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
