import { describe, it, expect } from 'vitest';
import { carbonEntrySchema } from '../../types/schemas';

describe('carbonEntrySchema', () => {
  it('accepts valid input', () => {
    const result = carbonEntrySchema.safeParse({
      category: 'transport',
      subcategory: 'car_petrol',
      value: 10,
      unit: 'km',
      date: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative values', () => {
    const result = carbonEntrySchema.safeParse({
      category: 'transport',
      subcategory: 'car_petrol',
      value: -1,
      unit: 'km',
      date: new Date(),
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = carbonEntrySchema.safeParse({ category: 'transport' });
    expect(result.success).toBe(false);
  });
});
