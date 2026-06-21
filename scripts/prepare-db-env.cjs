/** Maps Vercel Neon integration env vars to Prisma DATABASE_URL / DIRECT_URL. */
if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
}
if (!process.env.DIRECT_URL && process.env.POSTGRES_URL_NON_POOLING) {
  process.env.DIRECT_URL = process.env.POSTGRES_URL_NON_POOLING;
}
if (!process.env.DIRECT_URL && process.env.DATABASE_URL_UNPOOLED) {
  process.env.DIRECT_URL = process.env.DATABASE_URL_UNPOOLED;
}
if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL;
  if (!process.env.DIRECT_URL) {
    process.env.DIRECT_URL = process.env.POSTGRES_URL;
  }
}

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. Database migrations will fail.');
}
