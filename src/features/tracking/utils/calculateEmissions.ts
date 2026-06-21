import { z } from 'zod';
import type { EmissionCategory } from '../types';
import { getEmissionFactor } from './emissionFactors';
import { normaliseToFactorUnit } from './unitConversions';

export type CalculateEmissionsInput = {
  category: EmissionCategory;
  subcategory: string;
  value: number;
  unit?: string;
};

const inputSchema = z.object({
  category: z.enum(['transport', 'food', 'home_energy', 'shopping', 'services']),
  subcategory: z.string().min(1),
  value: z.number().min(0),
  unit: z.string().optional(),
});

/**
 * Calculates kgCO2e from raw input using DEFRA 2024 factors.
 * @throws ZodError for invalid input
 */
export function calculateEmissions(input: CalculateEmissionsInput): number {
  const parsed = inputSchema.parse(input);
  if (parsed.value === 0) return 0;

  const factor = getEmissionFactor(parsed.category, parsed.subcategory);
  if (!factor) {
    throw new Error(`Unknown emission factor: ${parsed.category}/${parsed.subcategory}`);
  }

  const unit = parsed.unit ?? factor.unit;
  const normalised = normaliseToFactorUnit(parsed.value, unit, factor.unit);
  return normalised * factor.factor;
}
