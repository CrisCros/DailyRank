import Link from "next/link";
import { Camera, LockKeyhole, Search, Sparkles } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { LockedPostCard, PostCard, type LockedPostCardPost, type PostCardPost } from "@/components/post-card";
import { formatLongDate, startOfTodayUtc, startOfTomorrowUtc } from "@/lib/dates";
import { friendsOnlyAuthorWhere } from "@/lib/friendships";
import { prisma } from "@/lib/prisma";
import { formatRating } from "@/lib/ratings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FeedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const startOfToday = startOfTodayUtc();
  const startOfTomorrow = startOfTomorrowUtc();
  const todayFilter = { gte: startOfToday, lt: startOfTomorrow };

  const [todaysOwnPost, unreadNotificationsCount] = await Promise.all([
    prisma.post.findFirst({
      where: { userId: session.user.id, date: todayFilter },
      select: { id: true, title: true, rating: true, photoUrl: true, createdAt: true },
    }),
    prisma.notification.count({ where: { recipientId: session.user.id } }),
  ]);

  const isFeedUnlocked = todaysOwnPost !== null;

  const feedPosts = isFeedUnlocked
    ? await prisma.post.findMany({
        where: {
          date: todayFilter,
          OR: [
            { userId: session.user.id },
            { visibility: "PUBLIC" },
            { visibility: "FRIENDS", user: friendsOnlyAuthorWhere(session.user.id) },
          ],
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          date: true,
          rating: true,
          title: true,
          description: true,
          mood: true,
          visibility: true,
          photoUrl: true,
          _count: { select: { likes: true, comments: true } },
          likes: { where: { userId: session.user.id }, select: { id: true }, take: 1 },
          user: { select: { name: true, username: true } },
        },
      })
    : [];

  const posts: PostCardPost[] = feedPosts.map((post) => ({
    id: post.id,
    date: post.date,
    rating: post.rating,
    title: post.title,
    description: post.description,
    mood: post.mood,
    visibility: post.visibility,
    photoUrl: post.photoUrl,
    user: post.user,
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    isLikedByCurrentUser: post.likes.length > 0,
  }));

  const lockedPosts: LockedPostCardPost[] = isFeedUnlocked
    ? []
    : await prisma.post.findMany({
        where: {
          date: todayFilter,
          OR: [{ visibility: "PUBLIC" }, { visibility: "FRIENDS", user: friendsOnlyAuthorWhere(session.user.id) }],
          NOT: { userId: session.user.id },
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        select: { id: true, date: true, user: { select: { name: true, username: true } } },
      });

  return (
    <AppShell unreadNotificationsCount={unreadNotificationsCount}>
      <section className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:hidden">
          <Search className="size-5 text-slate-400" />
          <Link className="flex-1 text-sm font-semibold text-slate-500 dark:text-slate-400" href="/friends">
            Buscar perfiles por nombre o @username
          </Link>
        </div>

        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-4 p-5">
            <div>
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
                <Sparkles className="size-4" /> Tu daily de hoy
              </p>
              {todaysOwnPost ? (
                <>
                  <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{todaysOwnPost.title}</h1>
                  <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{formatLongDate(startOfToday)} · Nota {formatRating(todaysOwnPost.rating)}/10</p>
                </>
              ) : (
                <>
                  <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Publica tu daily para desbloquear el feed</h1>
                  <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">Comparte tu nota de hoy y accede a las publicaciones visibles de amigos y comunidad.</p>
                </>
              )}
            </div>
            <Link
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
              href={todaysOwnPost ? `/posts/${todaysOwnPost.id}/edit` : "/day/new"}
            >
              <Camera className="size-4" /> {todaysOwnPost ? "Editar" : "Crear"}
            </Link>
          </div>
        </section>

        {!isFeedUnlocked ? (
          <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 shadow-xl shadow-amber-950/5 dark:border-amber-900/60 dark:bg-amber-950/30">
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">
              <LockKeyhole className="size-4" /> Feed bloqueado
            </p>
            <p className="mt-3 leading-7 text-slate-700 dark:text-slate-200">Mientras tanto solo puedes ver quién ha publicado hoy, sin revelar nota, título, descripción ni foto.</p>
          </div>
        ) : null}

        {isFeedUnlocked && posts.length > 0 ? <div className="space-y-5">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div> : null}

        {!isFeedUnlocked && lockedPosts.length > 0 ? <div className="space-y-5">{lockedPosts.map((post) => <LockedPostCard key={post.id} post={post} />)}</div> : null}

        {(isFeedUnlocked && posts.length === 0) || (!isFeedUnlocked && lockedPosts.length === 0) ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-950">
            <Sparkles className="mx-auto size-10 text-indigo-600 dark:text-indigo-300" />
            <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">{isFeedUnlocked ? "Todavía no hay dailies visibles hoy" : "Todavía no hay personas visibles en el feed"}</h2>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
