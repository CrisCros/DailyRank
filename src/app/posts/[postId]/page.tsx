import Link from "next/link";
import { MessageCircle, Pencil, Trash2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { createCommentAction, deleteCommentAction, deletePostAction, toggleLikeAction } from "@/app/actions/posts";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { LikeButton } from "@/components/like-button";
import { Notice } from "@/components/notice";
import { PostPhoto } from "@/components/post-photo";
import { SubmitButton } from "@/components/submit-button";
import { formatDateTime, formatLongDate } from "@/lib/dates";
import { visiblePostWhere } from "@/lib/friendships";
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
      ...visiblePostWhere(session.user.id),
    },
    include: {
      _count: {
        select: { likes: true, comments: true },
      },
      likes: {
        where: { userId: session.user.id },
        select: { id: true },
        take: 1,
      },
      comments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              name: true,
              username: true,
            },
          },
        },
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
  const commentAction = createCommentAction.bind(null, post.id);

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
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Interacción</p>
                <p className="mt-2 font-bold text-slate-950 dark:text-white">{post._count.likes} likes · {post._count.comments} comentarios</p>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">Descripción</h2>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600 dark:text-slate-300">
                {post.description ?? "Sin descripción para este día."}
              </p>
            </div>

            <PostPhoto className="min-h-80" photoUrl={post.photoUrl} title={post.title} />

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

        <section className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                <MessageCircle className="size-4" /> Comentarios
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{post._count.comments} en esta publicación</h2>
            </div>
          </div>

          <form action={commentAction} className="space-y-3 rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="content">
              Añadir comentario
            </label>
            <textarea
              className="min-h-28 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
              id="content"
              maxLength={500}
              name="content"
              placeholder="Escribe algo útil, amable o curioso..."
              required
            />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Máximo 500 caracteres.</p>
            <SubmitButton pendingText="Publicando...">Publicar comentario</SubmitButton>
          </form>

          {post.comments.length > 0 ? (
            <div className="space-y-3">
              {post.comments.map((comment) => {
                const canDeleteComment = comment.userId === session.user.id || isOwner;
                const deleteAction = deleteCommentAction.bind(null, comment.id);

                return (
                  <article key={comment.id} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-bold text-slate-950 dark:text-white">{comment.user.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">@{comment.user.username} · {formatDateTime(comment.createdAt)}</p>
                      </div>
                      {canDeleteComment ? (
                        <form action={deleteAction}>
                          <button
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-200 dark:hover:bg-rose-950/40"
                            type="submit"
                          >
                            <Trash2 className="size-4" /> Borrar
                          </button>
                        </form>
                      ) : null}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600 dark:text-slate-300">{comment.content}</p>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-5 text-center dark:border-slate-700">
              <p className="font-bold text-slate-950 dark:text-white">Todavía no hay comentarios.</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sé la primera persona en comentar esta publicación visible.</p>
            </div>
          )}
        </section>
      </section>
    </AppShell>
  );
}
