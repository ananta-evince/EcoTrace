import { describe, it, expect } from 'vitest';

import { ok, err, mapResult, flatMapResult, unwrapOr } from '../result';

describe('Result utilities', () => {
  it('ok creates success result', () => {
    expect(ok(42)).toEqual({ ok: true, value: 42 });
  });

  it('err creates failure result', () => {
    expect(err('fail')).toEqual({ ok: false, error: 'fail' });
  });

  it('mapResult transforms success value', () => {
    expect(mapResult(ok(2), (v) => v * 2)).toEqual({ ok: true, value: 4 });
  });

  it('mapResult passes through error', () => {
    expect(mapResult(err('e'), (v: number) => v * 2)).toEqual({ ok: false, error: 'e' });
  });

  it('flatMapResult chains operations', () => {
    const result = flatMapResult(ok(5), (v) => (v > 0 ? ok(v + 1) : err('negative')));
    expect(result).toEqual({ ok: true, value: 6 });
  });

  it('unwrapOr returns default on error', () => {
    expect(unwrapOr(err('e'), 0)).toBe(0);
    expect(unwrapOr(ok(5), 0)).toBe(5);
  });
});
