import { prisma } from '@/lib/prisma';

import type { UserId } from '../../types';
import { startOfWeek, endOfWeek } from '../../utils/dateUtils';

import { sumKg } from './types';

/** Returns the current week's total emissions for a user. */
export async function getWeekTotal(userId: UserId): Promise<number> {
  const now = new Date();
  const entries = await prisma.carbonEntry.findMany({
    where: { userId, date: { gte: startOfWeek(now), lte: endOfWeek(now) } },
    select: { kgCO2e: true },
  });
  return sumKg(entries);
}
