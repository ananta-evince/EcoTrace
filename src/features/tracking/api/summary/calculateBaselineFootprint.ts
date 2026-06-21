import { DIET_MULTIPLIERS, DAYS_PER_YEAR } from '@/lib/constants';

import {
  ANNUAL_CAR_OWNERSHIP_KG,
  DEFAULT_HOUSEHOLD_DIVISOR,
  getEmissionFactor,
  getNationalDailyAverage,
  HOME_SIZE_ANNUAL_FACTOR,
} from '../../utils/emissionFactors';

import type { BaselineInput } from './types';

/** Computes estimated annual baseline from onboarding data. */
export function calculateBaselineFootprint(data: BaselineInput): number {
  const dailyNational = getNationalDailyAverage(data.country);
  let annual = dailyNational * DAYS_PER_YEAR * (data.householdSize / DEFAULT_HOUSEHOLD_DIVISOR);
  annual *= DIET_MULTIPLIERS[data.dietType] ?? 1.0;

  if (data.carOwnership) annual += ANNUAL_CAR_OWNERSHIP_KG;
  if (data.monthlyEnergy) {
    const electricityFactor = getEmissionFactor('home_energy', 'electricity')?.factor ?? 0.207;
    annual += data.monthlyEnergy * electricityFactor * 12;
  }
  if (data.homeSize) annual += data.homeSize * HOME_SIZE_ANNUAL_FACTOR;

  return annual / 1000;
}
