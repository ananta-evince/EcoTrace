import { headers } from 'next/headers';

/** Parses a client IP from an X-Forwarded-For header value. */
export function parseClientIp(forwardedFor: string | null | undefined): string {
  return forwardedFor?.split(',')[0]?.trim() ?? 'unknown';
}

/** Extracts client IP from proxy headers for rate limiting. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) return parseClientIp(forwarded);
  return h.get('x-real-ip') ?? 'unknown';
}
