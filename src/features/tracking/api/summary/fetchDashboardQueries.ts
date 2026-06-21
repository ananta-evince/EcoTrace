import { DASHBOARD_RECENT_ENTRY_LIMIT } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

import type { UserId } from '../../types';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subDays,
} from '../../utils/dateUtils';
import {
  ROLLING_AVERAGE_DAYS,
  STREAK_LOOKBACK_DAYS,
  WEEKLY_ROLLUP_WEEKS,
} from '../../utils/emissionFactors';

const RECENT_ENTRY_SELECT = {
  id: true,
  category: true,
  subcategory: true,
  value: true,
  unit: true,
  kgCO2e: true,
  date: true,
  note: true,
} as const;

/** Raw dashboard query results before aggregation. */
export type DashboardQueryResult = Awaited<ReturnType<typeof fetchDashboardQueries>>;

/** Runs scoped parallel queries for dashboard metrics. */
export async function fetchDashboardQueries(userId: UserId) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const lastWeekStart = subWeeks(weekStart, 1);
  const lastWeekEnd = subWeeks(weekEnd, 1);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const rollupSince = subWeeks(now, WEEKLY_ROLLUP_WEEKS);
  const rollingSince = subDays(now, ROLLING_AVERAGE_DAYS);
  const streakSince = subDays(now, STREAK_LOOKBACK_DAYS);

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
      take: DASHBOARD_RECENT_ENTRY_LIMIT,
      orderBy: { date: 'desc' },
      select: RECENT_ENTRY_SELECT,
    }),
    prisma.carbonEntry.findMany({
      where: { userId, date: { gte: streakSince } },
      select: { date: true },
      orderBy: { date: 'desc' },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.userAction.findMany({ where: { userId, status: 'active' } }),
  ]);

  return {
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
  };
}
