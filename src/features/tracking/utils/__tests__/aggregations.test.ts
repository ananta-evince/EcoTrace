import { describe, it, expect } from 'vitest';
import { getWeeklyRollup, getMonthlyAggregation, getRollingAverage } from '../aggregations';

const entries = [
  { date: new Date('2024-06-01'), kgCO2e: 10, category: 'transport' },
  { date: new Date('2024-06-02'), kgCO2e: 5, category: 'food' },
  { date: new Date('2024-06-03'), kgCO2e: 3, category: 'transport' },
  { date: new Date('2024-07-01'), kgCO2e: 20, category: 'home_energy' },
];

describe('getWeeklyRollup', () => {
  it('returns weekly buckets with category breakdown', () => {
    const result = getWeeklyRollup(entries, 2);
    expect(result).toHaveLength(2);
    expect(result[0]?.total).toBeGreaterThanOrEqual(0);
  });
});

describe('getMonthlyAggregation', () => {
  it('aggregates entries by month', () => {
    const result = getMonthlyAggregation(entries);
    expect(result.some((m) => m.month === '2024-06')).toBe(true);
    expect(result.find((m) => m.month === '2024-06')?.total).toBe(18);
  });
});

describe('getRollingAverage', () => {
  it('returns empty array for no entries', () => {
    expect(getRollingAverage([])).toEqual([]);
  });

  it('computes rolling averages with sliding window', () => {
    const daily = Array.from({ length: 5 }, (_, i) => ({
      date: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
      kgCO2e: 10,
    }));
    const result = getRollingAverage(daily, 90);
    expect(result).toHaveLength(5);
    expect(result[4]?.average).toBeCloseTo(10 / 90 * 5, 4);
  });
});
