import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { createPostAction } from "@/app/actions/posts";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { Notice } from "@/components/notice";
import { PostForm } from "@/components/post-form";
import { formatLongDate, startOfTodayUtc } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

type NewDayPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewDayPage({ searchParams }: NewDayPageProps) {
  const [session, params] = await Promise.all([getServerSession(authOptions), searchParams]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const today = startOfTodayUtc();
  const existingPost = await prisma.post.findUnique({
    where: { userId_date: { userId: session.user.id, date: today } },
    select: { id: true },
  });

  if (existingPost) {
    redirect(`/posts/${existingPost.id}/edit?error=${encodeURIComponent("Ya tienes una publicación para hoy. Puedes editarla aquí.")}`);
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
            Nueva publicación diaria
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            ¿Cómo ha ido el {formatLongDate(today)}?
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
            Esta será tu publicación principal de hoy. Podrás editarla o borrarla después.
          </p>
        </div>

        <Notice error={params.error} />
        <PostForm action={createPostAction} cancelHref="/day" mode="create" />
      </section>
    </AppShell>
  );
}
