/** Backward-compatible re-exports for summary queries. */
export type { CarbonSummary, DashboardData } from './summary/types';
export {
  getCarbonSummary,
  getDashboardData,
  calculateBaselineFootprint,
  getWeekTotal,
} from './summary';
