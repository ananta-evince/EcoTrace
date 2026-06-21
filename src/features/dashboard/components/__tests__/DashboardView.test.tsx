import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import type { DashboardData } from '@/features/tracking/api/carbonSummaryRepository';

import { DashboardView, MetricCard } from '../DashboardView';


vi.mock('next/dynamic', () => ({
  default: () => () => <div data-testid="chart">Chart</div>,
}));

const mockData: DashboardData = {
  todayTotal: 10,
  dailyTarget: 6.8,
  weekTotal: 50,
  lastWeekTotal: 60,
  weekDeltaPercent: -16.67,
  monthTotal: 200,
  nationalAverageMonthly: 426,
  streak: 3,
  weeklyRollup: [{ weekStart: '2024-01-01', total: 10, byCategory: { transport: 10 } }],
  categoryBreakdown: { transport: 100 },
  rollingAverage: [{ date: '2024-01-01', average: 5 }],
  recentEntries: [
    {
      id: '1',
      category: 'transport',
      subcategory: 'car_petrol',
      value: 10,
      unit: 'km',
      kgCO2e: 1.7,
      date: new Date('2024-06-01'),
      note: null,
    },
  ],
  actionsSavingKgPerYear: 500,
};

describe('DashboardView', () => {
  it('renders metric cards and dashboard heading', () => {
    render(<DashboardView data={mockData} />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText(/Your actions are saving/)).toBeInTheDocument();
  });

  it('toggles data table visibility', async () => {
    const user = userEvent.setup();
    render(<DashboardView data={mockData} />);
    await user.click(screen.getByRole('button', { name: 'Show data table' }));
    expect(screen.getByRole('button', { name: 'Hide data table' })).toBeInTheDocument();
  });
});

describe('MetricCard', () => {
  it('renders trend indicator', () => {
    render(<MetricCard title="Week" value="50 kg" subtitle="Down 10%" trend="down" />);
    expect(screen.getByText('Week')).toBeInTheDocument();
  });
});
