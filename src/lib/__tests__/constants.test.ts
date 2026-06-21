import { describe, it, expect } from 'vitest';

import {
  kgToCarKmEquivalent,
  weeklyKgToAnnualTonnes,
  CATEGORY_LABELS,
} from '../constants';

describe('constants helpers', () => {
  it('converts weekly kg to annual tonnes', () => {
    expect(weeklyKgToAnnualTonnes(7)).toBeCloseTo(0.365, 2);
  });

  it('converts kg to car km equivalent', () => {
    expect(kgToCarKmEquivalent(17.2, 0.172)).toBe('100');
  });

  it('defines labels for every emission category', () => {
    expect(Object.keys(CATEGORY_LABELS)).toEqual([
      'transport',
      'food',
      'home_energy',
      'shopping',
      'services',
    ]);
  });
});
