import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createCarbonEntry,
  listCarbonEntries,
  getCarbonEntry,
  updateCarbonEntry,
  deleteCarbonEntry,
} from '../carbonEntryRepository';

const mockCreate = vi.fn();
const mockFindMany = vi.fn();
const mockFindFirst = vi.fn();
const mockUpdateMany = vi.fn();
const mockDeleteMany = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    carbonEntry: {
      create: (...args: unknown[]) => mockCreate(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
    },
  },
}));

const userId = 'user-1' as import('../../types').UserId;
const entryId = 'entry-1' as import('../../types').EntryId;

const baseRow = {
  id: entryId,
  userId,
  category: 'transport',
  subcategory: 'car_petrol',
  value: 10,
  unit: 'km',
  kgCO2e: 1.72,
  date: new Date('2024-06-01'),
  note: null,
  createdAt: new Date(),
};

describe('carbonEntryRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an entry with calculated emissions', async () => {
    mockCreate.mockResolvedValue(baseRow);
    const result = await createCarbonEntry(userId, {
      category: 'transport',
      subcategory: 'car_petrol',
      value: 10,
      unit: 'km',
      date: new Date('2024-06-01'),
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.kgCO2e).toBeCloseTo(1.72, 1);
  });

  it('returns error when create fails', async () => {
    mockCreate.mockRejectedValue(new Error('DB error'));
    const result = await createCarbonEntry(userId, {
      category: 'transport',
      subcategory: 'car_petrol',
      value: 10,
      unit: 'km',
      date: new Date('2024-06-01'),
    });
    expect(result.ok).toBe(false);
  });

  it('lists entries with cursor pagination', async () => {
    mockFindMany.mockResolvedValue([baseRow, { ...baseRow, id: 'entry-2' }]);
    const result = await listCarbonEntries(userId, { take: 1 });
    expect(result.entries).toHaveLength(1);
    expect(result.nextCursor).toBeDefined();
  });

  it('lists entries with category and date filters', async () => {
    mockFindMany.mockResolvedValue([baseRow]);
    await listCarbonEntries(userId, {
      take: 20,
      category: 'transport',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
    });
    expect(mockFindMany).toHaveBeenCalled();
  });

  it('returns null for missing entry', async () => {
    mockFindFirst.mockResolvedValue(null);
    expect(await getCarbonEntry(userId, entryId)).toBeNull();
  });

  it('updates entry scoped to user', async () => {
    mockFindFirst.mockResolvedValueOnce(baseRow).mockResolvedValueOnce({ ...baseRow, value: 20 });
    mockUpdateMany.mockResolvedValue({ count: 1 });
    const result = await updateCarbonEntry(userId, entryId, { value: 20 });
    expect(result.ok).toBe(true);
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: entryId, userId } }),
    );
  });

  it('rejects update when entry not owned', async () => {
    mockFindFirst.mockResolvedValue(baseRow);
    mockUpdateMany.mockResolvedValue({ count: 0 });
    const result = await updateCarbonEntry(userId, entryId, { value: 20 });
    expect(result.ok).toBe(false);
  });

  it('deletes entry scoped to user', async () => {
    mockFindFirst.mockResolvedValue(baseRow);
    mockDeleteMany.mockResolvedValue({ count: 1 });
    const result = await deleteCarbonEntry(userId, entryId);
    expect(result.ok).toBe(true);
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { id: entryId, userId } });
  });
});
