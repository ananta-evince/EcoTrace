import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { adoptActionAction, completeActionAction } from '../../api/actionActions';
import { ActionList } from '../ActionList';

vi.mock('../../api/actionActions', () => ({
  adoptActionAction: vi.fn(() => Promise.resolve({ ok: true, value: undefined })),
  completeActionAction: vi.fn(() => Promise.resolve({ ok: true, value: undefined })),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe('ActionList', () => {
  it('renders action library header', () => {
    render(<ActionList userActions={[]} />);
    expect(screen.getByRole('heading', { name: 'Action Library' })).toBeInTheDocument();
  });

  it('filters actions by effort', async () => {
    const user = userEvent.setup();
    render(<ActionList userActions={[]} />);
    await user.click(screen.getByRole('button', { name: 'Quick Win' }));
    expect(screen.getByRole('button', { name: 'Quick Win' })).toHaveClass('bg-brand-600');
  });

  it('adopts an action from card', async () => {
    const user = userEvent.setup();
    render(<ActionList userActions={[]} />);
    const adoptButton = screen.getAllByRole('button', { name: "I'll do this" })[0];
    if (adoptButton) await user.click(adoptButton);
    expect(adoptActionAction).toHaveBeenCalled();
  });

  it('marks adopted action complete', async () => {
    const user = userEvent.setup();
    render(<ActionList userActions={[{ actionId: 'green-energy', status: 'active' }]} />);
    const completeButton = screen.getByRole('button', { name: 'Mark complete' });
    await user.click(completeButton);
    expect(completeActionAction).toHaveBeenCalledWith('green-energy');
  });
});
