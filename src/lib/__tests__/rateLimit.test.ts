import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimit } from '../rateLimit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimit('test-key');
  });

  it('allows requests under the limit', () => {
    expect(checkRateLimit('test-key').allowed).toBe(true);
    expect(checkRateLimit('test-key').allowed).toBe(true);
  });

  it('blocks after max attempts', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('block-key');
    const result = checkRateLimit('block-key');
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('resets after successful auth', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('reset-key');
    resetRateLimit('reset-key');
    expect(checkRateLimit('reset-key').allowed).toBe(true);
  });
});
