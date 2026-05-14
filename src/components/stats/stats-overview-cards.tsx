import { CalendarDays, Flame, Medal, TrendingDown, TrendingUp } from "lucide-react";

import { StreakBadge } from "@/components/streak-badge";
import { formatRating } from "@/lib/ratings";
import type { StatsPost } from "@/lib/stats";

export type StatsOverviewCardsProps = {
  totalAverage: number | null;
  currentMonthAverage: number | null;
  bestDaily: StatsPost | null;
  worstDaily: StatsPost | null;
  totalDailies: number;
  currentMonthDailies: number;
  currentStreak: number;
  bestStreak: number;
};

export function StatsOverviewCards({
  totalAverage,
  currentMonthAverage,
  bestDaily,
  worstDaily,
  totalDailies,
  currentMonthDailies,
  currentStreak,
  bestStreak,
}: StatsOverviewCardsProps) {
  const cards = [
    { title: "Tu media total", value: formatNullableRating(totalAverage), detail: `${totalDailies} dailies publicados`, icon: TrendingUp },
    { title: "Este mes", value: formatNullableRating(currentMonthAverage), detail: `${currentMonthDailies} dailies este mes`, icon: CalendarDays },
    { title: "Mejor día", value: bestDaily ? `${formatRating(bestDaily.rating)}/10` : "—", detail: bestDaily?.title ?? "Publica más dailies para verlo", icon: Medal },
    { title: "Peor día", value: worstDaily ? `${formatRating(worstDaily.rating)}/10` : "—", detail: worstDaily?.title ?? "Aún no hay suficiente historial", icon: TrendingDown },
    { title: "Racha actual", value: currentStreak > 0 ? `${currentStreak} días` : "Sin racha", detail: "Hoy o pausada desde ayer", icon: Flame, streak: currentStreak },
    { title: "Mejor racha", value: `${bestStreak} días`, detail: "Tu máxima secuencia histórica", icon: Flame },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950" key={card.title}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{card.title}</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{card.value}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-200">
                <Icon className="size-5" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="line-clamp-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{card.detail}</p>
              {card.title === "Racha actual" ? <StreakBadge compact streak={currentStreak} /> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function formatNullableRating(value: number | null) {
  return value === null ? "—" : `${formatRating(value)}/10`;
}
