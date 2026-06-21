import type { Metadata } from 'next';

import { SignupForm } from '@/features/auth/components/AuthForms';

export const metadata: Metadata = { title: 'Sign up' };

export default function SignupPage() {
  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-gray-950">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
        <SignupForm />
      </div>
    </main>
  );
}
