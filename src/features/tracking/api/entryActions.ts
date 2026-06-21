'use server';

import { requireUserId } from '@/lib/session';
import { carbonEntrySchema, type CarbonEntryInput } from '../types/schemas';
import { DEFAULT_COMMUTE_KM } from '../utils/emissionFactors';
import {
  createCarbonEntry,
  deleteCarbonEntry,
  listCarbonEntries,
  updateCarbonEntry,
} from '../api/carbonEntryRepository';
import type { EntryId, CarbonEntry } from '../types';
import type { Result } from '@/lib/result';

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

/** Server action to list entries with optional cursor pagination. */
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
  const parsed = carbonEntrySchema.partial().safeParse({
    ...raw,
    ...(raw.value !== undefined && raw.value !== '' ? { value: Number(raw.value) } : {}),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.message };

  const input = Object.fromEntries(
    Object.entries(parsed.data).filter(([, value]) => value !== undefined),
  ) as Partial<CarbonEntryInput>;

  return updateCarbonEntry(userId, id as EntryId, input);
}

/** Quick commute shortcut entry. */
export async function quickCommuteAction(): Promise<Result<CarbonEntry, string>> {
  const userId = await requireUserId();
  return createCarbonEntry(userId, {
    category: 'transport',
    subcategory: 'car_petrol',
    value: DEFAULT_COMMUTE_KM,
    unit: 'km',
    date: new Date(),
    note: 'Daily commute',
  });
}
