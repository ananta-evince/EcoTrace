import type { EmissionCategory, EmissionFactor } from '../types';

/** DEFRA 2024 conversion factors (kgCO2e per unit). */
export const EMISSION_FACTORS: readonly EmissionFactor[] = [
  { category: 'transport', subcategory: 'car_petrol', factor: 0.172, unit: 'km', source: 'DEFRA', version: '2024' },
  { category: 'transport', subcategory: 'car_diesel', factor: 0.171, unit: 'km', source: 'DEFRA', version: '2024' },
  { category: 'transport', subcategory: 'car_electric', factor: 0.053, unit: 'km', source: 'DEFRA', version: '2024' },
  { category: 'transport', subcategory: 'train', factor: 0.035, unit: 'km', source: 'DEFRA', version: '2024' },
  { category: 'transport', subcategory: 'flight_short', factor: 0.255, unit: 'km', source: 'DEFRA', version: '2024' },
  { category: 'transport', subcategory: 'flight_long', factor: 0.195, unit: 'km', source: 'DEFRA', version: '2024' },
  { category: 'transport', subcategory: 'bus', factor: 0.103, unit: 'km', source: 'DEFRA', version: '2024' },
  { category: 'transport', subcategory: 'cycling', factor: 0, unit: 'km', source: 'DEFRA', version: '2024' },
  { category: 'food', subcategory: 'vegan_meal', factor: 0.7, unit: 'meals', source: 'DEFRA', version: '2024' },
  { category: 'food', subcategory: 'vegetarian_meal', factor: 1.2, unit: 'meals', source: 'DEFRA', version: '2024' },
  { category: 'food', subcategory: 'pescatarian_meal', factor: 1.8, unit: 'meals', source: 'DEFRA', version: '2024' },
  { category: 'food', subcategory: 'omnivore_meal', factor: 2.8, unit: 'meals', source: 'DEFRA', version: '2024' },
  { category: 'food', subcategory: 'meat_heavy_meal', factor: 4.5, unit: 'meals', source: 'DEFRA', version: '2024' },
  { category: 'food', subcategory: 'food_waste', factor: 2.5, unit: 'kg', source: 'DEFRA', version: '2024' },
  { category: 'home_energy', subcategory: 'electricity', factor: 0.207, unit: 'kWh', source: 'DEFRA', version: '2024' },
  { category: 'home_energy', subcategory: 'gas', factor: 0.184, unit: 'kWh', source: 'DEFRA', version: '2024' },
  { category: 'home_energy', subcategory: 'heating_oil', factor: 0.247, unit: 'kWh', source: 'DEFRA', version: '2024' },
  { category: 'shopping', subcategory: 'clothing', factor: 0.025, unit: 'GBP', source: 'DEFRA', version: '2024' },
  { category: 'shopping', subcategory: 'electronics', factor: 0.04, unit: 'GBP', source: 'DEFRA', version: '2024' },
  { category: 'shopping', subcategory: 'furniture', factor: 0.035, unit: 'GBP', source: 'DEFRA', version: '2024' },
  { category: 'services', subcategory: 'streaming', factor: 0.055, unit: 'hours', source: 'DEFRA', version: '2024' },
  { category: 'services', subcategory: 'banking', factor: 0.002, unit: 'GBP', source: 'DEFRA', version: '2024' },
  { category: 'services', subcategory: 'healthcare', factor: 0.015, unit: 'GBP', source: 'DEFRA', version: '2024' },
] as const;

/** National average daily footprint by country (kgCO2e/day). */
export const NATIONAL_AVERAGES: Record<string, number> = {
  GB: 14.2,
  US: 48.0,
  DE: 22.0,
  FR: 11.5,
  IN: 5.5,
  AU: 35.0,
};

/** 1.5°C compatible target (tCO2e/year → kg/day). */
export const TARGET_DAILY_KG = 6.85;
export const TARGET_ANNUAL_TONNES = 2.5;

/** Finds emission factor for category/subcategory. */
export function getEmissionFactor(
  category: EmissionCategory,
  subcategory: string,
): EmissionFactor | undefined {
  return EMISSION_FACTORS.find(
    (f) => f.category === category && f.subcategory === subcategory,
  );
}
