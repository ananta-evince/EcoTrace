import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  saveOnboardingStep1,
  saveOnboardingStep2,
  completeOnboarding,
} from '../onboardingActions';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: 'user-1' } })),
}));

const mockUpdate = vi.fn();
const mockUpsert = vi.fn();
const mockFindUnique = vi.fn();
const mockProgressFindUnique = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      update: (...args: unknown[]) => mockUpdate(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
    onboardingProgress: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
      update: (...args: unknown[]) => mockUpsert(...args),
      findUnique: (...args: unknown[]) => mockProgressFindUnique(...args),
    },
  },
}));

describe('onboardingActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockResolvedValue({});
    mockUpsert.mockResolvedValue({});
  });

  it('saves step 1 data', async () => {
    const fd = new FormData();
    fd.set('country', 'GB');
    fd.set('householdSize', '2');
    fd.set('carOwnership', 'false');
    fd.set('dietType', 'omnivore');
    const result = await saveOnboardingStep1(fd);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.step).toBe(2);
  });

  it('rejects invalid step 1 data', async () => {
    const fd = new FormData();
    fd.set('country', 'INVALID');
    const result = await saveOnboardingStep1(fd);
    expect(result.ok).toBe(false);
  });

  it('saves step 2 data', async () => {
    const fd = new FormData();
    fd.set('heatingType', 'gas');
    fd.set('monthlyEnergy', '250');
    fd.set('homeSize', '85');
    const result = await saveOnboardingStep2(fd);
    expect(result.ok).toBe(true);
  });

  it('completes onboarding with baseline', async () => {
    mockFindUnique.mockResolvedValue({
      country: 'GB',
      householdSize: 2,
      dietType: 'omnivore',
      carOwnership: false,
    });
    const result = await completeOnboarding();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.annualFootprint).toBeGreaterThan(0);
  });

  it('returns error when user not found', async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await completeOnboarding();
    expect(result.ok).toBe(false);
  });
});

describe('getOnboardingProgress', () => {
  it('loads progress for user', async () => {
    const { getOnboardingProgress } = await import('../onboardingActions');
    mockProgressFindUnique.mockResolvedValue({ step: 2 });
    const progress = await getOnboardingProgress('user-1' as never);
    expect(progress?.step).toBe(2);
  });
});
