import { describe, it, expect } from 'vitest';

import { computeStreak, startOfWeek, endOfWeek } from '../dateUtils';

describe('dateUtils', () => {
  it('startOfWeek returns Monday', () => {
    const wed = new Date('2024-06-12');
    const start = startOfWeek(wed);
    expect(start.getDay()).toBe(1);
  });

  it('endOfWeek returns Sunday', () => {
    const wed = new Date('2024-06-12');
    const end = endOfWeek(wed);
    expect(end.getDay()).toBe(0);
  });

  it('computeStreak counts consecutive days', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    expect(computeStreak([today, yesterday])).toBe(2);
  });

  it('computeStreak returns 0 for empty', () => {
    expect(computeStreak([])).toBe(0);
  });

  it('computeStreak handles yesterday-only streak', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(computeStreak([yesterday])).toBe(1);
  });
});
