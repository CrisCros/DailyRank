import Link from "next/link";
import { Activity, BarChart3, Camera } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { DailyHeatmap } from "@/components/stats/daily-heatmap";
import { DailiesCountChart, MonthlyAverageChart, MoodDistributionChart, RatingTrendChart } from "@/components/stats/stats-charts";
import { StatsOverviewCards } from "@/components/stats/stats-overview-cards";
import { buildPersonalStats } from "@/lib/stats";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StatsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [posts, notificationsCount] = await Promise.all([
    prisma.post.findMany({
      where: { userId: session.user.id },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      select: { id: true, date: true, rating: true, title: true, mood: true },
    }),
    prisma.notification.count({ where: { recipientId: session.user.id } }),
  ]);

  const stats = buildPersonalStats(
    posts.map((post) => ({
      id: post.id,
      date: post.date.toISOString().slice(0, 10),
      rating: Number(post.rating),
      title: post.title,
      mood: post.mood,
    })),
  );

  return (
    <AppShell unreadNotificationsCount={notificationsCount}>
      <section className="space-y-5">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 p-6 text-white">
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-indigo-100">
              <Activity className="size-4" /> Estadísticas personales
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Tu evolución en DayRank</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-indigo-50 sm:text-base">Analiza tus notas, rachas, moods y actividad reciente a partir de tus propios dailies, sin mezclar datos de otros usuarios.</p>
          </div>
        </div>

        {stats.totalDailies === 0 ? <StatsEmptyState /> : null}

        <StatsOverviewCards
          bestDaily={stats.bestDaily}
          bestStreak={stats.bestStreak}
          currentMonthAverage={stats.currentMonthAverage}
          currentMonthDailies={stats.currentMonthDailies}
          currentStreak={stats.currentStreak}
          totalAverage={stats.totalAverage}
          totalDailies={stats.totalDailies}
          worstDaily={stats.worstDaily}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <RatingTrendChart data={stats.dailyTrend} />
          <MonthlyAverageChart data={stats.monthlyAverages} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <MoodDistributionChart data={stats.moodDistribution} />
          <DailiesCountChart currentMonthDailies={stats.currentMonthDailies} totalDailies={stats.totalDailies} />
        </div>

        <DailyHeatmap days={stats.heatmapDays} />
      </section>
    </AppShell>
  );
}

function StatsEmptyState() {
  return (
    <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 text-center shadow-xl shadow-slate-950/5 dark:border-slate-700 dark:bg-slate-950">
      <BarChart3 className="mx-auto size-10 text-indigo-500" />
      <h2 className="mt-4 text-xl font-black text-slate-950 dark:text-white">Aún no hay estadísticas</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">Publica tu primer daily para calcular tu media total, mejores días, rachas, moods y calendario reciente.</p>
      <Link className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500" href="/day/new">
        <Camera className="size-4" /> Crear daily
      </Link>
    </section>
  );
}
