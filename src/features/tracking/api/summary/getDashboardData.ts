import { REDUCTION_ACTIONS } from '@/features/actions/data/reductionActions';

import type { UserId } from '../../types';
import { getWeeklyRollup, getRollingAverage } from '../../utils/aggregations';
import { computeStreak } from '../../utils/dateUtils';
import {
  DAYS_IN_MONTH,
  DEFAULT_COUNTRY,
  getNationalDailyAverage,
  TARGET_DAILY_KG,
} from '../../utils/emissionFactors';

import { fetchDashboardQueries } from './fetchDashboardQueries';
import { buildCategoryBreakdown, sumKg, type DashboardData } from './types';

function calculateActionsSaving(actionIds: string[]): number {
  return actionIds.reduce((sum, actionId) => {
    const action = REDUCTION_ACTIONS.find((item) => item.id === actionId);
    return sum + (action?.estimatedSavingKgPerYear ?? 0);
  }, 0);
}

/** Fetches all dashboard metrics for a user. */
export async function getDashboardData(userId: UserId): Promise<DashboardData> {
  const queries = await fetchDashboardQueries(userId);

  const todayTotal = sumKg(queries.todayEntries);
  const weekTotal = sumKg(queries.weekEntries);
  const lastWeekTotal = sumKg(queries.lastWeekEntries);
  const monthTotal = sumKg(queries.monthEntries);
  const weekDeltaPercent =
    lastWeekTotal > 0 ? ((weekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;
  const country = queries.user?.country ?? DEFAULT_COUNTRY;
  const dailyNational = getNationalDailyAverage(country);

  return {
    todayTotal,
    dailyTarget: TARGET_DAILY_KG,
    weekTotal,
    lastWeekTotal,
    weekDeltaPercent,
    monthTotal,
    nationalAverageMonthly: dailyNational * DAYS_IN_MONTH,
    streak: computeStreak(queries.streakEntries.map((entry) => entry.date)),
    weeklyRollup: getWeeklyRollup(queries.rollupEntries),
    categoryBreakdown: buildCategoryBreakdown(queries.monthEntries),
    rollingAverage: getRollingAverage(queries.rollingEntries),
    recentEntries: queries.recentEntries,
    actionsSavingKgPerYear: calculateActionsSaving(
      queries.userActions.map((action) => action.actionId),
    ),
  };
}
