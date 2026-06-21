import { INSIGHT_SUMMARY_WEEKS } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

import type { UserId } from '../../types';
import { subWeeks } from '../../utils/dateUtils';
import {
  DEFAULT_COUNTRY,
  getNationalDailyAverage,
  TREND_DECREASE_THRESHOLD,
  TREND_INCREASE_THRESHOLD,
} from '../../utils/emissionFactors';

import { buildCategoryBreakdown, getTopCategory, type CarbonSummary } from './types';

/** Aggregates carbon summary for AI insights. */
export async function getCarbonSummary(
  userId: UserId,
  options: { weeks: number } = { weeks: INSIGHT_SUMMARY_WEEKS },
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

  const totalKgCO2e = current.reduce((sum, entry) => sum + entry.kgCO2e, 0);
  const prevTotal = previous.reduce((sum, entry) => sum + entry.kgCO2e, 0);
  const breakdown = buildCategoryBreakdown(current);
  const top = getTopCategory(breakdown);
  const biggest = [...current].sort((a, b) => b.kgCO2e - a.kgCO2e)[0];
  const country = user?.country ?? DEFAULT_COUNTRY;

  let trend: CarbonSummary['trend'] = 'stable';
  if (totalKgCO2e > prevTotal * TREND_INCREASE_THRESHOLD) trend = 'up';
  else if (totalKgCO2e < prevTotal * TREND_DECREASE_THRESHOLD) trend = 'down';

  return {
    totalKgCO2e,
    topCategory: top.category,
    topCategoryPercent: top.percent,
    trend,
    biggestEntry: {
      subcategory: biggest?.subcategory ?? 'none',
      kgCO2e: biggest?.kgCO2e ?? 0,
    },
    nationalAverage: getNationalDailyAverage(country) * 7 * options.weeks,
  };
}
