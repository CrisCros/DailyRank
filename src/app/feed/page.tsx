import { Rss } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { prisma } from "@/lib/prisma";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const posts = await prisma.post.findMany({
    where: {
      OR: [{ userId: session.user.id }, { visibility: "PUBLIC" }],
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
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
            Publicaciones visibles
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
            Aquí ves tus publicaciones y las publicaciones públicas de la comunidad. Las publicaciones privadas de otros usuarios y las publicaciones para amigos se mantienen ocultas en esta fase.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-950">
            <Rss className="mx-auto size-10 text-indigo-600 dark:text-indigo-300" />
            <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">Todavía no hay publicaciones visibles</h2>
            <p className="mx-auto mt-2 max-w-xl leading-7 text-slate-600 dark:text-slate-300">
              Crea tu día o espera a que alguien publique contenido público para verlo aquí.
            </p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
