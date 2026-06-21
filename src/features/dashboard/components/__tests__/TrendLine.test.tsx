import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { expectNoA11yViolations } from '@/test/axe';

import { TrendLine } from '../TrendLine';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ReferenceLine: () => null,
}));

describe('TrendLine', () => {
  it('renders accessible chart', () => {
    render(<TrendLine data={[{ date: '2024-01-01', average: 5 }]} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringContaining('Line chart'));
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TrendLine data={[{ date: '2024-01-01', average: 5 }]} />);
    await expectNoA11yViolations(container);
  });
});
