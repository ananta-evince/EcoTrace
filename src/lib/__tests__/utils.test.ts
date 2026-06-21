import { describe, it, expect, vi, beforeEach } from 'vitest';

import { cn, debounce, formatKgCO2e, formatDate, hashString } from '../utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('resolves tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('delays function execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});

describe('formatKgCO2e', () => {
  it('formats with default decimals', () => {
    expect(formatKgCO2e(12.345)).toBe('12.3 kgCO₂e');
  });
});

describe('formatDate', () => {
  it('formats a date in en-GB locale', () => {
    expect(formatDate(new Date('2024-06-15'))).toMatch(/15/);
  });
});

describe('hashString', () => {
  it('returns a consistent SHA-256 hex digest', async () => {
    const hash = await hashString('test');
    expect(hash).toHaveLength(64);
    expect(await hashString('test')).toBe(hash);
  });
});
