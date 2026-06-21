import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InsightsPanel } from '../InsightsPanel';

vi.mock('../../api/generateInsights', () => ({
  generateInsightsAction: vi.fn(() =>
    Promise.resolve({
      content: 'Insight one two three',
      cached: false,
      generatedAt: new Date(),
    }),
  ),
}));

describe('InsightsPanel', () => {
  it('renders generate button', () => {
    render(<InsightsPanel />);
    expect(screen.getByRole('heading', { name: 'Your Insights' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate insights' })).toBeInTheDocument();
  });

  it('generates and displays insights', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<InsightsPanel />);
    await user.click(screen.getByRole('button', { name: 'Generate insights' }));
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(await screen.findByRole('log')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows error when generation fails', async () => {
    const { generateInsightsAction } = await import('../../api/generateInsights');
    vi.mocked(generateInsightsAction).mockRejectedValueOnce(new Error('API down'));
    const user = userEvent.setup();
    render(<InsightsPanel />);
    await user.click(screen.getByRole('button', { name: 'Generate insights' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('API down');
  });
});
