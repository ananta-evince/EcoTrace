import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { expectNoA11yViolations } from '@/test/axe';
import { DonutChart } from '../DonutChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

describe('DonutChart', () => {
  it('renders chart with accessible label', () => {
    render(<DonutChart data={{ transport: 10, food: 5 }} />);
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Donut chart'),
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DonutChart data={{ transport: 10 }} />);
    await expectNoA11yViolations(container);
  });
});
