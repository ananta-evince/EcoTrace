'use client';

import { SessionProvider } from 'next-auth/react';

/** Root client providers for authentication session context. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
