import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { expectNoA11yViolations } from '@/test/axe';

import { Input } from '../Input';

describe('Input', () => {
  it('associates label with input', () => {
    render(<Input label="Email" name="email" />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });

  it('shows error with alert role', () => {
    render(<Input label="Email" name="email" error="Invalid email" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Input label="Name" name="name" required />);
    await expectNoA11yViolations(container);
  });
});
