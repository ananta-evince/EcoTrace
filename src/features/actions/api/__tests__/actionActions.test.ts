import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adoptActionAction, completeActionAction } from '../actionActions';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: 'user-1' } })),
}));

const mockFindFirst = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockFindMany = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    userAction: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

describe('actionActions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('adopts a new action', async () => {
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({});
    const result = await adoptActionAction('green-energy');
    expect(result.ok).toBe(true);
  });

  it('rejects duplicate adoption', async () => {
    mockFindFirst.mockResolvedValue({ id: 'existing' });
    const result = await adoptActionAction('green-energy');
    expect(result.ok).toBe(false);
  });

  it('completes an active action', async () => {
    mockFindFirst.mockResolvedValue({ id: 'action-1' });
    mockUpdate.mockResolvedValue({});
    const result = await completeActionAction('green-energy');
    expect(result.ok).toBe(true);
  });

  it('rejects completing unknown action', async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await completeActionAction('unknown');
    expect(result.ok).toBe(false);
  });

  it('lists user actions', async () => {
    const { getUserActionsAction } = await import('../actionActions');
    mockFindMany.mockResolvedValue([{ actionId: 'green-energy', status: 'active' }]);
    const actions = await getUserActionsAction();
    expect(actions).toHaveLength(1);
  });
});
