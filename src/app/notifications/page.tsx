import Link from "next/link";
import { Bell, Heart, MessageCircle, Reply, UserPlus, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import {
  deleteNotificationAction,
  markNotificationsAsReadAction,
} from "@/app/actions/notifications";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { SubmitButton } from "@/components/submit-button";
import { UserAvatar } from "@/components/user-avatar";
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
  POST_LIKED: {
    icon: Heart,
    title: "Like nuevo",
    text: "le dio like a tu daily.",
  },
  POST_COMMENTED: {
    icon: MessageCircle,
    title: "Comentario nuevo",
    text: "comentó en tu daily.",
  },
  COMMENT_REPLIED: {
    icon: Reply,
    title: "Respuesta nueva",
    text: "respondió a tu comentario.",
  },
  USER_MENTIONED: {
    icon: MessageCircle,
    title: "Mención nueva",
    text: "te mencionó en un comentario.",
  },
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [notifications, notificationsCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        recipientId: session.user.id,
        actor: {
          blocksCreated: { none: { blockedId: session.user.id } },
          blocksReceived: { none: { blockerId: session.user.id } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        createdAt: true,
        postId: true,
        friendshipId: true,
        actor: { select: { name: true, username: true, image: true } },
      },
    }),
    prisma.notification.count({ where: { recipientId: session.user.id } }),
  ]);

  return (
    <AppShell unreadNotificationsCount={notificationsCount}>
      <section className="mx-auto max-w-3xl space-y-5">
        <div className="flex items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
              <Bell className="size-4" /> Notificaciones
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Actividad reciente
            </h1>
          </div>
          {notificationsCount > 0 ? (
            <form action={markNotificationsAsReadAction} className="shrink-0">
              <SubmitButton pendingText="Eliminando...">
                Marcar todas como leídas
              </SubmitButton>
            </form>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto size-10 text-slate-400" />
              <h2 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
                Sin notificaciones todavía
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
Aquí aparecerán likes, comentarios, respuestas, menciones y amistades.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((notification) => {
                const copy = notificationCopy[notification.type];
                const Icon = copy.icon;
                const href = notification.postId ? `/posts/${notification.postId}` : "/friends";
                return (
                  <article className="flex gap-4 p-5" key={notification.id}>
                    <div className="relative shrink-0">
                      <UserAvatar
                        className="rounded-2xl"
                        user={notification.actor}
                      />
                      <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-indigo-600 text-white ring-2 ring-white dark:ring-slate-950">
                        <Icon className="size-3" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="font-black text-slate-950 dark:text-white">
                          {copy.title}
                        </h2>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        <strong>{notification.actor.name}</strong> @
                        {notification.actor.username} {copy.text}
                      </p>
                      <Link
                        className="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-200 dark:hover:bg-indigo-950"
                        href={href}
                      >
                        Ver actividad
                      </Link>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {formatDateTime(notification.createdAt)}
                        </p>
                        <form action={deleteNotificationAction}>
                          <input
                            name="notificationId"
                            type="hidden"
                            value={notification.id}
                          />
                          <button
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-300 dark:hover:text-indigo-300"
                            type="submit"
                          >
                            Marcar como leída
                          </button>
                        </form>
                      </div>
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
