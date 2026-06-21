import { describe, it, expect } from 'vitest';
import { calculateEmissions } from '../calculateEmissions';

describe('calculateEmissions', () => {
  it('converts car km to kgCO2e using DEFRA factors', () => {
    expect(
      calculateEmissions({ category: 'transport', subcategory: 'car_petrol', value: 100 }),
    ).toBeCloseTo(17.2, 1);
  });

  it('returns 0 for zero-value input', () => {
    expect(
      calculateEmissions({ category: 'transport', subcategory: 'car_petrol', value: 0 }),
    ).toBe(0);
  });

  it('throws for negative values', () => {
    expect(() =>
      calculateEmissions({ category: 'transport', subcategory: 'car_petrol', value: -1 }),
    ).toThrow();
  });

  it('calculates train emissions correctly', () => {
    expect(
      calculateEmissions({ category: 'transport', subcategory: 'train', value: 100 }),
    ).toBeCloseTo(3.5, 1);
  });

  it('calculates electricity correctly', () => {
    expect(
      calculateEmissions({ category: 'home_energy', subcategory: 'electricity', value: 100, unit: 'kWh' }),
    ).toBeCloseTo(20.7, 1);
  });
});
