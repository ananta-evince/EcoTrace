import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { expectNoA11yViolations } from '@/test/axe';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Button loading>Saving</Button>);
    const btn = screen.getByRole('button', { name: 'Loading…' });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Submit</Button>);
    await expectNoA11yViolations(container);
  });
});
