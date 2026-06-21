'use client';

import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TARGET_DAILY_KG } from '@/features/tracking/utils/emissionFactors';

type TrendLineProps = {
  data: { date: string; average: number }[];
};

export const TrendLine = memo(function TrendLine({ data }: TrendLineProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-950">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">90-day rolling average</h3>
      <div role="img" aria-label="Line chart showing 90-day rolling average daily CO2 emissions">
        <ResponsiveContainer width="100%" height={256}>
          <LineChart data={data.slice(-30)}>
            <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
            <YAxis unit=" kg" />
            <Tooltip formatter={(v: number) => [`${v.toFixed(2)} kgCO₂e/day`, 'Average']} />
            <ReferenceLine y={TARGET_DAILY_KG} stroke="#f59e0b" strokeDasharray="4 4" label="1.5°C target" />
            <Line type="monotone" dataKey="average" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
