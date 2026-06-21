import type { getRollingAverage, getWeeklyRollup } from '../../utils/aggregations';

/** Aggregated carbon data used by AI insight generation. */
export type CarbonSummary = {
  totalKgCO2e: number;
  topCategory: string;
  topCategoryPercent: number;
  trend: 'up' | 'down' | 'stable';
  biggestEntry: { subcategory: string; kgCO2e: number };
  nationalAverage: number;
};

/** Dashboard metrics bundle returned to the UI layer. */
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

/** Input profile for onboarding baseline estimation. */
export type BaselineInput = {
  country: string;
  householdSize: number;
  dietType: string;
  carOwnership: boolean;
  vehicleType?: string;
  heatingType?: string;
  monthlyEnergy?: number;
  homeSize?: number;
};

/** Sums kgCO2e values from a list of entry fragments. */
export function sumKg(entries: { kgCO2e: number }[]): number {
  return entries.reduce((total, entry) => total + entry.kgCO2e, 0);
}

/** Builds a category breakdown map from entry rows. */
export function buildCategoryBreakdown(
  entries: { category: string; kgCO2e: number }[],
): Record<string, number> {
  const breakdown: Record<string, number> = {};
  for (const entry of entries) {
    breakdown[entry.category] = (breakdown[entry.category] ?? 0) + entry.kgCO2e;
  }
  return breakdown;
}

/** Resolves the highest-emission category from a breakdown map. */
export function getTopCategory(breakdown: Record<string, number>): {
  category: string;
  percent: number;
  total: number;
} {
  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  const [category = 'none', amount = 0] =
    Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0] ?? [];
  const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
  return { category, percent, total };
}
