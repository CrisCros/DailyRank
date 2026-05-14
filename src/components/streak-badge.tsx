import { Flame } from "lucide-react";

import { getStreakBadge, getUnlockedStreakBadges, type StreakBadge as StreakBadgeInfo } from "@/lib/streak-badges";
import { cn } from "@/lib/utils";

type BadgePillProps = {
  badge: StreakBadgeInfo;
  compact?: boolean;
  className?: string;
};

export function BadgePill({ badge, className, compact = false }: BadgePillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 font-black text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100",
        compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
        className,
      )}
      title={`${badge.name}: ${badge.shortText}`}
    >
      <span aria-hidden>{badge.icon}</span>
      <span>{compact ? badge.shortText : badge.name}</span>
    </span>
  );
}

export function StreakBadge({ className, compact = false, streak }: { className?: string; compact?: boolean; streak: number }) {
  const badge = getStreakBadge(streak);

  if (!badge) return null;

  return <BadgePill badge={badge} className={className} compact={compact} />;
}

export function CompactStreak({ streak }: { streak: number }) {
  if (streak <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1 font-black text-orange-600 dark:text-orange-300" title={`${streak} días de racha`}>
      <span aria-hidden>🔥</span> {streak}
    </span>
  );
}

export function StreakSummary({ streak }: { streak: number }) {
  const unlockedBadges = getUnlockedStreakBadges(streak);
  const mainBadge = unlockedBadges.at(-1) ?? null;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
            <Flame className="size-4" /> Constancia
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {streak > 0 ? `Racha actual: ${streak} ${streak === 1 ? "día" : "días"}` : "Sin racha todavía"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Cuenta dailies consecutivos hasta hoy. Si el último daily fue ayer, la racha se mantiene visible como pausada; un hueco mayor la reinicia.
          </p>
        </div>
        {mainBadge ? <BadgePill badge={mainBadge} className="shrink-0" /> : null}
      </div>

      {unlockedBadges.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {unlockedBadges.map((badge) => (
            <BadgePill badge={badge} compact key={badge.threshold} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
