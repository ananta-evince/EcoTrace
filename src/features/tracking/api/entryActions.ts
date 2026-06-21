'use server';

import { auth } from '@/lib/auth';
import { carbonEntrySchema } from '../types/schemas';
import {
  createCarbonEntry,
  deleteCarbonEntry,
  listCarbonEntries,
  updateCarbonEntry,
} from '../api/carbonEntryRepository';
import type { UserId, EntryId, CarbonEntry } from '../types';
import type { Result } from '@/lib/result';

async function requireUserId(): Promise<UserId> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id as UserId;
}

/** Server action to create a carbon entry. */
export async function createEntryAction(
  formData: FormData,
): Promise<Result<CarbonEntry, string>> {
  const userId = await requireUserId();
  const raw = Object.fromEntries(formData.entries());
  const parsed = carbonEntrySchema.safeParse({
    ...raw,
    value: Number(raw.value),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  return createCarbonEntry(userId, parsed.data);
}

/** Server action to list entries. */
export async function listEntriesAction(cursor?: string) {
  const userId = await requireUserId();
  return listCarbonEntries(userId, { take: 20, ...(cursor ? { cursor } : {}) });
}

/** Server action to delete an entry. */
export async function deleteEntryAction(id: string): Promise<Result<void, string>> {
  const userId = await requireUserId();
  return deleteCarbonEntry(userId, id as EntryId);
}

/** Server action to update an entry. */
export async function updateEntryAction(
  id: string,
  formData: FormData,
): Promise<Result<CarbonEntry, string>> {
  const userId = await requireUserId();
  const raw = Object.fromEntries(formData.entries());
  const input: Record<string, unknown> = {};
  if (raw.category) input.category = raw.category;
  if (raw.subcategory) input.subcategory = raw.subcategory;
  if (raw.value) input.value = Number(raw.value);
  if (raw.unit) input.unit = raw.unit;
  if (raw.date) input.date = raw.date;
  if (raw.note) input.note = raw.note;
  return updateCarbonEntry(userId, id as EntryId, input);
}

/** Quick commute shortcut entry. */
export async function quickCommuteAction(): Promise<Result<CarbonEntry, string>> {
  const userId = await requireUserId();
  return createCarbonEntry(userId, {
    category: 'transport',
    subcategory: 'car_petrol',
    value: 20,
    unit: 'km',
    date: new Date(),
    note: 'Daily commute',
  });
}
