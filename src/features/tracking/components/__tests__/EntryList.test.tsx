import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntryList } from '../EntryList';

vi.mock('../../api/entryActions', () => ({
  deleteEntryAction: vi.fn(() => Promise.resolve({ ok: true, value: undefined })),
}));

const entries = [
  {
    id: 'e1',
    category: 'transport',
    subcategory: 'car_petrol',
    value: 10,
    unit: 'km',
    kgCO2e: 1.72,
    date: new Date('2024-06-01'),
  },
];

describe('EntryList', () => {
  it('renders entries with week total', () => {
    render(<EntryList entries={entries} weekTotal={12.5} />);
    expect(screen.getByRole('heading', { name: 'Entry history' })).toBeInTheDocument();
    expect(screen.getByText(/car petrol/i)).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<EntryList entries={[]} weekTotal={0} />);
    expect(screen.getByText(/No entries yet/)).toBeInTheDocument();
  });

  it('handles delete click', async () => {
    const user = userEvent.setup();
    render(<EntryList entries={entries} weekTotal={12.5} />);
    await user.click(screen.getByRole('button', { name: /Delete entry/ }));
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});
