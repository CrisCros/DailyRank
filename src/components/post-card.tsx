import Link from "next/link";
import { Eye, LockKeyhole, MessageCircle, UserRound } from "lucide-react";
import type { PostMood, PostVisibility } from "@prisma/client";

import { toggleLikeAction } from "@/app/actions/posts";
import { LikeButton } from "@/components/like-button";
import { PostPhoto } from "@/components/post-photo";
import { UserAvatar } from "@/components/user-avatar";
import { formatLongDate } from "@/lib/dates";
import { formatRating } from "@/lib/ratings";
import { moodLabels, visibilityLabels } from "@/validations/posts";

type FormattableRating = {
  toString(): string;
};

type PostAuthor = {
  name: string;
  username: string;
  image: string | null;
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

function PostAuthorHeader({ date, user }: { date?: Date; user: PostAuthor }) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar user={user} />
      <div className="min-w-0">
        <Link
          className="truncate font-bold text-slate-950 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
          href={`/users/${user.username}`}
        >
          {user.name}
        </Link>
        <p className="truncate text-sm text-slate-500 dark:text-slate-400">
          @{user.username}
          {date ? ` · ${formatLongDate(date)}` : ""}
        </p>
      </div>
    </div>
  );
}

export function PostCard({ post }: PostCardProps) {
  const likeAction = toggleLikeAction.bind(null, post.id);

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20">
      <Link
        aria-label={`Abrir publicación de ${post.user.username}: ${post.title}`}
        className="absolute inset-0 z-10"
        href={`/posts/${post.id}`}
      />

      <div className="pointer-events-none relative z-20 space-y-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <PostAuthorHeader date={post.date} user={post.user} />
          <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            <Eye className="size-3.5" /> {visibilityLabels[post.visibility]}
          </div>
        </div>

        <PostPhoto photoUrl={post.photoUrl} title={post.title} />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              {post.mood ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-semibold dark:bg-slate-900">
                  <UserRound className="size-3.5" /> {moodLabels[post.mood]}
                </span>
              ) : null}
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
              {post.title}
            </h2>
            {post.description ? (
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap leading-7 text-slate-600 dark:text-slate-300">
                {post.description}
              </p>
            ) : null}
          </div>
          <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-indigo-50 text-center dark:bg-indigo-950/50">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-300">
              {formatRating(post.rating)}
            </span>
            <span className="text-[0.65rem] font-bold text-slate-500 dark:text-slate-400">
              /10
            </span>
          </div>
        </div>

        <div className="pointer-events-auto relative z-30 flex items-center gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
          <LikeButton
            action={likeAction}
            isLikedByCurrentUser={post.isLikedByCurrentUser}
            likesCount={post.likesCount}
          />
          <Link
            aria-label={`${post.commentsCount} comentarios`}
            className="inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
            href={`/posts/${post.id}#comments`}
          >
            <MessageCircle className="size-6" />{" "}
            <span>{post.commentsCount}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function LockedPostCard({ post }: LockedPostCardProps) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20">
      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <PostAuthorHeader date={post.date} user={post.user} />
          <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            <LockKeyhole className="size-4" /> Bloqueado
          </div>
        </div>

        <div className="relative aspect-square overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/70">
          <div className="space-y-4 blur-sm" aria-hidden="true">
            <div className="h-7 w-2/3 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-5/6 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-3/5 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-28 w-full rounded-3xl bg-slate-200 dark:bg-slate-800" />
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
