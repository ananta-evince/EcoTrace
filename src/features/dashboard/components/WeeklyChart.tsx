'use client';

import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CATEGORY_COLORS } from '@/components/charts/chartColors';

type WeeklyChartProps = {
  data: { weekStart: string; total: number; byCategory: Record<string, number> }[];
};

const categories = ['transport', 'food', 'home_energy', 'shopping', 'services'];

export const WeeklyChart = memo(function WeeklyChart({ data }: WeeklyChartProps) {
  const chartData = data.map((w) => ({
    week: w.weekStart.slice(5),
    ...w.byCategory,
    total: w.total,
  }));

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-950">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Weekly emissions</h3>
      <div role="img" aria-label="Stacked bar chart of weekly CO2 emissions by category for the last 8 weeks">
        <ResponsiveContainer width="100%" height={256}>
          <BarChart data={chartData}>
            <XAxis dataKey="week" />
            <YAxis unit=" kg" />
            <Tooltip formatter={(v: number) => [`${v.toFixed(1)} kgCO₂e`, '']} />
            <Legend />
            {categories.map((cat) => (
              <Bar key={cat} dataKey={cat} stackId="a" fill={CATEGORY_COLORS[cat]} name={cat.replace('_', ' ')} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
