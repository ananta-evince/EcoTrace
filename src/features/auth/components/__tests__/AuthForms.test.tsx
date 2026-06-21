import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { expectNoA11yViolations } from '@/test/axe';
import { SignupForm, LoginForm } from '../AuthForms';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../../api/authActions', () => ({
  signupAction: vi.fn(() => Promise.resolve({ ok: true, value: undefined })),
  loginAction: vi.fn(() => Promise.resolve({ ok: true, value: undefined })),
}));

describe('AuthForms', () => {
  it('renders signup form fields', () => {
    render(<SignupForm />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/)).toBeInTheDocument();
  });

  it('renders login form fields', () => {
    render(<LoginForm />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/)).toBeInTheDocument();
  });

  it('signup form has no accessibility violations', async () => {
    const { container } = render(<SignupForm />);
    await expectNoA11yViolations(container);
  });

  it('login form has no accessibility violations', async () => {
    const { container } = render(<LoginForm />);
    await expectNoA11yViolations(container);
  });
});
