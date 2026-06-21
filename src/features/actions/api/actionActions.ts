'use server';

import { prisma } from '@/lib/prisma';
import type { Result } from '@/lib/result';
import { requireUserId } from '@/lib/session';

/** Adopts a reduction action for the user. */
export async function adoptActionAction(actionId: string): Promise<Result<void, string>> {
  const userId = await requireUserId();
  const existing = await prisma.userAction.findFirst({
    where: { userId, actionId, status: 'active' },
  });
  if (existing) return { ok: false, error: 'Action already adopted' };

  await prisma.userAction.create({ data: { userId, actionId, status: 'active' } });
  return { ok: true, value: undefined };
}

/** Marks an action as completed. */
export async function completeActionAction(actionId: string): Promise<Result<void, string>> {
  const userId = await requireUserId();
  const action = await prisma.userAction.findFirst({
    where: { userId, actionId, status: 'active' },
  });
  if (!action) return { ok: false, error: 'Action not found' };

  await prisma.userAction.update({
    where: { id: action.id },
    data: { status: 'completed', completedAt: new Date() },
  });
  return { ok: true, value: undefined };
}

/** Gets the user's adopted and completed actions. */
export async function getUserActionsAction() {
  const userId = await requireUserId();
  return prisma.userAction.findMany({ where: { userId }, orderBy: { startedAt: 'desc' } });
}
