/** Validates environment on production startup. */
export async function register() {
  if (process.env.NODE_ENV === 'production') {
    const { getEnv } = await import('@/lib/env');
    getEnv();
  }
}
