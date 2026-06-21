import type { Metadata } from 'next';

import { LoginForm } from '@/features/auth/components/AuthForms';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-gray-950">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Sign in to EcoTrace</h1>
        <LoginForm />
      </div>
    </main>
  );
}
