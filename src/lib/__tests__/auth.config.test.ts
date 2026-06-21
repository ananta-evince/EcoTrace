import { describe, it, expect } from 'vitest';
import { authConfig } from '../auth.config';

describe('authConfig callbacks', () => {
  const authorized = authConfig.callbacks!.authorized!;

  it('blocks unauthenticated access to protected routes', () => {
    const result = authorized({
      auth: null,
      request: { nextUrl: new URL('http://localhost/dashboard') },
    } as Parameters<typeof authorized>[0]);
    expect(result).toBe(false);
  });

  it('allows authenticated access to protected routes', () => {
    const result = authorized({
      auth: { user: { id: '1' } },
      request: { nextUrl: new URL('http://localhost/dashboard') },
    } as Parameters<typeof authorized>[0]);
    expect(result).toBe(true);
  });

  it('redirects logged-in users away from auth routes', () => {
    const result = authorized({
      auth: { user: { id: '1' } },
      request: { nextUrl: new URL('http://localhost/login') },
    } as Parameters<typeof authorized>[0]);
    expect(result).toBeInstanceOf(Response);
  });

  it('allows public routes', () => {
    const result = authorized({
      auth: null,
      request: { nextUrl: new URL('http://localhost/') },
    } as Parameters<typeof authorized>[0]);
    expect(result).toBe(true);
  });

  it('sets user id on JWT and session', () => {
    const token = authConfig.callbacks!.jwt!({
      token: {},
      user: { id: 'user-abc' },
    } as Parameters<NonNullable<typeof authConfig.callbacks.jwt>>[0]);
    expect(token.sub).toBe('user-abc');

    const session = authConfig.callbacks!.session!({
      session: { user: { email: 'a@b.com' } },
      token: { sub: 'user-abc' },
    } as Parameters<NonNullable<typeof authConfig.callbacks.session>>[0]);
    expect(session.user?.id).toBe('user-abc');
  });
});
