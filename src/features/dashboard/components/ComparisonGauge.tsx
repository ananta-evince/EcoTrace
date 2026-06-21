'use client';

import { memo } from 'react';

type ComparisonGaugeProps = {
  userDaily: number;
  nationalDaily: number;
  targetDaily: number;
};

export const ComparisonGauge = memo(function ComparisonGauge({
  userDaily,
  nationalDaily,
  targetDaily,
}: ComparisonGaugeProps) {
  const max = Math.max(userDaily, nationalDaily, targetDaily) * 1.2 || 20;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-950">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Daily comparison</h3>
      <div role="img" aria-label={`Gauge comparing your ${userDaily.toFixed(1)} kg daily footprint against national average and target`}>
        <svg viewBox="0 0 200 120" className="mx-auto w-full max-w-xs motion-reduce:transition-none">
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <path
            d={`M 20 100 A 80 80 0 0 1 ${20 + 160 * (userDaily / max)} ${100 - 80 * Math.sin(Math.PI * (userDaily / max))}`}
            fill="none"
            stroke="#22c55e"
            strokeWidth="12"
            className="motion-safe:animate-[draw_1s_ease-out]"
          />
        </svg>
        <ul className="mt-2 space-y-1 text-sm">
          <li className="flex justify-between">
            <span>You</span>
            <span className="font-mono">{userDaily.toFixed(1)} kg/day</span>
          </li>
          <li className="flex justify-between">
            <span>National avg</span>
            <span className="font-mono">{nationalDaily.toFixed(1)} kg/day</span>
          </li>
          <li className="flex justify-between text-brand-700">
            <span>1.5°C target</span>
            <span className="font-mono">{targetDaily.toFixed(1)} kg/day</span>
          </li>
        </ul>
      </div>
    </div>
  );
});
