import Link from "next/link";
import { ArrowRight, CalendarDays, Eye, LockKeyhole, MessageCircle, UserRound } from "lucide-react";
import type { PostMood, PostVisibility } from "@prisma/client";

import { toggleLikeAction } from "@/app/actions/posts";
import { LikeButton } from "@/components/like-button";
import { PostPhoto } from "@/components/post-photo";
import { formatLongDate } from "@/lib/dates";
import { formatRating } from "@/lib/ratings";
import { moodLabels, visibilityLabels } from "@/validations/posts";

type FormattableRating = {
  toString(): string;
};

type PostAuthor = {
  name: string;
  username: string;
};

export type PostCardPost = {
  id: string;
  date: Date;
  rating: FormattableRating | number | string;
  title: string;
  description: string | null;
  mood: PostMood | null;
  visibility: PostVisibility;
  photoUrl: string | null;
  user: PostAuthor;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser: boolean;
};

export type LockedPostCardPost = {
  id: string;
  date: Date;
  user: PostAuthor;
};

type PostCardProps = {
  post: PostCardPost;
};

type LockedPostCardProps = {
  post: LockedPostCardPost;
};

function PostAuthorHeader({ user }: { user: PostAuthor }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="font-bold text-slate-950 dark:text-white">{user.name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>
      </div>
    </div>
  );
}

export function PostCard({ post }: PostCardProps) {
  const likeAction = toggleLikeAction.bind(null, post.id);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20">
      <div className="space-y-5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PostAuthorHeader user={post.user} />

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">
            <Eye className="size-4" /> {visibilityLabels[post.visibility]}
          </div>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4" /> {formatLongDate(post.date)}
            </span>
            {post.mood ? (
              <span className="inline-flex items-center gap-2">
                <UserRound className="size-4" /> {moodLabels[post.mood]}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">{post.title}</h2>
              {post.description ? (
                <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600 dark:text-slate-300">{post.description}</p>
              ) : null}
            </div>

            <div className="flex min-w-24 flex-col items-center rounded-3xl bg-slate-50 p-4 text-center dark:bg-slate-900">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Nota</span>
              <span className="mt-2 text-3xl font-black text-indigo-600 dark:text-indigo-300">{formatRating(post.rating)}</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/10</span>
            </div>
          </div>
        </div>

        <PostPhoto className="min-h-60" photoUrl={post.photoUrl} title={post.title} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <LikeButton action={likeAction} isLikedByCurrentUser={post.isLikedByCurrentUser} likesCount={post.likesCount} />
          <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <MessageCircle className="size-4" /> Comentarios
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-900">{post.commentsCount}</span>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            href={`/posts/${post.id}`}
          >
            Ver detalle <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function LockedPostCard({ post }: LockedPostCardProps) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20">
      <div className="space-y-5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PostAuthorHeader user={post.user} />

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            <LockKeyhole className="size-4" /> Bloqueado
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4" /> {formatLongDate(post.date)}
          </span>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/70">
          <div className="space-y-4 blur-sm" aria-hidden="true">
            <div className="h-7 w-2/3 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-5/6 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-3/5 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-20 w-24 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-white/65 p-5 text-center backdrop-blur-[2px] dark:bg-slate-950/65">
            <p className="max-w-xs text-sm font-bold text-slate-700 dark:text-slate-200">
              Publica tu daily de hoy para desbloquear el feed.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
