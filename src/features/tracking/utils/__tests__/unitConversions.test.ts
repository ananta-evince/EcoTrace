import { describe, it, expect } from 'vitest';

import { milesToKm, lbsToKg, gallonsToLitres, normaliseToFactorUnit } from '../unitConversions';

describe('unitConversions', () => {
  it('converts miles to km', () => {
    expect(milesToKm(1)).toBeCloseTo(1.609, 2);
  });

  it('converts lbs to kg', () => {
    expect(lbsToKg(1)).toBeCloseTo(0.454, 2);
  });

  it('converts gallons to litres', () => {
    expect(gallonsToLitres(1)).toBeCloseTo(3.785, 2);
  });

  it('returns same value when units match', () => {
    expect(normaliseToFactorUnit(10, 'km', 'km')).toBe(10);
  });

  it('converts miles to km for factor unit', () => {
    expect(normaliseToFactorUnit(10, 'miles', 'km')).toBeCloseTo(16.09, 1);
  });

  it('converts EUR to GBP', () => {
    expect(normaliseToFactorUnit(100, 'EUR', 'GBP')).toBeCloseTo(86, 0);
  });
});
