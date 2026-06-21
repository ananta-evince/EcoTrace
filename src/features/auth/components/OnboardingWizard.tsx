'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  saveOnboardingStep1,
  saveOnboardingStep2,
  completeOnboarding,
} from '../api/onboardingActions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TARGET_ANNUAL_TONNES } from '@/features/tracking/utils/emissionFactors';

type OnboardingWizardProps = {
  initialStep: number;
};

export function OnboardingWizard({ initialStep }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [error, setError] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<{
    annualFootprint: number;
    nationalAverage: number;
    target: number;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStep1 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveOnboardingStep1(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStep(2);
    });
  };

  const handleStep2 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveOnboardingStep2(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const baselineResult = await completeOnboarding();
      if (baselineResult.ok) setBaseline(baselineResult.value);
      setStep(3);
    });
  };

  const handleFinish = () => router.push('/track');

  return (
    <div className="mx-auto max-w-lg">
      <nav aria-label="Onboarding progress" className="mb-8">
        <ol className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <li
              key={s}
              className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              aria-current={s === step ? 'step' : undefined}
            >
              <span className="sr-only">Step {s}</span>
            </li>
          ))}
        </ol>
      </nav>

      {error && (
        <p role="alert" className="mb-4 text-sm text-carbon-high">
          ⚠ {error}
        </p>
      )}

      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Personal profile</h1>
          <div>
            <label htmlFor="country" className="mb-1 block text-sm font-medium">
              Country
            </label>
            <select id="country" name="country" required className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900">
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="IN">India</option>
              <option value="AU">Australia</option>
            </select>
          </div>
          <Input label="Household size" name="householdSize" type="number" min="1" max="20" required defaultValue="2" />
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Car ownership</legend>
            <label className="mr-4">
              <input type="radio" name="carOwnership" value="true" /> Yes
            </label>
            <label>
              <input type="radio" name="carOwnership" value="false" defaultChecked /> No
            </label>
          </fieldset>
          <div>
            <label htmlFor="dietType" className="mb-1 block text-sm font-medium">
              Diet type
            </label>
            <select id="dietType" name="dietType" required className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900">
              <option value="vegan">Vegan</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="omnivore">Omnivore</option>
              <option value="meat-heavy">Meat-heavy</option>
            </select>
          </div>
          <Button type="submit" loading={isPending}>
            Continue
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Home energy</h1>
          <div>
            <label htmlFor="heatingType" className="mb-1 block text-sm font-medium">
              Heating type
            </label>
            <select id="heatingType" name="heatingType" required className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900">
              <option value="gas">Gas</option>
              <option value="electric">Electric</option>
              <option value="heat_pump">Heat pump</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Input label="Monthly electricity (kWh)" name="monthlyEnergy" type="number" min="1" required defaultValue="250" />
          <Input label="Home size (m²)" name="homeSize" type="number" min="1" required defaultValue="85" />
          <Button type="submit" loading={isPending}>
            Continue
          </Button>
        </form>
      )}

      {step === 3 && baseline && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your baseline estimate</h1>
          <div role="status" aria-live="polite" className="rounded-xl bg-brand-50 p-6 dark:bg-brand-950">
            <p className="font-mono text-3xl font-bold text-brand-800 dark:text-brand-200">
              {baseline.annualFootprint.toFixed(1)} tCO₂e/year
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              National average: {baseline.nationalAverage.toFixed(1)} tCO₂e/year
            </p>
            <p className="text-sm text-brand-700">
              1.5°C target: {TARGET_ANNUAL_TONNES} tCO₂e/year
            </p>
          </div>
          <Button onClick={handleFinish}>Start tracking your actual footprint</Button>
        </div>
      )}
    </div>
  );
}
