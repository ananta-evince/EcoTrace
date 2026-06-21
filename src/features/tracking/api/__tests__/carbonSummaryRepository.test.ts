import { describe, it, expect } from 'vitest';

import { calculateBaselineFootprint } from '../carbonSummaryRepository';

describe('calculateBaselineFootprint', () => {
  it('returns a positive annual footprint in tonnes', () => {
    const result = calculateBaselineFootprint({
      country: 'GB',
      householdSize: 2,
      dietType: 'omnivore',
      carOwnership: false,
    });
    expect(result).toBeGreaterThan(0);
  });

  it('increases footprint for car ownership', () => {
    const without = calculateBaselineFootprint({
      country: 'GB',
      householdSize: 2,
      dietType: 'omnivore',
      carOwnership: false,
    });
    const withCar = calculateBaselineFootprint({
      country: 'GB',
      householdSize: 2,
      dietType: 'omnivore',
      carOwnership: true,
    });
    expect(withCar).toBeGreaterThan(without);
  });

  it('reduces footprint for vegan diet', () => {
    const omnivore = calculateBaselineFootprint({
      country: 'GB',
      householdSize: 2,
      dietType: 'omnivore',
      carOwnership: false,
    });
    const vegan = calculateBaselineFootprint({
      country: 'GB',
      householdSize: 2,
      dietType: 'vegan',
      carOwnership: false,
    });
    expect(vegan).toBeLessThan(omnivore);
  });

  it('includes optional home and energy factors', () => {
    const result = calculateBaselineFootprint({
      country: 'GB',
      householdSize: 2,
      dietType: 'meat-heavy',
      carOwnership: true,
      vehicleType: 'car_petrol',
      heatingType: 'gas',
      monthlyEnergy: 250,
      homeSize: 85,
    });
    expect(result).toBeGreaterThan(5);
  });
});
