import { prisma } from '@/lib/prisma';
import { NATIONAL_AVERAGES, TARGET_DAILY_KG } from '../utils/emissionFactors';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subDays,
  computeStreak,
} from '../utils/dateUtils';
import { getWeeklyRollup, getRollingAverage } from '../utils/aggregations';
import type { UserId } from '../types';

export type CarbonSummary = {
  totalKgCO2e: number;
  topCategory: string;
  topCategoryPercent: number;
  trend: 'up' | 'down' | 'stable';
  biggestEntry: { subcategory: string; kgCO2e: number };
  nationalAverage: number;
};

export type DashboardData = {
  todayTotal: number;
  dailyTarget: number;
  weekTotal: number;
  lastWeekTotal: number;
  weekDeltaPercent: number;
  monthTotal: number;
  nationalAverageMonthly: number;
  streak: number;
  weeklyRollup: ReturnType<typeof getWeeklyRollup>;
  categoryBreakdown: Record<string, number>;
  rollingAverage: ReturnType<typeof getRollingAverage>;
  recentEntries: {
    id: string;
    category: string;
    subcategory: string;
    value: number;
    unit: string;
    kgCO2e: number;
    date: Date;
    note: string | null;
  }[];
  actionsSavingKgPerYear: number;
};

/** Aggregates carbon summary for AI insights. */
export async function getCarbonSummary(
  userId: UserId,
  options: { weeks: number },
): Promise<CarbonSummary> {
  const since = subWeeks(new Date(), options.weeks);
  const prevSince = subWeeks(since, options.weeks);

  const [current, previous, user] = await Promise.all([
    prisma.carbonEntry.findMany({ where: { userId, date: { gte: since } } }),
    prisma.carbonEntry.findMany({
      where: { userId, date: { gte: prevSince, lt: since } },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  const totalKgCO2e = current.reduce((s, e) => s + e.kgCO2e, 0);
  const prevTotal = previous.reduce((s, e) => s + e.kgCO2e, 0);

  const byCategory: Record<string, number> = {};
  for (const e of current) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.kgCO2e;
  }

  const topCategory =
    Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none';
  const topCategoryPercent =
    totalKgCO2e > 0 ? Math.round(((byCategory[topCategory] ?? 0) / totalKgCO2e) * 100) : 0;

  const biggest = current.sort((a, b) => b.kgCO2e - a.kgCO2e)[0];
  const country = user?.country ?? 'GB';

  let trend: CarbonSummary['trend'] = 'stable';
  if (totalKgCO2e > prevTotal * 1.05) trend = 'up';
  else if (totalKgCO2e < prevTotal * 0.95) trend = 'down';

  return {
    totalKgCO2e,
    topCategory,
    topCategoryPercent,
    trend,
    biggestEntry: {
      subcategory: biggest?.subcategory ?? 'none',
      kgCO2e: biggest?.kgCO2e ?? 0,
    },
    nationalAverage: (NATIONAL_AVERAGES[country] ?? NATIONAL_AVERAGES.GB ?? 14.2) * 7 * options.weeks,
  };
}

/** Fetches all dashboard metrics for a user. */
export async function getDashboardData(userId: UserId): Promise<DashboardData> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const lastWeekStart = subWeeks(weekStart, 1);
  const lastWeekEnd = subWeeks(weekEnd, 1);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const rollupSince = subWeeks(now, 8);
  const rollingSince = subDays(now, 90);
  const streakSince = subDays(now, 400);

  const entrySelect = {
    id: true,
    category: true,
    subcategory: true,
    value: true,
    unit: true,
    kgCO2e: true,
    date: true,
    note: true,
  } as const;

  const [
    todayEntries,
    weekEntries,
    lastWeekEntries,
    monthEntries,
    rollupEntries,
    rollingEntries,
    recentEntries,
    streakEntries,
    user,
    userActions,
  ] = await Promise.all([
    prisma.carbonEntry.findMany({
      where: { userId, date: { gte: todayStart, lte: todayEnd } },
      select: { kgCO2e: true },
    }),
    prisma.carbonEntry.findMany({
      where: { userId, date: { gte: weekStart, lte: weekEnd } },
      select: { kgCO2e: true },
    }),
    prisma.carbonEntry.findMany({
      where: { userId, date: { gte: lastWeekStart, lte: lastWeekEnd } },
      select: { kgCO2e: true },
    }),
    prisma.carbonEntry.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      select: { kgCO2e: true, category: true },
    }),
    prisma.carbonEntry.findMany({
      where: { userId, date: { gte: rollupSince } },
      select: { date: true, kgCO2e: true, category: true },
    }),
    prisma.carbonEntry.findMany({
      where: { userId, date: { gte: rollingSince } },
      select: { date: true, kgCO2e: true },
      orderBy: { date: 'asc' },
    }),
    prisma.carbonEntry.findMany({
      where: { userId },
      take: 20,
      orderBy: { date: 'desc' },
      select: entrySelect,
    }),
    prisma.carbonEntry.findMany({
      where: { userId, date: { gte: streakSince } },
      select: { date: true },
      orderBy: { date: 'desc' },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.userAction.findMany({ where: { userId, status: 'active' } }),
  ]);

  const sumKg = (entries: { kgCO2e: number }[]) =>
    entries.reduce((s, e) => s + e.kgCO2e, 0);

  const todayTotal = sumKg(todayEntries);
  const weekTotal = sumKg(weekEntries);
  const lastWeekTotal = sumKg(lastWeekEntries);
  const monthTotal = sumKg(monthEntries);

  const weekDeltaPercent =
    lastWeekTotal > 0 ? ((weekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;

  const country = user?.country ?? 'GB';
  const dailyNational = NATIONAL_AVERAGES[country] ?? NATIONAL_AVERAGES.GB ?? 14.2;

  const categoryBreakdown: Record<string, number> = {};
  for (const e of monthEntries) {
    categoryBreakdown[e.category] = (categoryBreakdown[e.category] ?? 0) + e.kgCO2e;
  }

  const { REDUCTION_ACTIONS } = await import('@/features/actions/data/reductionActions');
  const actionsSavingKgPerYear = userActions.reduce((sum, ua) => {
    const action = REDUCTION_ACTIONS.find((a) => a.id === ua.actionId);
    return sum + (action?.estimatedSavingKgPerYear ?? 0);
  }, 0);

  return {
    todayTotal,
    dailyTarget: TARGET_DAILY_KG,
    weekTotal,
    lastWeekTotal,
    weekDeltaPercent,
    monthTotal,
    nationalAverageMonthly: dailyNational * 30,
    streak: computeStreak(streakEntries.map((e) => e.date)),
    weeklyRollup: getWeeklyRollup(rollupEntries),
    categoryBreakdown,
    rollingAverage: getRollingAverage(rollingEntries),
    recentEntries,
    actionsSavingKgPerYear,
  };
}

/** Computes estimated annual baseline from onboarding data. */
export function calculateBaselineFootprint(data: {
  country: string;
  householdSize: number;
  dietType: string;
  carOwnership: boolean;
  vehicleType?: string;
  heatingType?: string;
  monthlyEnergy?: number;
  homeSize?: number;
}): number {
  const dailyNational = NATIONAL_AVERAGES[data.country] ?? NATIONAL_AVERAGES.GB ?? 14.2;
  let annual = dailyNational * 365 * (data.householdSize / 2.4);

  const dietMultipliers: Record<string, number> = {
    vegan: 0.6,
    vegetarian: 0.75,
    pescatarian: 0.85,
    omnivore: 1.0,
    'meat-heavy': 1.3,
  };
  annual *= dietMultipliers[data.dietType] ?? 1.0;

  if (data.carOwnership) annual += 1200;
  if (data.monthlyEnergy) annual += data.monthlyEnergy * 0.207 * 12;
  if (data.homeSize) annual += data.homeSize * 5;

  return annual / 1000;
}
