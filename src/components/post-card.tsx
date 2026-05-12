import Link from "next/link";
import { ArrowRight, CalendarDays, Eye, UserRound } from "lucide-react";
import type { PostMood, PostVisibility } from "@prisma/client";

import { formatLongDate } from "@/lib/dates";
import { formatRating } from "@/lib/ratings";
import { moodLabels, visibilityLabels } from "@/validations/posts";

type FormattableRating = {
  toString(): string;
};

export type PostCardPost = {
  id: string;
  date: Date;
  rating: FormattableRating | number | string;
  title: string;
  description: string | null;
  mood: PostMood | null;
  visibility: PostVisibility;
  user: {
    name: string;
    username: string;
  };
};

type PostCardProps = {
  post: PostCardPost;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20">
      <div className="space-y-5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
              {post.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-950 dark:text-white">{post.user.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">@{post.user.username}</p>
            </div>
          </div>

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

        <Link
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          href={`/posts/${post.id}`}
        >
          Ver detalle <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
