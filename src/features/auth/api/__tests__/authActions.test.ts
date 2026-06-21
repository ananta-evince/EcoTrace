import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signupAction, loginAction } from '../authActions';

vi.mock('@/lib/request', () => ({
  getClientIp: vi.fn(() => Promise.resolve('127.0.0.1')),
}));

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true })),
}));

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
const mockSignIn = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

describe('authActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockResolvedValue(undefined);
  });

  it('rejects weak passwords on signup', async () => {
    const fd = new FormData();
    fd.set('name', 'Test User');
    fd.set('email', 'test@example.com');
    fd.set('password', 'weakpass');
    const result = await signupAction(fd);
    expect(result.ok).toBe(false);
  });

  it('rejects duplicate email on signup', async () => {
    mockFindUnique.mockResolvedValue({ id: 'existing' });
    const fd = new FormData();
    fd.set('name', 'Test User');
    fd.set('email', 'test@example.com');
    fd.set('password', 'SecurePass1');
    const result = await signupAction(fd);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('already registered');
  });

  it('creates user and signs in on valid signup', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: 'new-user' });
    const fd = new FormData();
    fd.set('name', 'Test User');
    fd.set('email', 'new@example.com');
    fd.set('password', 'SecurePass1');
    const result = await signupAction(fd);
    expect(result.ok).toBe(true);
    expect(mockSignIn).toHaveBeenCalled();
  });

  it('returns error on failed login', async () => {
    mockSignIn.mockRejectedValue(new Error('Invalid'));
    const fd = new FormData();
    fd.set('email', 'test@example.com');
    fd.set('password', 'SecurePass1');
    const result = await loginAction(fd);
    expect(result.ok).toBe(false);
  });

  it('blocks signup when rate limited', async () => {
    const { checkRateLimit } = await import('@/lib/rateLimit');
    vi.mocked(checkRateLimit).mockReturnValueOnce({ allowed: false, retryAfter: 60 });
    const fd = new FormData();
    fd.set('name', 'Test');
    fd.set('email', 'test@example.com');
    fd.set('password', 'SecurePass1');
    const result = await signupAction(fd);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('Too many');
  });
});
