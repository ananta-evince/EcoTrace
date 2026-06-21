import { describe, it, expect } from 'vitest';

import { buildCategoryBreakdown, getTopCategory, sumKg } from '@/features/tracking/api/summary/types';

describe('summary helpers', () => {
  it('sums kg values', () => {
    expect(sumKg([{ kgCO2e: 1.5 }, { kgCO2e: 2.5 }])).toBe(4);
  });

  it('builds category breakdown', () => {
    const breakdown = buildCategoryBreakdown([
      { category: 'transport', kgCO2e: 10 },
      { category: 'food', kgCO2e: 5 },
      { category: 'transport', kgCO2e: 3 },
    ]);
    expect(breakdown).toEqual({ transport: 13, food: 5 });
  });

  it('resolves top category and percent', () => {
    const top = getTopCategory({ transport: 75, food: 25 });
    expect(top.category).toBe('transport');
    expect(top.percent).toBe(75);
  });
});
