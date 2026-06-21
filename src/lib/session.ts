import { auth } from '@/lib/auth';
import type { UserId } from '@/features/tracking/types';

/** Returns the authenticated user id or throws when the session is missing. */
export async function requireUserId(): Promise<UserId> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id as UserId;
}
