import type { EmissionCategory } from '@/features/tracking/types';

/** Human-readable labels for emission categories used across the UI. */
export const CATEGORY_LABELS: Record<EmissionCategory, string> = {
  transport: 'Transport',
  food: 'Food',
  home_energy: 'Home Energy',
  shopping: 'Shopping',
  services: 'Services',
};

/** Debounce delay for live emission preview calculations (ms). */
export const EMISSION_PREVIEW_DEBOUNCE_MS = 300;

/** Standard page size for entry list pagination. */
export const DEFAULT_ENTRY_PAGE_SIZE = 20;

/** Standard page size for recent dashboard entries. */
export const DASHBOARD_RECENT_ENTRY_LIMIT = 20;

/** Weeks of history shown in profile footprint history. */
export const PROFILE_HISTORY_WEEKS = 4;

/** Weeks of data used for AI insight summaries. */
export const INSIGHT_SUMMARY_WEEKS = 4;

/** Diet multipliers applied during baseline footprint estimation. */
export const DIET_MULTIPLIERS: Record<string, number> = {
  vegan: 0.6,
  vegetarian: 0.75,
  pescatarian: 0.85,
  omnivore: 1.0,
  'meat-heavy': 1.3,
};

/** Days per year used for annualisation calculations. */
export const DAYS_PER_YEAR = 365;

/** Days per week used for weekly trend projections. */
export const DAYS_PER_WEEK = 7;

/** Converts weekly kgCO2e to annual tonnes. */
export function weeklyKgToAnnualTonnes(weeklyKg: number): number {
  return ((weeklyKg / DAYS_PER_WEEK) * DAYS_PER_YEAR) / 1000;
}

/** Converts kgCO2e to equivalent car km using a petrol factor. */
export function kgToCarKmEquivalent(kg: number, carPetrolFactor: number): string {
  if (carPetrolFactor <= 0) return '0';
  return (kg / carPetrolFactor).toFixed(0);
}
