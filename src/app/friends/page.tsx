import { Search, UserPlus, Users, X, UserMinus, Send } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { acceptFriendRequestAction, rejectFriendRequestAction, removeFriendAction, sendFriendRequestAction } from "@/app/actions/friendships";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { friendshipPairKey } from "@/lib/friendships";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type FriendsPageProps = {
  searchParams: Promise<{
    q?: string;
    error?: string;
    success?: string;
  }>;
};

type SafeUser = {
  id: string;
  name: string;
  username: string;
};

function UserIdentity({ user }: { user: SafeUser }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-base font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="font-bold text-slate-950 dark:text-white">{user.name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 p-5 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {children}
    </div>
  );
}

export default async function FriendsPage({ searchParams }: FriendsPageProps) {
  const [session, query] = await Promise.all([getServerSession(authOptions), searchParams]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const searchTerm = query.q?.trim() ?? "";
  const currentUserId = session.user.id;

  const [incomingRequests, outgoingRequests, acceptedFriendships, searchResults] = await Promise.all([
    prisma.friendship.findMany({
      where: { receiverId: currentUserId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        requesterId: true,
        receiverId: true,
        requester: { select: { id: true, name: true, username: true } },
        receiver: { select: { id: true, name: true, username: true } },
      },
    }),
    prisma.friendship.findMany({
      where: { requesterId: currentUserId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        requesterId: true,
        receiverId: true,
        requester: { select: { id: true, name: true, username: true } },
        receiver: { select: { id: true, name: true, username: true } },
      },
    }),
    prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: currentUserId }, { receiverId: currentUserId }],
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        requesterId: true,
        receiverId: true,
        requester: { select: { id: true, name: true, username: true } },
        receiver: { select: { id: true, name: true, username: true } },
      },
    }),
    searchTerm.length >= 2
      ? prisma.user.findMany({
          where: {
            id: { not: currentUserId },
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { username: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
          orderBy: [{ username: "asc" }],
          take: 10,
          select: { id: true, name: true, username: true },
        })
      : Promise.resolve([]),
  ]);

  const pairKeys = searchResults.map((user) => friendshipPairKey(currentUserId, user.id));
  const existingFriendships = pairKeys.length > 0
    ? await prisma.friendship.findMany({
        where: { pairKey: { in: pairKeys } },
        select: { pairKey: true, status: true, requesterId: true, receiverId: true },
      })
    : [];
  const friendshipByPairKey = new Map(existingFriendships.map((friendship) => [friendship.pairKey, friendship]));

  const friends = acceptedFriendships.map((friendship) => ({
    friendship,
    user: friendship.requesterId === currentUserId ? friendship.receiver : friendship.requester,
  }));

  return (
    <AppShell>
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
            <Users className="size-4" /> Amigos
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Gestiona tus amistades</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
            Busca usuarios, envía solicitudes y controla quién puede ver tus dailies con visibilidad Amigos.
          </p>
        </div>

        <Notice error={query.error} success={query.success} />

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
            <Search className="size-4" /> Buscar usuarios
          </div>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row" action="/friends">
            <input
              className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
              defaultValue={searchTerm}
              minLength={2}
              name="q"
              placeholder="Busca por nombre o username"
              type="search"
            />
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500" type="submit">
              <Search className="size-4" /> Buscar
            </button>
          </form>

          <div className="mt-5 space-y-3">
            {searchTerm.length > 0 && searchTerm.length < 2 ? <EmptyState>Escribe al menos 2 caracteres para buscar.</EmptyState> : null}
            {searchTerm.length >= 2 && searchResults.length === 0 ? <EmptyState>No encontramos usuarios con ese nombre o username.</EmptyState> : null}
            {searchResults.map((user) => {
              const friendship = friendshipByPairKey.get(friendshipPairKey(currentUserId, user.id));

              return (
                <article key={user.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <UserIdentity user={user} />
                  {friendship?.status === "ACCEPTED" ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">Ya sois amigos</span>
                  ) : friendship?.status === "PENDING" ? (
                    <span className="rounded-full bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">Solicitud pendiente</span>
                  ) : (
                    <form action={sendFriendRequestAction} className="sm:min-w-48">
                      <input name="receiverId" type="hidden" value={user.id} />
                      <SubmitButton pendingText="Enviando...">Añadir</SubmitButton>
                    </form>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white"><UserPlus className="size-5" /> Solicitudes recibidas</h2>
            {incomingRequests.length === 0 ? <EmptyState>No tienes solicitudes recibidas pendientes.</EmptyState> : null}
            {incomingRequests.map((request) => (
              <article key={request.id} className="space-y-4 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <UserIdentity user={request.requester} />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <form action={acceptFriendRequestAction} className="flex-1">
                    <input name="friendshipId" type="hidden" value={request.id} />
                    <SubmitButton pendingText="Aceptando...">Aceptar</SubmitButton>
                  </form>
                  <form action={rejectFriendRequestAction} className="flex-1">
                    <input name="friendshipId" type="hidden" value={request.id} />
                    <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-200 dark:hover:bg-rose-950/40" type="submit">
                      <X className="size-4" /> Rechazar
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </section>

          <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white"><Send className="size-5" /> Solicitudes enviadas</h2>
            {outgoingRequests.length === 0 ? <EmptyState>No tienes solicitudes enviadas pendientes.</EmptyState> : null}
            {outgoingRequests.map((request) => (
              <article key={request.id} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <UserIdentity user={request.receiver} />
                <p className="mt-3 text-sm font-semibold text-amber-700 dark:text-amber-200">Pendiente de respuesta.</p>
              </article>
            ))}
          </section>
        </div>

        <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white"><Users className="size-5" /> Lista de amigos</h2>
          {friends.length === 0 ? <EmptyState>Todavía no tienes amigos aceptados.</EmptyState> : null}
          <div className="grid gap-3 md:grid-cols-2">
            {friends.map(({ friendship, user }) => (
              <article key={friendship.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <UserIdentity user={user} />
                <form action={removeFriendAction}>
                  <input name="friendshipId" type="hidden" value={friendship.id} />
                  <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-200 dark:hover:bg-rose-950/40" type="submit">
                    <UserMinus className="size-4" /> Eliminar
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
