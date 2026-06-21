import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subDays } from './dateUtils';

export { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subDays };

/** Returns weekly totals for the last N weeks. */
export function getWeeklyRollup(
  entries: { date: Date; kgCO2e: number; category: string }[],
  weeks = 8,
): { weekStart: string; total: number; byCategory: Record<string, number> }[] {
  const result: { weekStart: string; total: number; byCategory: Record<string, number> }[] = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekDate = subWeeks(now, i);
    const start = startOfWeek(weekDate);
    const end = endOfWeek(weekDate);
    const weekEntries = entries.filter((e) => e.date >= start && e.date <= end);

    const byCategory: Record<string, number> = {};
    let total = 0;
    for (const entry of weekEntries) {
      total += entry.kgCO2e;
      byCategory[entry.category] = (byCategory[entry.category] ?? 0) + entry.kgCO2e;
    }

    result.push({
      weekStart: start.toISOString().split('T')[0] ?? '',
      total,
      byCategory,
    });
  }

  return result;
}

/** Aggregates entries by month. */
export function getMonthlyAggregation(
  entries: { date: Date; kgCO2e: number }[],
): { month: string; total: number }[] {
  const map = new Map<string, number>();

  for (const entry of entries) {
    const key = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) ?? 0) + entry.kgCO2e);
  }

  return Array.from(map.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/** Computes rolling average over N days (O(n) sliding window). */
export function getRollingAverage(
  entries: { date: Date; kgCO2e: number }[],
  days = 90,
): { date: string; average: number }[] {
  if (entries.length === 0) return [];

  const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  const result: { date: string; average: number }[] = [];
  let windowStart = 0;
  let windowSum = 0;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]!;
    const windowCutoff = subDays(current.date, days);

    while (windowStart <= i && sorted[windowStart]!.date < windowCutoff) {
      windowSum -= sorted[windowStart]!.kgCO2e;
      windowStart++;
    }

    windowSum += current.kgCO2e;
    result.push({
      date: current.date.toISOString().split('T')[0] ?? '',
      average: windowSum / days,
    });
  }

  return result;
}
