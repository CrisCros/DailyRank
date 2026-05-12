import Link from "next/link";
import {
  Ban,
  CalendarDays,
  Shield,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { blockUserAction } from "@/app/actions/blocks";
import {
  acceptFriendRequestAction,
  removeFriendAction,
  sendFriendRequestAction,
} from "@/app/actions/friendships";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { UserAvatar } from "@/components/user-avatar";
import { friendshipPairKey } from "@/lib/friendships";
import { prisma } from "@/lib/prisma";

type PublicUserPageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicUserPage({
  params,
  searchParams,
}: PublicUserPageProps) {
  const [session, routeParams, query] = await Promise.all([
    getServerSession(authOptions),
    params,
    searchParams,
  ]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.user.findUnique({
    where: { username: routeParams.username },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      image: true,
      createdAt: true,
    },
  });

  if (!profile) {
    return <UnavailableProfile />;
  }

  if (profile.id === session.user.id) {
    redirect("/profile");
  }

  const [blockingRelation, friendship, unreadNotificationsCount] =
    await Promise.all([
      prisma.userBlock.findFirst({
        where: {
          OR: [
            { blockerId: session.user.id, blockedId: profile.id },
            { blockerId: profile.id, blockedId: session.user.id },
          ],
        },
        select: { blockerId: true },
      }),
      prisma.friendship.findUnique({
        where: { pairKey: friendshipPairKey(session.user.id, profile.id) },
        select: { id: true, requesterId: true, receiverId: true, status: true },
      }),
      prisma.notification.count({ where: { recipientId: session.user.id } }),
    ]);

  if (blockingRelation) {
    return (
      <UnavailableProfile unreadNotificationsCount={unreadNotificationsCount} />
    );
  }

  const joinedAt = new Intl.DateTimeFormat("es", {
    month: "long",
    year: "numeric",
  }).format(profile.createdAt);
  const returnTo = `/users/${profile.username}`;

  return (
    <AppShell unreadNotificationsCount={unreadNotificationsCount}>
      <section className="mx-auto max-w-3xl space-y-5">
        <Notice error={query.error} success={query.success} />

        <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500" />
          <div className="px-6 pb-6">
            <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <UserAvatar
                className="rounded-[2rem] border-4 border-white shadow-lg dark:border-slate-950"
                size="xl"
                user={profile}
              />
              <FriendshipAction
                currentUserId={session.user.id}
                friendship={friendship}
                profileId={profile.id}
                returnTo={returnTo}
              />
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                Perfil público
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {profile.name}
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                @{profile.username}
              </p>
              <p className="mt-5 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
                {profile.bio ??
                  "Este usuario todavía no ha añadido una biografía."}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <CalendarDays className="size-5 text-indigo-600 dark:text-indigo-300" />
                <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                  En DayRank desde
                </p>
                <p className="mt-1 font-black capitalize text-slate-950 dark:text-white">
                  {joinedAt}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <Shield className="size-5 text-indigo-600 dark:text-indigo-300" />
                <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                  Privacidad
                </p>
                <p className="mt-1 font-black text-slate-950 dark:text-white">
                  Sin email ni datos privados
                </p>
              </div>
            </div>

            <details className="mt-6 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
              <summary className="cursor-pointer text-sm font-black text-slate-700 dark:text-slate-200">
                Opciones secundarias
              </summary>
              <form action={blockUserAction} className="mt-4">
                <input name="userId" type="hidden" value={profile.id} />
                <input name="returnTo" type="hidden" value={returnTo} />
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-200 dark:hover:bg-rose-950/40"
                  type="submit"
                >
                  <Ban className="size-4" /> Bloquear usuario
                </button>
              </form>
            </details>
          </div>
        </article>
      </section>
    </AppShell>
  );
}

function FriendshipAction({
  currentUserId,
  friendship,
  profileId,
  returnTo,
}: {
  currentUserId: string;
  friendship: {
    id: string;
    requesterId: string;
    receiverId: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
  } | null;
  profileId: string;
  returnTo: string;
}) {
  if (friendship?.status === "ACCEPTED") {
    return (
      <form action={removeFriendAction}>
        <input name="friendshipId" type="hidden" value={friendship.id} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-rose-200 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-rose-300"
          type="submit"
        >
          <UserMinus className="size-4" /> Eliminar amigo
        </button>
      </form>
    );
  }

  if (
    friendship?.status === "PENDING" &&
    friendship.requesterId === currentUserId
  ) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-3 text-sm font-black text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
        <UserPlus className="size-4" /> Solicitud enviada
      </span>
    );
  }

  if (
    friendship?.status === "PENDING" &&
    friendship.receiverId === currentUserId
  ) {
    return (
      <form action={acceptFriendRequestAction}>
        <input name="friendshipId" type="hidden" value={friendship.id} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <SubmitButton pendingText="Aceptando...">
          Aceptar solicitud
        </SubmitButton>
      </form>
    );
  }

  return (
    <form action={sendFriendRequestAction}>
      <input name="receiverId" type="hidden" value={profileId} />
      <input name="returnTo" type="hidden" value={returnTo} />
      <SubmitButton pendingText="Enviando...">Solicitar amistad</SubmitButton>
    </form>
  );
}

function UnavailableProfile({
  unreadNotificationsCount = 0,
}: {
  unreadNotificationsCount?: number;
}) {
  return (
    <AppShell unreadNotificationsCount={unreadNotificationsCount}>
      <section className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
        <Users className="mx-auto size-10 text-slate-400" />
        <h1 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
          Este perfil no está disponible.
        </h1>
        <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
          Puede que no exista o que la relación de privacidad impida verlo.
        </p>
        <Link
          className="mt-5 inline-flex rounded-full bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-500"
          href="/feed"
        >
          Volver al feed
        </Link>
      </section>
    </AppShell>
  );
}
