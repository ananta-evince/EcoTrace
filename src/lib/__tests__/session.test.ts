import { describe, it, expect, vi } from 'vitest';
import { requireUserId } from '../session';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/lib/auth';

describe('requireUserId', () => {
  it('returns the authenticated user id', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-abc' } } as never);
    await expect(requireUserId()).resolves.toBe('user-abc');
  });

  it('throws when session is missing', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    await expect(requireUserId()).rejects.toThrow('Unauthorized');
  });
});
