import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getEnv, getAuthSecret } from '../env';

describe('getEnv', () => {
  const original = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...original,
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/ecotrace',
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXTAUTH_SECRET: 'a'.repeat(32),
      NODE_ENV: 'test',
    };
  });

  afterEach(() => {
    process.env = original;
  });

  it('returns validated env when all required vars are set', () => {
    const env = getEnv();
    expect(env.DATABASE_URL).toContain('postgresql');
    expect(env.NEXTAUTH_SECRET).toHaveLength(32);
  });

  it('throws when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL;
    expect(() => getEnv()).toThrow('Invalid environment variables');
  });
});

describe('getAuthSecret', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = original;
    vi.unstubAllEnvs();
  });

  it('returns secret when set', () => {
    process.env.AUTH_SECRET = 'b'.repeat(32);
    expect(getAuthSecret()).toBe('b'.repeat(32));
  });

  it('uses dev fallback in non-production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    delete process.env.AUTH_SECRET;
    delete process.env.NEXTAUTH_SECRET;
    expect(getAuthSecret()).toContain('ecotrace-dev');
  });

  it('throws when secret is too short', () => {
    vi.stubEnv('NODE_ENV', 'development');
    process.env.AUTH_SECRET = 'short';
    expect(() => getAuthSecret()).toThrow('at least 32');
  });

  it('throws in production when secret is missing', () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.AUTH_SECRET;
    delete process.env.NEXTAUTH_SECRET;
    expect(() => getAuthSecret()).toThrow('AUTH_SECRET is required');
  });
});
