import { describe, it, expect, vi } from 'vitest';
import { getClientIp } from '../request';

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: (name: string) => {
      if (name === 'x-forwarded-for') return '203.0.113.1, 70.41.3.18';
      if (name === 'x-real-ip') return '203.0.113.1';
      return null;
    },
  })),
}));

describe('getClientIp', () => {
  it('extracts first IP from x-forwarded-for', async () => {
    expect(await getClientIp()).toBe('203.0.113.1');
  });
});

describe('getClientIp fallback', () => {
  it('uses x-real-ip when forwarded-for is absent', async () => {
    const { headers } = await import('next/headers');
    vi.mocked(headers).mockResolvedValueOnce({
      get: (name: string) => (name === 'x-real-ip' ? '198.51.100.1' : null),
    } as never);
    expect(await getClientIp()).toBe('198.51.100.1');
  });
});
