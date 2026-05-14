import type { PostMood } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type StatsPost = {
  id: string;
  date: string;
  rating: number;
  title: string;
  mood: PostMood | null;
};

export type DailyRatingPoint = {
  day: string;
  label: string;
  rating: number | null;
};

export type MonthlyAveragePoint = {
  month: string;
  label: string;
  average: number | null;
  count: number;
};

export type MoodDistributionPoint = {
  mood: PostMood;
  label: string;
  count: number;
};

export type HeatmapDay = {
  date: string;
  label: string;
  count: number;
  rating: number | null;
};

export type StatsSummary = {
  totalAverage: number | null;
  currentMonthAverage: number | null;
  bestDaily: StatsPost | null;
  worstDaily: StatsPost | null;
  totalDailies: number;
  currentMonthDailies: number;
  currentStreak: number;
  bestStreak: number;
  dailyTrend: DailyRatingPoint[];
  monthlyAverages: MonthlyAveragePoint[];
  moodDistribution: MoodDistributionPoint[];
  heatmapDays: HeatmapDay[];
};

const moodLabels: Record<PostMood, string> = {
  HAPPY: "Feliz",
  TIRED: "Cansado",
  PRODUCTIVE: "Productivo",
  STRESSED: "Estresado",
  CALM: "Tranquilo",
  MOTIVATED: "Motivado",
  BAD_DAY: "Mal día",
  NORMAL_DAY: "Día normal",
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDateKey(key: string) {
  return new Date(`${key}T00:00:00.000Z`);
}

function addDays(date: Date, days: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

function startOfUtcMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addUtcMonths(date: Date, months: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

function monthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

function formatDayLabel(key: string) {
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "short", timeZone: "UTC" }).format(parseDateKey(key));
}

function formatMonthLabel(key: string) {
  return new Intl.DateTimeFormat("es", { month: "short", timeZone: "UTC" }).format(new Date(`${key}-01T00:00:00.000Z`));
}

function roundMetric(value: number) {
  return Math.round(value * 100) / 100;
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return roundMetric(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function calculateCurrentStreak(sortedDateKeys: string[], now = new Date()) {
  if (sortedDateKeys.length === 0) return 0;

  const publishedDates = new Set(sortedDateKeys);
  const todayKey = dateKey(now);
  const yesterdayKey = dateKey(addDays(now, -1));

  // A streak is considered current when the user posted today, or paused but
  // still visible when the last daily was yesterday. Older gaps reset it to 0.
  const anchorKey = publishedDates.has(todayKey) ? todayKey : publishedDates.has(yesterdayKey) ? yesterdayKey : null;

  if (!anchorKey) return 0;

  let cursor = parseDateKey(anchorKey);
  let streak = 0;

  while (publishedDates.has(dateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function calculateBestStreak(sortedDateKeys: string[]) {
  let bestStreak = 0;
  let currentStreak = 0;
  let previousTime: number | null = null;

  for (const key of sortedDateKeys) {
    const currentTime = parseDateKey(key).getTime();

    if (previousTime !== null && currentTime - previousTime === MS_PER_DAY) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    bestStreak = Math.max(bestStreak, currentStreak);
    previousTime = currentTime;
  }

  return bestStreak;
}

export async function getUsersCurrentStreaks(userIds: string[], now = new Date()) {
  const uniqueUserIds = Array.from(new Set(userIds));

  if (uniqueUserIds.length === 0) {
    return new Map<string, number>();
  }

  const posts = await prisma.post.findMany({
    where: { userId: { in: uniqueUserIds }, date: { lte: now } },
    orderBy: [{ userId: "asc" }, { date: "asc" }],
    select: { userId: true, date: true },
  });

  const datesByUser = new Map<string, Set<string>>();

  for (const post of posts) {
    const dates = datesByUser.get(post.userId) ?? new Set<string>();
    dates.add(dateKey(post.date));
    datesByUser.set(post.userId, dates);
  }

  return new Map(
    uniqueUserIds.map((userId) => {
      const dateKeys = Array.from(datesByUser.get(userId) ?? []).sort();
      return [userId, calculateCurrentStreak(dateKeys, now)] as const;
    }),
  );
}

export async function getUserCurrentStreak(userId: string, now = new Date()) {
  return (await getUsersCurrentStreaks([userId], now)).get(userId) ?? 0;
}

export function buildPersonalStats(posts: StatsPost[], now = new Date()): StatsSummary {
  const sortedPosts = [...posts].sort((a, b) => a.date.localeCompare(b.date));
  const currentMonthStart = startOfUtcMonth(now);
  const nextMonthStart = addUtcMonths(currentMonthStart, 1);
  const currentMonthPosts = sortedPosts.filter((post) => {
    const postDate = parseDateKey(post.date);
    return postDate >= currentMonthStart && postDate < nextMonthStart;
  });

  const bestDaily = sortedPosts.reduce<StatsPost | null>((best, post) => (!best || post.rating > best.rating ? post : best), null);
  const worstDaily = sortedPosts.reduce<StatsPost | null>((worst, post) => (!worst || post.rating < worst.rating ? post : worst), null);
  const uniqueDateKeys = Array.from(new Set(sortedPosts.map((post) => post.date))).sort();

  const ratingsByDay = new Map(sortedPosts.map((post) => [post.date, post.rating]));
  const dailyTrend = Array.from({ length: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate() }, (_, index) => {
    const dayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), index + 1));
    const key = dateKey(dayDate);

    return {
      day: key,
      label: String(index + 1),
      rating: ratingsByDay.get(key) ?? null,
    };
  });

  const monthlyAverages = Array.from({ length: 6 }, (_, index) => {
    const monthDate = addUtcMonths(currentMonthStart, index - 5);
    const key = monthKey(monthDate);
    const monthPosts = sortedPosts.filter((post) => post.date.startsWith(key));

    return {
      month: key,
      label: formatMonthLabel(key),
      average: average(monthPosts.map((post) => post.rating)),
      count: monthPosts.length,
    };
  });

  const moodCounts = sortedPosts.reduce<Map<PostMood, number>>((counts, post) => {
    if (!post.mood) return counts;
    counts.set(post.mood, (counts.get(post.mood) ?? 0) + 1);
    return counts;
  }, new Map());
  const moodDistribution = Array.from(moodCounts.entries()).map(([mood, count]) => ({ mood, label: moodLabels[mood], count }));

  const heatmapStart = addDays(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())), -59);
  const heatmapDays = Array.from({ length: 60 }, (_, index) => {
    const dayDate = addDays(heatmapStart, index);
    const key = dateKey(dayDate);
    const rating = ratingsByDay.get(key) ?? null;

    return {
      date: key,
      label: formatDayLabel(key),
      count: rating === null ? 0 : 1,
      rating,
    };
  });

  return {
    totalAverage: average(sortedPosts.map((post) => post.rating)),
    currentMonthAverage: average(currentMonthPosts.map((post) => post.rating)),
    bestDaily,
    worstDaily,
    totalDailies: sortedPosts.length,
    currentMonthDailies: currentMonthPosts.length,
    currentStreak: calculateCurrentStreak(uniqueDateKeys, now),
    bestStreak: calculateBestStreak(uniqueDateKeys),
    dailyTrend,
    monthlyAverages,
    moodDistribution,
    heatmapDays,
  };
}
