import Link from "next/link";
import { LockKeyhole, Rss } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { LockedPostCard, PostCard, type LockedPostCardPost, type PostCardPost } from "@/components/post-card";
import { startOfTodayUtc, startOfTomorrowUtc } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FeedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const startOfToday = startOfTodayUtc();
  const startOfTomorrow = startOfTomorrowUtc();
  const todayFilter = {
    gte: startOfToday,
    lt: startOfTomorrow,
  };

  const todaysOwnPost = await prisma.post.findFirst({
    where: {
      userId: session.user.id,
      date: todayFilter,
    },
    select: { id: true },
  });

  const isFeedUnlocked = todaysOwnPost !== null;

  const posts: PostCardPost[] = isFeedUnlocked
    ? await prisma.post.findMany({
        where: {
          date: todayFilter,
          OR: [{ userId: session.user.id }, { visibility: "PUBLIC" }],
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
          user: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      })
    : [];

  const lockedPosts: LockedPostCardPost[] = isFeedUnlocked
    ? []
    : await prisma.post.findMany({
        where: {
          date: todayFilter,
          visibility: "PUBLIC",
          NOT: { userId: session.user.id },
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          date: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      });

  return (
    <AppShell>
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
            <Rss className="size-4" /> Feed social
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            Dailies de hoy
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
            El feed solo muestra dailies del día actual. Publica tu daily de hoy para desbloquear el contenido visible de la comunidad.
          </p>
        </div>

        {!isFeedUnlocked ? (
          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-xl shadow-amber-950/5 dark:border-amber-900/60 dark:bg-amber-950/30">
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-200">
              <LockKeyhole className="size-4" /> Feed bloqueado
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
              Publica tu daily de hoy para desbloquear el feed.
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-700 dark:text-slate-200">
              Mientras tanto solo puedes ver quién ha publicado hoy. La nota, el título, la descripción, el estado de ánimo y el resto del contenido no se consultan ni se muestran.
            </p>
            <Link
              className="mt-5 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              href="/day/new"
            >
              Crear mi daily
            </Link>
          </div>
        ) : null}

        {isFeedUnlocked && posts.length > 0 ? (
          <div className="space-y-5">
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        ) : null}

        {!isFeedUnlocked && lockedPosts.length > 0 ? (
          <div className="space-y-5">
            {lockedPosts.map((post) => <LockedPostCard key={post.id} post={post} />)}
          </div>
        ) : null}

        {(isFeedUnlocked && posts.length === 0) || (!isFeedUnlocked && lockedPosts.length === 0) ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-950">
            <Rss className="mx-auto size-10 text-indigo-600 dark:text-indigo-300" />
            <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
              {isFeedUnlocked ? "Todavía no hay dailies visibles hoy" : "Todavía no hay personas visibles en el feed"}
            </h2>
            <p className="mx-auto mt-2 max-w-xl leading-7 text-slate-600 dark:text-slate-300">
              {isFeedUnlocked
                ? "Cuando alguien publique un daily público de hoy aparecerá aquí junto a tus publicaciones."
                : "Cuando alguien publique un daily público hoy verás su nombre aquí, sin revelar el contenido hasta que publiques tu daily."}
            </p>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
