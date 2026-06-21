'use client';

import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CATEGORY_COLORS } from '@/components/charts/chartColors';
import { formatKgCO2e } from '@/lib/utils';

type DonutChartProps = {
  data: Record<string, number>;
};

export const DonutChart = memo(function DonutChart({ data }: DonutChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-950">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Category breakdown</h3>
      <div
        role="img"
        aria-label={`Donut chart showing monthly emissions breakdown totalling ${formatKgCO2e(total)}`}
      >
        <ResponsiveContainer width="100%" height={256}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#888'} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => formatKgCO2e(v)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
