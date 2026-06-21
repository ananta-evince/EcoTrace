'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import type { DashboardData } from '@/features/tracking/api/carbonSummaryRepository';
import { formatKgCO2e } from '@/lib/utils';

const WeeklyChart = dynamic(() => import('./WeeklyChart').then((m) => m.WeeklyChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const DonutChart = dynamic(() => import('./DonutChart').then((m) => m.DonutChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const TrendLine = dynamic(() => import('./TrendLine').then((m) => m.TrendLine), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const ComparisonGauge = dynamic(() => import('./ComparisonGauge').then((m) => m.ComparisonGauge), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

function ChartSkeleton() {
  return <div className="h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" aria-busy="true" />;
}

type MetricCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
};

export function MetricCard({ title, value, subtitle, trend }: MetricCardProps) {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';
  const trendColor =
    trend === 'up' ? 'text-carbon-high' : trend === 'down' ? 'text-brand-600' : 'text-gray-500';

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] dark:bg-gray-950">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="mt-1 font-mono text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {subtitle && (
        <p className={`mt-1 text-sm ${trendColor}`}>
          {trendIcon && <span aria-hidden="true">{trendIcon} </span>}
          {subtitle}
        </p>
      )}
    </article>
  );
}

type DashboardViewProps = {
  data: DashboardData;
};

export function DashboardView({ data }: DashboardViewProps) {
  const [showTable, setShowTable] = useState(false);
  const weekTrend = data.weekDeltaPercent <= 0 ? 'down' : 'up';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Your carbon footprint at a glance</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today"
          value={formatKgCO2e(data.todayTotal)}
          subtitle={`Target: ${formatKgCO2e(data.dailyTarget)}/day`}
        />
        <MetricCard
          title="This week"
          value={formatKgCO2e(data.weekTotal)}
          subtitle={`${Math.abs(data.weekDeltaPercent).toFixed(0)}% vs last week`}
          trend={weekTrend}
        />
        <MetricCard
          title="This month"
          value={formatKgCO2e(data.monthTotal)}
          subtitle={`National avg: ${formatKgCO2e(data.nationalAverageMonthly)}`}
        />
        <MetricCard
          title="Streak"
          value={`${data.streak} days`}
          subtitle="Consecutive logging days"
        />
      </div>

      {data.actionsSavingKgPerYear > 0 && (
        <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-800 dark:bg-brand-950 dark:text-brand-200">
          Your actions are saving ~{data.actionsSavingKgPerYear} kg/year
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyChart data={data.weeklyRollup} />
        <DonutChart data={data.categoryBreakdown} />
        <TrendLine data={data.rollingAverage} />
        <ComparisonGauge
          userDaily={data.todayTotal || data.weekTotal / 7}
          nationalDaily={data.nationalAverageMonthly / 30}
          targetDaily={data.dailyTarget}
        />
      </div>

      <section aria-labelledby="recent-entries-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent-entries-heading" className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent entries
          </h2>
          <button
            type="button"
            onClick={() => setShowTable((s) => !s)}
            className="text-sm text-brand-700 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            {showTable ? 'Hide data table' : 'Show data table'}
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white shadow-sm dark:bg-gray-950">
          <table className={`w-full text-left text-sm ${showTable ? '' : 'sr-only'}`}>
            <caption className="sr-only">Recent carbon entries</caption>
            <thead>
              <tr className="border-b dark:border-gray-800">
                <th scope="col" className="p-3">Date</th>
                <th scope="col" className="p-3">Category</th>
                <th scope="col" className="p-3">Amount</th>
                <th scope="col" className="p-3">CO₂</th>
              </tr>
            </thead>
            <tbody>
              {data.recentEntries.map((e: DashboardData['recentEntries'][number]) => (
                <tr key={e.id} className="border-b dark:border-gray-800">
                  <td className="p-3">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="p-3">{e.category}</td>
                  <td className="p-3">
                    {e.value} {e.unit}
                  </td>
                  <td className="p-3 font-mono">{formatKgCO2e(e.kgCO2e)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
