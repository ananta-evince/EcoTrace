import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCarbonSummary, getDashboardData } from '../carbonSummaryRepository';

const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    carbonEntry: { findMany: (...args: unknown[]) => mockFindMany(...args) },
    user: { findUnique: (...args: unknown[]) => mockFindUnique(...args) },
    userAction: { findMany: vi.fn(() => Promise.resolve([])) },
  },
}));

const entry = {
  id: 'e1',
  userId: 'u1',
  category: 'transport',
  subcategory: 'car_petrol',
  value: 10,
  unit: 'km',
  kgCO2e: 1.72,
  date: new Date(),
  note: null,
};

describe('getCarbonSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindUnique.mockResolvedValue({ country: 'GB' });
  });

  it('computes summary from current and previous periods', async () => {
    mockFindMany
      .mockResolvedValueOnce([entry, { ...entry, kgCO2e: 5 }])
      .mockResolvedValueOnce([{ ...entry, kgCO2e: 20 }]);
    const summary = await getCarbonSummary('user-1' as never, { weeks: 4 });
    expect(summary.totalKgCO2e).toBeCloseTo(6.72, 1);
    expect(summary.topCategory).toBe('transport');
  });

  it('computes summary with down trend', async () => {
    mockFindMany
      .mockResolvedValueOnce([{ ...entry, kgCO2e: 10 }])
      .mockResolvedValueOnce([{ ...entry, kgCO2e: 100 }]);
    const summary = await getCarbonSummary('user-1' as never, { weeks: 4 });
    expect(summary.trend).toBe('down');
  });

  it('computes summary with up trend', async () => {
    mockFindMany
      .mockResolvedValueOnce([{ ...entry, kgCO2e: 100 }])
      .mockResolvedValueOnce([{ ...entry, kgCO2e: 10 }]);
    const summary = await getCarbonSummary('user-1' as never, { weeks: 4 });
    expect(summary.trend).toBe('up');
  });
});

describe('getDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindUnique.mockResolvedValue({ country: 'GB' });
    mockFindMany.mockResolvedValue([entry]);
  });

  it('returns scoped dashboard metrics', async () => {
    const data = await getDashboardData('user-1' as never);
    expect(data.dailyTarget).toBeGreaterThan(0);
    expect(data.recentEntries).toHaveLength(1);
    expect(mockFindMany).toHaveBeenCalled();
  });
});
