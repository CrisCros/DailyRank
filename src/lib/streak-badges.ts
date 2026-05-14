export type StreakBadge = {
  threshold: number;
  name: string;
  icon: string;
  shortText: string;
};

export const streakBadges = [
  { threshold: 1, name: "Primer Daily", icon: "🌱", shortText: "Primer paso" },
  { threshold: 3, name: "Calentando", icon: "✨", shortText: "3 días" },
  { threshold: 7, name: "Semana completa", icon: "🔥", shortText: "7 días" },
  { threshold: 14, name: "Constante", icon: "⚡", shortText: "14 días" },
  { threshold: 30, name: "Imparable", icon: "🏅", shortText: "30 días" },
  { threshold: 60, name: "Disciplina total", icon: "💎", shortText: "60 días" },
  { threshold: 100, name: "Leyenda Daily", icon: "👑", shortText: "100 días" },
  { threshold: 365, name: "Año perfecto", icon: "🐉", shortText: "365 días" },
] as const satisfies StreakBadge[];

export function getUnlockedStreakBadges(streak: number) {
  return streakBadges.filter((badge) => streak >= badge.threshold);
}

export function getStreakBadge(streak: number) {
  return getUnlockedStreakBadges(streak).at(-1) ?? null;
}
