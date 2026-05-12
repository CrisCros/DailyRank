import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarDays, Mail, Settings, UserRound, Users, UserPlus, Send } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { acceptFriendRequestAction, rejectFriendRequestAction } from "@/app/actions/friendships";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { LogoutButton } from "@/components/logout-button";
import { SubmitButton } from "@/components/submit-button";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, incomingRequests, outgoingRequests, friendships, unreadNotificationsCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, username: true, email: true, bio: true, createdAt: true, settings: { select: { theme: true } } },
    }),
    prisma.friendship.findMany({
      where: { receiverId: session.user.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, requester: { select: { name: true, username: true } } },
    }),
    prisma.friendship.findMany({
      where: { requesterId: session.user.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, receiver: { select: { name: true, username: true } } },
    }),
    prisma.friendship.findMany({
      where: { status: "ACCEPTED", OR: [{ requesterId: session.user.id }, { receiverId: session.user.id }] },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        requesterId: true,
        requester: { select: { name: true, username: true } },
        receiver: { select: { name: true, username: true } },
      },
      take: 6,
    }),
    prisma.notification.count({ where: { recipientId: session.user.id, readAt: null } }),
  ]);

  if (!user) {
    redirect("/login");
  }

  const joinedAt = new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric" }).format(user.createdAt);
  const friends = friendships.map((friendship) => (friendship.requesterId === session.user.id ? friendship.receiver : friendship.requester));

  return (
    <AppShell unreadNotificationsCount={unreadNotificationsCount}>
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500" />
          <div className="px-6 pb-6">
            <div className="-mt-12 flex items-end justify-between gap-4">
              <div className="flex size-24 items-center justify-center rounded-[2rem] border-4 border-white bg-slate-950 text-3xl font-black text-white shadow-lg dark:border-slate-950 dark:bg-white dark:text-slate-950">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <Link aria-label="Configuración" className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200" href="/settings">
                <Settings className="size-5" />
              </Link>
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Perfil</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{user.name}</h1>
                <p className="mt-1 text-slate-600 dark:text-slate-300">@{user.username}</p>
              </div>
              <LogoutButton />
            </div>

            <p className="mt-6 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">{user.bio ?? "Este usuario todavía no ha añadido una biografía."}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <ProfileInfo icon={<UserRound className="size-5" />} title="Username" text={`@${user.username}`} />
          <ProfileInfo icon={<Mail className="size-5" />} title="Email" text={user.email} />
          <ProfileInfo icon={<CalendarDays className="size-5" />} title="Miembro desde" text={joinedAt} />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white"><UserPlus className="size-5" /> Solicitudes recibidas</h2>
            {incomingRequests.length === 0 ? <EmptyState>No tienes solicitudes pendientes.</EmptyState> : null}
            {incomingRequests.map((request) => (
              <article className="space-y-3 rounded-3xl border border-slate-200 p-4 dark:border-slate-800" key={request.id}>
                <UserIdentity user={request.requester} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <form action={acceptFriendRequestAction}><input name="friendshipId" type="hidden" value={request.id} /><SubmitButton pendingText="Aceptando...">Aceptar</SubmitButton></form>
                  <form action={rejectFriendRequestAction}><input name="friendshipId" type="hidden" value={request.id} /><SubmitButton pendingText="Rechazando...">Rechazar</SubmitButton></form>
                </div>
              </article>
            ))}
          </section>

          <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white"><Send className="size-5" /> Solicitudes enviadas</h2>
            {outgoingRequests.length === 0 ? <EmptyState>No tienes solicitudes enviadas pendientes.</EmptyState> : null}
            {outgoingRequests.map((request) => <article className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800" key={request.id}><UserIdentity user={request.receiver} /><p className="mt-3 text-sm font-semibold text-amber-700 dark:text-amber-200">Pendiente de respuesta.</p></article>)}
          </section>
        </div>

        <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white"><Users className="size-5" /> Amigos</h2>
            <Link className="text-sm font-black text-indigo-600 dark:text-indigo-300" href="/friends">Ver/buscar</Link>
          </div>
          {friends.length === 0 ? <EmptyState>Todavía no tienes amigos aceptados.</EmptyState> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {friends.map((friend) => <article className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800" key={friend.username}><UserIdentity user={friend} /></article>)}
          </div>
        </section>
      </section>
    </AppShell>
  );
}

function ProfileInfo({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"><div className="text-indigo-600 dark:text-indigo-300">{icon}</div><h2 className="mt-4 font-bold text-slate-950 dark:text-white">{title}</h2><p className="mt-2 break-all text-sm text-slate-600 dark:text-slate-300">{text}</p></article>;
}

function UserIdentity({ user }: { user: { name: string; username: string } }) {
  return <div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-full bg-indigo-100 font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{user.name.charAt(0).toUpperCase()}</div><div><p className="font-black text-slate-950 dark:text-white">{user.name}</p><p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p></div></div>;
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-3xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{children}</p>;
}
