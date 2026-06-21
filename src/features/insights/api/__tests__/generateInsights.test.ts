import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGeminiGenerate = vi.fn();
const mockFindFirst = vi.fn();
const mockCreate = vi.fn();
const mockSummary = vi.fn();

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: 'user-1' } })),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    insight: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

vi.mock('@/features/tracking/api/carbonSummaryRepository', () => ({
  getCarbonSummary: (...args: unknown[]) => mockSummary(...args),
}));

vi.mock('@/lib/gemini', () => ({
  generateGeminiContent: (...args: unknown[]) => mockGeminiGenerate(...args),
}));

import { auth } from '@/lib/auth';

import { generateInsightsAction, getLatestInsightAction } from '../generateInsights';

describe('generateInsightsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.GEMINI_API_KEY;
    mockSummary.mockResolvedValue({
      totalKgCO2e: 100,
      topCategory: 'transport',
      topCategoryPercent: 50,
      trend: 'down',
      biggestEntry: { subcategory: 'car_petrol', kgCO2e: 20 },
      nationalAverage: 400,
    });
  });

  it('returns cached insight when hash matches', async () => {
    mockFindFirst.mockResolvedValue({
      content: 'Cached insight',
      generatedAt: new Date('2024-06-01'),
    });
    const result = await generateInsightsAction();
    expect(result.cached).toBe(true);
    expect(result.content).toBe('Cached insight');
  });

  it('generates fallback insight without API key', async () => {
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({});
    const result = await generateInsightsAction();
    expect(result.cached).toBe(false);
    expect(result.content).toContain('100.0 kgCO₂e');
  });

  it('calls Gemini when API key is set', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({});
    mockGeminiGenerate.mockResolvedValue('AI insight content');
    const result = await generateInsightsAction();
    expect(result.content).toBe('AI insight content');
    expect(mockGeminiGenerate).toHaveBeenCalled();
  });

  it('throws when unauthorized', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    await expect(generateInsightsAction()).rejects.toThrow('Unauthorized');
  });
});

describe('getLatestInsightAction', () => {
  it('throws when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    await expect(getLatestInsightAction()).rejects.toThrow('Unauthorized');
  });

  it('returns latest insight for user', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-1' } } as never);
    mockFindFirst.mockResolvedValue({ content: 'Latest', generatedAt: new Date() });
    const insight = await getLatestInsightAction();
    expect(insight?.content).toBe('Latest');
  });
});
