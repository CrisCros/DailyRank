import Link from "next/link";
import { CalendarPlus, Eye, MessageCircle, Pencil } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { toggleLikeAction } from "@/app/actions/posts";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { LikeButton } from "@/components/like-button";
import { Notice } from "@/components/notice";
import { PostPhoto } from "@/components/post-photo";
import { formatLongDate, startOfTodayUtc } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { formatRating } from "@/lib/ratings";
import { moodLabels, visibilityLabels } from "@/validations/posts";

type DayPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function DayPage({ searchParams }: DayPageProps) {
  const [session, params] = await Promise.all([getServerSession(authOptions), searchParams]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const today = startOfTodayUtc();
  const [post, notificationsCount] = await Promise.all([
    prisma.post.findUnique({
    where: { userId_date: { userId: session.user.id, date: today } },
    include: {
      _count: {
        select: { likes: true, comments: true },
      },
      likes: {
        where: { userId: session.user.id },
        select: { id: true },
        take: 1,
      },
    },
  }),
    prisma.notification.count({ where: { recipientId: session.user.id } }),
  ]);

  const likeAction = post ? toggleLikeAction.bind(null, post.id) : null;

  return (
    <AppShell unreadNotificationsCount={notificationsCount}>
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
            Mi día
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            {formatLongDate(today)}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
            Registra una única publicación principal por día. Si ya has guardado la de hoy, puedes verla o editarla sin crear duplicados.
          </p>
        </div>

        <Notice error={params.error} success={params.success} />

        {post ? (
          <article className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200">
                  Nota {formatRating(post.rating)}/10
                </div>
                <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">{post.title}</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {post.mood ? moodLabels[post.mood] : "Sin estado"} · {visibilityLabels[post.visibility]}
                </p>
              </div>
            </div>

            {post.description ? <p className="leading-7 text-slate-600 dark:text-slate-300">{post.description}</p> : null}

            <PostPhoto photoUrl={post.photoUrl} title={post.title} />

            <div className="flex flex-col gap-3 sm:flex-row">
              {likeAction ? <LikeButton action={likeAction} isLikedByCurrentUser={post.likes.length > 0} likesCount={post._count.likes} /> : null}
              <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <MessageCircle className="size-4" /> Comentarios
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-900">{post._count.comments}</span>
              </div>
              <Link className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500" href={`/posts/${post.id}`}>
                <Eye className="size-4" /> Ver detalle
              </Link>
              <Link className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-800 dark:text-slate-200" href={`/posts/${post.id}/edit`}>
                <Pencil className="size-4" /> Editar publicación
              </Link>
            </div>
          </article>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-950">
            <CalendarPlus className="mx-auto size-10 text-indigo-600 dark:text-indigo-300" />
            <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">Todavía no has registrado hoy</h2>
            <p className="mx-auto mt-2 max-w-xl leading-7 text-slate-600 dark:text-slate-300">
              Crea la publicación principal de hoy con tu nota, título, estado y visibilidad.
            </p>
            <Link className="mt-5 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500" href="/day/new">
              Crear mi día
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}
