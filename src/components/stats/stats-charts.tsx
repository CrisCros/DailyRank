"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { DailyRatingPoint, MonthlyAveragePoint, MoodDistributionPoint } from "@/lib/stats";

const chartColors = ["#4f46e5", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2", "#f59e0b", "#64748b"];

export function RatingTrendChart({ data }: { data: DailyRatingPoint[] }) {
  const hasData = data.some((point) => point.rating !== null);

  return (
    <ChartCard title="Evolución diaria" description="Nota por día durante el mes actual.">
      {hasData ? (
        <div className="h-64 w-full">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={data} margin={{ bottom: 8, left: -18, right: 8, top: 12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} />
              <YAxis domain={[0, 10]} tickLine={false} width={36} />
              <Tooltip formatter={(value) => [`${value}/10`, "Nota"]} labelFormatter={(label) => `Día ${label}`} />
              <Line connectNulls dataKey="rating" dot={{ r: 3 }} stroke="#4f46e5" strokeWidth={3} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyChartState>Publica algún daily este mes para ver la evolución.</EmptyChartState>
      )}
    </ChartCard>
  );
}

export function MonthlyAverageChart({ data }: { data: MonthlyAveragePoint[] }) {
  const hasData = data.some((point) => point.average !== null);

  return (
    <ChartCard title="Media por mes" description="Promedio de los últimos 6 meses.">
      {hasData ? (
        <div className="h-64 w-full">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={data} margin={{ bottom: 8, left: -18, right: 8, top: 12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} />
              <YAxis domain={[0, 10]} tickLine={false} width={36} />
              <Tooltip formatter={(value) => [`${value}/10`, "Media"]} />
              <Area dataKey="average" fill="#c7d2fe" stroke="#4f46e5" strokeWidth={3} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyChartState>Aún no hay meses con dailies para comparar.</EmptyChartState>
      )}
    </ChartCard>
  );
}

export function MoodDistributionChart({ data }: { data: MoodDistributionPoint[] }) {
  return (
    <ChartCard title="Distribución de moods" description="Estados de ánimo usados en tus dailies.">
      {data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-center">
          <div className="h-64 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie data={data} dataKey="count" innerRadius={54} nameKey="label" outerRadius={88} paddingAngle={3}>
                  {data.map((entry, index) => (
                    <Cell fill={chartColors[index % chartColors.length]} key={entry.mood} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Dailies"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {data.map((entry, index) => (
              <div className="flex items-center justify-between gap-3 text-sm" key={entry.mood}>
                <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                  <span className="truncate">{entry.label}</span>
                </span>
                <span className="font-black text-slate-950 dark:text-white">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyChartState>Añade un mood a tus dailies para ver esta distribución.</EmptyChartState>
      )}
    </ChartCard>
  );
}

export function DailiesCountChart({ totalDailies, currentMonthDailies }: { totalDailies: number; currentMonthDailies: number }) {
  const data = [
    { label: "Total", value: totalDailies },
    { label: "Este mes", value: currentMonthDailies },
  ];

  return (
    <ChartCard title="Volumen publicado" description="Cantidad total y actividad del mes.">
      <div className="h-52 w-full">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data} margin={{ bottom: 8, left: -18, right: 8, top: 12 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} />
            <YAxis allowDecimals={false} tickLine={false} width={36} />
            <Tooltip formatter={(value) => [value, "Dailies"]} />
            <Bar dataKey="value" fill="#4f46e5" radius={[10, 10, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

function ChartCard({ children, description, title }: { children: React.ReactNode; description: string; title: string }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
      <h2 className="text-lg font-black text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyChartState({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-48 items-center justify-center rounded-3xl border border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">{children}</div>;
}
