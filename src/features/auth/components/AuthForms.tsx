'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';


import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import { signupAction, loginAction } from '../api/authActions';

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signupAction(formData);
      if (!result.ok) {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input label="Name" name="name" required autoComplete="name" />
      <Input label="Email" name="email" type="email" required autoComplete="email" />
      <Input
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        aria-describedby="password-hint"
      />
      <p id="password-hint" className="text-xs text-gray-500">
        Min 8 characters, uppercase letter and number required
      </p>
      {error && (
        <p role="alert" className="text-sm text-carbon-high">
          ⚠ {error}
        </p>
      )}
      <Button type="submit" loading={isPending} className="w-full">
        Create account
      </Button>
      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-700 underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (!result.ok) {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input label="Email" name="email" type="email" required autoComplete="email" />
      <Input label="Password" name="password" type="password" required autoComplete="current-password" />
      {error && (
        <p role="alert" className="text-sm text-carbon-high">
          ⚠ {error}
        </p>
      )}
      <Button type="submit" loading={isPending} className="w-full">
        Sign in
      </Button>
      <p className="text-center text-sm text-gray-500">
        No account?{' '}
        <Link href="/signup" className="text-brand-700 underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
