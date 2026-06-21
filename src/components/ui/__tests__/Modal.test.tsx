import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { expectNoA11yViolations } from '@/test/axe';
import { Modal } from '../Modal';

vi.mock('focus-trap-react', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Modal', () => {
  it('renders dialog when open', () => {
    render(
      <Modal open title="Confirm" onClose={() => {}}>
        <p>Are you sure?</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal open={false} title="Confirm" onClose={() => {}}>
        <p>Hidden</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const user = await import('@testing-library/user-event').then((m) => m.default.setup());
    const onClose = vi.fn();
    render(
      <Modal open title="Confirm" onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );
    await user.click(screen.getByLabelText('Close dialog'));
    expect(onClose).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Modal open title="Confirm delete" onClose={() => {}}>
        <p>Content</p>
      </Modal>,
    );
    await expectNoA11yViolations(container);
  });
});
