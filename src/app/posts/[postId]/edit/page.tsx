import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { updatePostAction } from "@/app/actions/posts";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { Notice } from "@/components/notice";
import { PostForm } from "@/components/post-form";
import { formatLongDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

type EditPostPageProps = {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditPostPage({ params, searchParams }: EditPostPageProps) {
  const [session, routeParams, query] = await Promise.all([getServerSession(authOptions), params, searchParams]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const post = await prisma.post.findFirst({
    where: { id: routeParams.postId, userId: session.user.id },
  });

  if (!post) {
    notFound();
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
            Editar publicación
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            {formatLongDate(post.date)}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
            Solo tú puedes modificar esta publicación. Las acciones se vuelven a proteger y validar en servidor.
          </p>
        </div>

        <Notice error={query.error} />
        <PostForm action={updatePostAction} cancelHref={`/posts/${post.id}`} mode="edit" post={post} />
      </section>
    </AppShell>
  );
}
