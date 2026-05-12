import type { HeatmapDay } from "@/lib/stats";
import { cn } from "@/lib/utils";

export function DailyHeatmap({ days }: { days: HeatmapDay[] }) {
  const publishedDays = days.filter((day) => day.count > 0).length;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Calendario reciente</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Últimos 60 días de publicaciones.</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200">{publishedDays} días</span>
      </div>

      {publishedDays === 0 ? (
        <p className="mt-5 rounded-3xl border border-dashed border-slate-300 p-5 text-center text-sm font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">Publica tus primeros dailies para llenar este calendario.</p>
      ) : (
        <div className="mt-5 grid grid-cols-10 gap-1.5 sm:grid-cols-[repeat(20,minmax(0,1fr))]">
          {days.map((day) => (
            <div
              aria-label={day.rating === null ? `${day.label}: sin daily` : `${day.label}: nota ${day.rating}/10`}
              className={cn("aspect-square rounded-md border border-slate-200 dark:border-slate-800", heatmapColor(day.rating))}
              key={day.date}
              title={day.rating === null ? `${day.label}: sin daily` : `${day.label}: nota ${day.rating}/10`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function heatmapColor(rating: number | null) {
  if (rating === null) return "bg-slate-100 dark:bg-slate-900";
  if (rating >= 8) return "bg-emerald-500/90";
  if (rating >= 6) return "bg-indigo-500/80";
  if (rating >= 4) return "bg-amber-400/90";
  return "bg-rose-500/90";
}
