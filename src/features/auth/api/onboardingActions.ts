'use server';

import { z } from 'zod';

import { calculateBaselineFootprint } from '@/features/tracking/api/carbonSummaryRepository';
import type { UserId } from '@/features/tracking/types';
import { getNationalDailyAverage, TARGET_ANNUAL_TONNES } from '@/features/tracking/utils/emissionFactors';
import { prisma } from '@/lib/prisma';
import type { Result } from '@/lib/result';
import { requireUserId } from '@/lib/session';

const step1Schema = z.object({
  country: z.string().length(2),
  householdSize: z.coerce.number().int().min(1).max(20),
  carOwnership: z.coerce.boolean(),
  vehicleType: z.string().optional(),
  dietType: z.enum(['vegan', 'vegetarian', 'pescatarian', 'omnivore', 'meat-heavy']),
});

const step2Schema = z.object({
  heatingType: z.enum(['gas', 'electric', 'heat_pump', 'other']),
  monthlyEnergy: z.coerce.number().positive(),
  homeSize: z.coerce.number().positive(),
});

/** Saves onboarding step 1 data. */
export async function saveOnboardingStep1(
  formData: FormData,
): Promise<Result<{ step: number }, string>> {
  const userId = await requireUserId();
  const raw = Object.fromEntries(formData.entries());
  const parsed = step1Schema.safeParse({
    ...raw,
    carOwnership: raw.carOwnership === 'true' || raw.carOwnership === 'on',
  });
  if (!parsed.success) return { ok: false, error: parsed.error.message };

  await prisma.user.update({
    where: { id: userId },
    data: {
      country: parsed.data.country,
      householdSize: parsed.data.householdSize,
      carOwnership: parsed.data.carOwnership,
      vehicleType: parsed.data.vehicleType ?? null,
      dietType: parsed.data.dietType,
    },
  });

  await prisma.onboardingProgress.upsert({
    where: { userId },
    create: { userId, step: 2, step1Data: parsed.data },
    update: { step: 2, step1Data: parsed.data },
  });

  return { ok: true, value: { step: 2 } };
}

/** Saves onboarding step 2 data. */
export async function saveOnboardingStep2(
  formData: FormData,
): Promise<Result<{ step: number }, string>> {
  const userId = await requireUserId();
  const parsed = step2Schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: parsed.error.message };

  await prisma.user.update({
    where: { id: userId },
    data: {
      heatingType: parsed.data.heatingType,
      monthlyEnergy: parsed.data.monthlyEnergy,
      homeSize: parsed.data.homeSize,
    },
  });

  await prisma.onboardingProgress.update({
    where: { userId },
    data: { step: 3, step2Data: parsed.data },
  });

  return { ok: true, value: { step: 3 } };
}

/** Completes onboarding and returns baseline estimate. */
export async function completeOnboarding(): Promise<
  Result<{ annualFootprint: number; nationalAverage: number; target: number }, string>
> {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: 'User not found' };

  const annualFootprint = calculateBaselineFootprint({
    country: user.country,
    householdSize: user.householdSize,
    dietType: user.dietType,
    carOwnership: user.carOwnership,
    ...(user.vehicleType ? { vehicleType: user.vehicleType } : {}),
    ...(user.heatingType ? { heatingType: user.heatingType } : {}),
    ...(user.monthlyEnergy ? { monthlyEnergy: user.monthlyEnergy } : {}),
    ...(user.homeSize ? { homeSize: user.homeSize } : {}),
  });

  await prisma.onboardingProgress.update({
    where: { userId },
    data: { completed: true, step: 3 },
  });

  return {
    ok: true,
    value: {
      annualFootprint,
      nationalAverage: (getNationalDailyAverage(user.country) * 365) / 1000,
      target: TARGET_ANNUAL_TONNES,
    },
  };
}

/** Gets current onboarding progress. */
export async function getOnboardingProgress(userId: UserId) {
  return prisma.onboardingProgress.findUnique({ where: { userId } });
}
