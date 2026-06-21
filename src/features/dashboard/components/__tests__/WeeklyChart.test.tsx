import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeeklyChart } from '../WeeklyChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

describe('WeeklyChart', () => {
  it('renders accessible stacked bar chart', () => {
    render(
      <WeeklyChart
        data={[{ weekStart: '2024-01-01', total: 10, byCategory: { transport: 10 } }]}
      />,
    );
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Stacked bar chart'),
    );
  });
});
