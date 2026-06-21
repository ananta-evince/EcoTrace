import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/AppShell';
import { auth } from '@/lib/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return <AppShell>{children}</AppShell>;
}
