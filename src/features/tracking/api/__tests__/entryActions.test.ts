import { describe, it, expect, vi, beforeEach } from 'vitest';

import { auth } from '@/lib/auth';

import { createEntryAction, deleteEntryAction, listEntriesAction, updateEntryAction } from '../entryActions';
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: 'user-1' } })),
}));
const mockCreate = vi.fn();
const mockList = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();

vi.mock('../carbonEntryRepository', () => ({
  createCarbonEntry: (...args: unknown[]) => mockCreate(...args),
  listCarbonEntries: (...args: unknown[]) => mockList(...args),
  deleteCarbonEntry: (...args: unknown[]) => mockDelete(...args),
  updateCarbonEntry: (...args: unknown[]) => mockUpdate(...args),
}));

describe('entryActions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates entry from valid form data', async () => {
    mockCreate.mockResolvedValue({ ok: true, value: { id: 'e1' } });
    const fd = new FormData();
    fd.set('category', 'transport');
    fd.set('subcategory', 'car_petrol');
    fd.set('value', '10');
    fd.set('unit', 'km');
    fd.set('date', '2024-06-01');
    const result = await createEntryAction(fd);
    expect(result.ok).toBe(true);
  });

  it('rejects invalid form data', async () => {
    const fd = new FormData();
    fd.set('category', 'invalid');
    const result = await createEntryAction(fd);
    expect(result.ok).toBe(false);
  });

  it('lists entries for authenticated user', async () => {
    mockList.mockResolvedValue({ entries: [], nextCursor: undefined });
    const result = await listEntriesAction();
    expect(result.entries).toEqual([]);
  });

  it('deletes entry by id', async () => {
    mockDelete.mockResolvedValue({ ok: true, value: undefined });
    const result = await deleteEntryAction('entry-1');
    expect(result.ok).toBe(true);
  });

  it('throws when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    const fd = new FormData();
    await expect(createEntryAction(fd)).rejects.toThrow('Unauthorized');
  });

  it('lists entries with cursor', async () => {
    mockList.mockResolvedValue({ entries: [], nextCursor: 'cursor-1' });
    await listEntriesAction('cursor-1');
    expect(mockList).toHaveBeenCalledWith('user-1', expect.objectContaining({ cursor: 'cursor-1' }));
  });
});

describe('quickCommuteAction', () => {
  it('creates a commute shortcut entry', async () => {
    const { quickCommuteAction } = await import('../entryActions');
    mockCreate.mockResolvedValue({ ok: true, value: { id: 'e1', subcategory: 'car_petrol' } });
    const result = await quickCommuteAction();
    expect(result.ok).toBe(true);
    expect(mockCreate).toHaveBeenCalled();
  });
});

describe('updateEntryAction', () => {
  it('updates entry fields', async () => {
    mockUpdate.mockResolvedValue({ ok: true, value: { id: 'e1' } });
    const fd = new FormData();
    fd.set('value', '20');
    const result = await updateEntryAction('entry-1', fd);
    expect(result.ok).toBe(true);
    expect(mockUpdate).toHaveBeenCalled();
  });
});
