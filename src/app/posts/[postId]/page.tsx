import Link from "next/link";
import { Pencil } from "lucide-react";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { deletePostAction, toggleLikeAction } from "@/app/actions/posts";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { LikeButton } from "@/components/like-button";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { formatLongDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { formatRating } from "@/lib/ratings";
import { moodLabels, visibilityLabels } from "@/validations/posts";

type PostDetailPageProps = {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function PostDetailPage({ params, searchParams }: PostDetailPageProps) {
  const [session, routeParams, query] = await Promise.all([getServerSession(authOptions), params, searchParams]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const post = await prisma.post.findFirst({
    where: {
      id: routeParams.postId,
      OR: [{ userId: session.user.id }, { visibility: "PUBLIC" }],
    },
    include: {
      _count: {
        select: { likes: true },
      },
      likes: {
        where: { userId: session.user.id },
        select: { id: true },
        take: 1,
      },
      user: {
        select: {
          name: true,
          username: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const isOwner = post.userId === session.user.id;
  const likeAction = toggleLikeAction.bind(null, post.id);

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl space-y-6">
        <Notice error={query.error} success={query.success} />

        <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100">Publicación diaria</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">{post.title}</h1>
            <p className="mt-2 text-indigo-100">{formatLongDate(post.date)}</p>
            <p className="mt-4 text-sm font-semibold text-indigo-50">
              {post.user.name} · @{post.user.username}
            </p>
          </div>

          <div className="space-y-6 p-6">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Nota</p>
                <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{formatRating(post.rating)}/10</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Estado</p>
                <p className="mt-2 font-bold text-slate-950 dark:text-white">{post.mood ? moodLabels[post.mood] : "Sin estado"}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Visibilidad</p>
                <p className="mt-2 font-bold text-slate-950 dark:text-white">{visibilityLabels[post.visibility]}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Likes</p>
                <p className="mt-2 font-bold text-slate-950 dark:text-white">{post._count.likes}</p>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">Descripción</h2>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600 dark:text-slate-300">
                {post.description ?? "Sin descripción para este día."}
              </p>
            </div>

            <div className="rounded-3xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Foto opcional preparada para integrarse en una fase posterior. {post.photoUrl ? "Hay una referencia guardada." : "No hay foto asociada."}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <LikeButton action={likeAction} isLikedByCurrentUser={post.likes.length > 0} likesCount={post._count.likes} />
              {isOwner ? (
                <>
                  <Link className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500" href={`/posts/${post.id}/edit`}>
                    <Pencil className="size-4" /> Editar
                  </Link>
                  <form action={deletePostAction} className="sm:min-w-44">
                    <input name="postId" type="hidden" value={post.id} />
                    <SubmitButton pendingText="Borrando...">Borrar</SubmitButton>
                  </form>
                </>
              ) : null}
              <Link className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-800 dark:text-slate-200" href={isOwner ? "/day" : "/feed"}>
                Volver a {isOwner ? "Mi día" : "Feed"}
              </Link>
            </div>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
