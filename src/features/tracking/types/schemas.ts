import { z } from 'zod';
import { EMISSION_CATEGORIES, UNITS } from './index';

export const carbonEntrySchema = z.object({
  category: z.enum(EMISSION_CATEGORIES as [string, ...string[]]),
  subcategory: z.string().min(1).max(100),
  value: z.number().positive().max(1_000_000),
  unit: z.enum(UNITS),
  date: z.coerce.date(),
  note: z.string().max(500).optional(),
});

export type CarbonEntryInput = z.infer<typeof carbonEntrySchema>;

export const updateCarbonEntrySchema = carbonEntrySchema.partial().extend({
  id: z.string().cuid(),
});

export type UpdateCarbonEntryInput = z.infer<typeof updateCarbonEntrySchema>;

export const entryQuerySchema = z.object({
  cursor: z.string().cuid().optional(),
  category: z.enum(EMISSION_CATEGORIES as [string, ...string[]]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  take: z.number().int().min(1).max(100).default(20),
});

export type EntryQueryInput = z.infer<typeof entryQuerySchema>;
