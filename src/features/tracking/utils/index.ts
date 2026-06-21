export { calculateEmissions } from './calculateEmissions';
export { EMISSION_FACTORS, getEmissionFactor, NATIONAL_AVERAGES, TARGET_DAILY_KG } from './emissionFactors';
export { milesToKm, lbsToKg, normaliseToFactorUnit } from './unitConversions';
export { getWeeklyRollup, getMonthlyAggregation, getRollingAverage } from './aggregations';
export { startOfWeek, endOfWeek, computeStreak } from './dateUtils';
