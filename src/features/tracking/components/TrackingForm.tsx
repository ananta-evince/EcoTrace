'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CATEGORY_LABELS, EMISSION_PREVIEW_DEBOUNCE_MS } from '@/lib/constants';
import { formatKgCO2e } from '@/lib/utils';

import { createEntryAction, quickCommuteAction } from '../api/entryActions';
import { SUBCATEGORIES, EMISSION_CATEGORIES, type EmissionCategory } from '../types';
import { carbonEntrySchema, type CarbonEntryInput } from '../types/schemas';
import { calculateEmissions } from '../utils/calculateEmissions';

export function TrackingForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CarbonEntryInput>({
    resolver: zodResolver(carbonEntrySchema),
    defaultValues: {
      category: 'transport',
      subcategory: 'car_petrol',
      value: 0,
      unit: 'km',
      date: new Date(),
    },
  });

  const category = watch('category') as EmissionCategory;
  const subcategory = watch('subcategory');
  const value = watch('value');
  const unit = watch('unit');

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const kg = calculateEmissions({
          category,
          subcategory,
          value: Number(value) || 0,
          unit,
        });
        setPreview(kg);
      } catch {
        setPreview(0);
      }
    }, EMISSION_PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [category, subcategory, value, unit]);

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v instanceof Date) formData.append(k, v.toISOString());
        else formData.append(k, String(v));
      });
      const result = await createEntryAction(formData);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      setSuccess(true);
      reset();
      setPreview(0);
    });
  });

  const handleQuickCommute = () => {
    startTransition(async () => {
      const result = await quickCommuteAction();
      if (result.ok) setSuccess(true);
      else setServerError(result.error);
    });
  };

  return (
    <section aria-labelledby="track-form-heading" className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-950">
      <h2 id="track-form-heading" className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        Log an entry
      </h2>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Category</legend>
          <div className="flex flex-wrap gap-2">
            {EMISSION_CATEGORIES.map((cat) => (
              <label key={cat} className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm dark:border-gray-700">
                <input type="radio" value={cat} {...register('category')} className="accent-brand-600" />
                {CATEGORY_LABELS[cat]}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="subcategory" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Type
          </label>
          <select
            id="subcategory"
            {...register('subcategory')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          >
            {(SUBCATEGORIES[category] ?? []).map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Amount"
            type="number"
            step="0.1"
            min="0"
            required
            {...(errors.value?.message ? { error: errors.value.message } : {})}
            {...register('value', { valueAsNumber: true })}
          />
          <div>
            <label htmlFor="unit" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Unit
            </label>
            <select
              id="unit"
              {...register('unit')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            >
              <option value="km">km</option>
              <option value="miles">miles</option>
              <option value="kWh">kWh</option>
              <option value="GBP">£</option>
              <option value="meals">meals</option>
              <option value="kg">kg</option>
              <option value="hours">hours</option>
            </select>
          </div>
        </div>

        <Input label="Date" type="date" required {...register('date', { valueAsDate: true })} />

        <Input label="Note (optional)" {...register('note')} />

        <div className="rounded-lg bg-brand-50 p-3 dark:bg-brand-950" aria-live="polite">
          <p className="text-sm text-brand-800 dark:text-brand-200">
            Estimated: <span className="font-mono font-semibold">{formatKgCO2e(preview)}</span>
          </p>
        </div>

        {serverError && (
          <p role="alert" className="text-sm text-carbon-high">
            ⚠ {serverError}
          </p>
        )}

        {success && (
          <div role="status" aria-live="polite" className="text-sm text-brand-700 dark:text-brand-300">
            ✓ Entry saved successfully
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={isPending} disabled={isPending}>
            Save entry
          </Button>
          <Button type="button" variant="secondary" onClick={handleQuickCommute} disabled={isPending}>
            I commuted today
          </Button>
        </div>
      </form>
    </section>
  );
}
