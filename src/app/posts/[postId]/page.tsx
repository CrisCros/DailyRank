import Link from "next/link";
import { MessageCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import {
  createCommentAction,
  deleteCommentAction,
  deletePostAction,
  toggleLikeAction,
} from "@/app/actions/posts";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { LikeButton } from "@/components/like-button";
import { Notice } from "@/components/notice";
import { PostPhoto } from "@/components/post-photo";
import { SubmitButton } from "@/components/submit-button";
import { UserAvatar } from "@/components/user-avatar";
import { formatDateTime, formatLongDate } from "@/lib/dates";
import { visiblePostWhere } from "@/lib/friendships";
import { prisma } from "@/lib/prisma";
import { formatRating } from "@/lib/ratings";
import { moodLabels, visibilityLabels } from "@/validations/posts";

type PostDetailPageProps = {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function PostDetailPage({
  params,
  searchParams,
}: PostDetailPageProps) {
  const [session, routeParams, query] = await Promise.all([
    getServerSession(authOptions),
    params,
    searchParams,
  ]);

  if (!session?.user?.id) redirect("/login");

  const [post, unreadNotificationsCount] = await Promise.all([
    prisma.post.findFirst({
      where: { id: routeParams.postId, ...visiblePostWhere(session.user.id) },
      include: {
        _count: { select: { likes: true, comments: true } },
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
            user: { select: { name: true, username: true, image: true } },
          },
        },
        user: { select: { name: true, username: true, image: true } },
      },
    }),
    prisma.notification.count({ where: { recipientId: session.user.id } }),
  ]);

  if (!post) notFound();

  const isOwner = post.userId === session.user.id;
  const likeAction = toggleLikeAction.bind(null, post.id);
  const commentAction = createCommentAction.bind(null, post.id);

  return (
    <AppShell unreadNotificationsCount={unreadNotificationsCount}>
      <section className="mx-auto max-w-2xl space-y-5">
        <Notice error={query.error} success={query.success} />

        <article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <div className="space-y-5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar className="size-12" user={post.user} />
                <div className="min-w-0">
                  <Link
                    className="truncate font-black text-slate-950 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
                    href={`/users/${post.user.username}`}
                  >
                    {post.user.name}
                  </Link>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                    @{post.user.username} · {formatDateTime(post.createdAt)}
                  </p>
                </div>
              </div>

              {isOwner ? (
                <details className="relative shrink-0">
                  <summary
                    className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-900"
                    aria-label="Opciones de publicación"
                  >
                    <MoreHorizontal className="size-5 text-slate-600 dark:text-slate-300" />
                  </summary>
                  <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                    <Link
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                      href={`/posts/${post.id}/edit`}
                    >
                      <Pencil className="size-4" /> Editar
                    </Link>
                    <form action={deletePostAction}>
                      <input name="postId" type="hidden" value={post.id} />
                      <button
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-950/40"
                        type="submit"
                      >
                        <Trash2 className="size-4" /> Borrar
                      </button>
                    </form>
                  </div>
                </details>
              ) : null}
            </div>

            <PostPhoto photoUrl={post.photoUrl} title={post.title} />

            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-900">
                  {formatLongDate(post.date)}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-900">
                  {visibilityLabels[post.visibility]}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-900">
                  {post.mood ? moodLabels[post.mood] : "Sin estado"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                    {post.title}
                  </h1>
                  <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600 dark:text-slate-300">
                    {post.description ?? "Sin descripción para este día."}
                  </p>
                </div>
                <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-300">
                    {formatRating(post.rating)}
                  </span>
                  <span className="text-[0.65rem] font-bold text-slate-500 dark:text-slate-400">
                    /10
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-y border-slate-100 py-2 dark:border-slate-800">
              <LikeButton
                action={likeAction}
                isLikedByCurrentUser={post.likes.length > 0}
                likesCount={post._count.likes}
              />
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-black text-slate-600 dark:text-slate-300"
                href="#comments"
              >
                <MessageCircle className="size-6" /> {post._count.comments}
              </a>
            </div>

            <section className="space-y-4" id="comments">
              <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
                <MessageCircle className="size-5" /> Comentarios
              </h2>
              <form action={commentAction} className="space-y-3">
                <textarea
                  className="min-h-28 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-950"
                  maxLength={500}
                  name="content"
                  placeholder="Escribe un comentario..."
                  required
                />
                <div className="sm:max-w-48">
                  <SubmitButton pendingText="Publicando...">
                    Comentar
                  </SubmitButton>
                </div>
              </form>

              <div className="space-y-3">
                {post.comments.length === 0 ? (
                  <p className="rounded-3xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    Todavía no hay comentarios.
                  </p>
                ) : null}
                {post.comments.map((comment) => (
                  <article
                    className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/70"
                    key={comment.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <UserAvatar user={comment.user} size="sm" />
                        <div className="min-w-0">
                          <Link
                            className="font-black text-slate-950 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
                            href={`/users/${comment.user.username}`}
                          >
                            {comment.user.name}
                          </Link>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            @{comment.user.username} ·{" "}
                            {formatDateTime(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                      {comment.userId === session.user.id ? (
                        <form
                          action={deleteCommentAction.bind(null, comment.id)}
                        >
                          <button
                            className="rounded-full p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                            type="submit"
                            aria-label="Borrar comentario"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </form>
                      ) : null}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700 dark:text-slate-200">
                      {comment.content}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
