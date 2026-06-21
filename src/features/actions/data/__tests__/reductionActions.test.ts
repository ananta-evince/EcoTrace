import { describe, it, expect } from 'vitest';
import { REDUCTION_ACTIONS } from '../reductionActions';

describe('REDUCTION_ACTIONS', () => {
  it('contains at least 40 curated actions', () => {
    expect(REDUCTION_ACTIONS.length).toBeGreaterThanOrEqual(40);
  });

  it('each action has required fields', () => {
    for (const action of REDUCTION_ACTIONS) {
      expect(action.id).toBeTruthy();
      expect(action.title).toBeTruthy();
      expect(action.estimatedSavingKgPerYear).toBeGreaterThan(0);
      expect(action.howTo.length).toBeGreaterThan(0);
    }
  });

  it('has unique action ids', () => {
    const ids = REDUCTION_ACTIONS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
