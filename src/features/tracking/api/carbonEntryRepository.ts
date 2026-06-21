import type { Prisma } from '@prisma/client';

import { DEFAULT_ENTRY_PAGE_SIZE } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import type { Result } from '@/lib/result';
import { ok, err } from '@/lib/result';

import type { CarbonEntry, EntryId, UserId } from '../types';
import type { CarbonEntryInput, EntryQueryInput } from '../types/schemas';
import { calculateEmissions } from '../utils/calculateEmissions';

type CarbonEntryRow = {
  id: string;
  userId: string;
  category: string;
  subcategory: string;
  value: number;
  unit: string;
  kgCO2e: number;
  date: Date;
  note: string | null;
  createdAt: Date;
};

/** Maps a Prisma row to the domain CarbonEntry type. */
function mapEntry(row: CarbonEntryRow): CarbonEntry {
  return {
    id: row.id as EntryId,
    userId: row.userId as UserId,
    category: row.category as CarbonEntry['category'],
    subcategory: row.subcategory,
    value: row.value,
    unit: row.unit,
    kgCO2e: row.kgCO2e,
    date: row.date,
    ...(row.note ? { note: row.note } : {}),
    createdAt: row.createdAt,
  };
}

/** Builds a typed Prisma filter for listing entries. */
function buildEntryWhere(userId: UserId, query: EntryQueryInput): Prisma.CarbonEntryWhereInput {
  const where: Prisma.CarbonEntryWhereInput = { userId };
  if (query.category) where.category = query.category;
  if (query.startDate || query.endDate) {
    where.date = {
      ...(query.startDate ? { gte: query.startDate } : {}),
      ...(query.endDate ? { lte: query.endDate } : {}),
    };
  }
  return where;
}

/** Creates a carbon entry for a user. */
export async function createCarbonEntry(
  userId: UserId,
  input: CarbonEntryInput,
): Promise<Result<CarbonEntry, string>> {
  try {
    const kgCO2e = calculateEmissions({
      category: input.category as CarbonEntry['category'],
      subcategory: input.subcategory,
      value: input.value,
      unit: input.unit,
    });

    const row = await prisma.carbonEntry.create({
      data: {
        userId,
        category: input.category,
        subcategory: input.subcategory,
        value: input.value,
        unit: input.unit,
        kgCO2e,
        date: input.date,
        note: input.note ?? null,
      },
    });

    return ok(mapEntry(row));
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Failed to create entry');
  }
}

/** Lists carbon entries with cursor pagination. */
export async function listCarbonEntries(
  userId: UserId,
  query: EntryQueryInput,
): Promise<{ entries: CarbonEntry[]; nextCursor?: string }> {
  const take = query.take ?? DEFAULT_ENTRY_PAGE_SIZE;
  const rows = await prisma.carbonEntry.findMany({
    where: buildEntryWhere(userId, query),
    take: take + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    orderBy: { date: 'desc' },
  });

  let nextCursor: string | undefined;
  if (rows.length > take) {
    const next = rows.pop();
    nextCursor = next?.id;
  }

  return { entries: rows.map(mapEntry), ...(nextCursor ? { nextCursor } : {}) };
}

/** Gets a single entry scoped to user. */
export async function getCarbonEntry(
  userId: UserId,
  entryId: EntryId,
): Promise<CarbonEntry | null> {
  const row = await prisma.carbonEntry.findFirst({
    where: { id: entryId, userId },
  });
  return row ? mapEntry(row) : null;
}

/** Updates an entry scoped to user. */
export async function updateCarbonEntry(
  userId: UserId,
  entryId: EntryId,
  input: Partial<CarbonEntryInput>,
): Promise<Result<CarbonEntry, string>> {
  const existing = await getCarbonEntry(userId, entryId);
  if (!existing) return err('Entry not found');

  const merged = {
    category: (input.category ?? existing.category) as CarbonEntry['category'],
    subcategory: input.subcategory ?? existing.subcategory,
    value: input.value ?? existing.value,
    unit: input.unit ?? existing.unit,
    date: input.date ?? existing.date,
    note: input.note ?? existing.note,
  };

  const kgCO2e = calculateEmissions(merged);

  try {
    const updated = await prisma.carbonEntry.updateMany({
      where: { id: entryId, userId },
      data: {
        category: merged.category,
        subcategory: merged.subcategory,
        value: merged.value,
        unit: merged.unit,
        kgCO2e,
        date: merged.date,
        note: merged.note ?? null,
      },
    });
    if (updated.count === 0) return err('Entry not found');

    const row = await prisma.carbonEntry.findFirst({ where: { id: entryId, userId } });
    if (!row) return err('Entry not found');
    return ok(mapEntry(row));
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Failed to update entry');
  }
}

/** Deletes an entry scoped to user. */
export async function deleteCarbonEntry(
  userId: UserId,
  entryId: EntryId,
): Promise<Result<void, string>> {
  const existing = await getCarbonEntry(userId, entryId);
  if (!existing) return err('Entry not found');

  await prisma.carbonEntry.deleteMany({ where: { id: entryId, userId } });
  return ok(undefined);
}
