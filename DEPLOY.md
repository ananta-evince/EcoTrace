# Neon Postgres setup for EcoTrace (Vercel deployment)

Follow these steps once to create your production database.

## 1. Create a Neon database (free)

### Option A — Vercel Storage (easiest)

1. Open your project: [vercel.com → ecotrace → Storage](https://vercel.com/dashboard)
2. Click **Create Database** → choose **Neon** → **Continue**
3. Name it `ecotrace` and connect it to the **ecotrace** project
4. Vercel auto-adds `POSTGRES_*` env vars — the build script maps these for Prisma

### Option B — Neon dashboard

1. Go to [neon.tech](https://neon.tech) and create a project **ecotrace**
2. Copy **Pooled** URL → `DATABASE_URL` and **Direct** URL → `DIRECT_URL`
3. Add both in [Vercel → ecotrace → Settings → Environment Variables](https://vercel.com/dashboard)

Example:
```
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

## 2. Run migrations against Neon

Set the URLs in your shell (or a temporary `.env.production`), then:

```powershell
cd "d:\Prompt Wars\EcoTrace"
npx prisma migrate deploy
npm run db:seed
```

## 3. Deploy to Vercel

### Option A — Vercel Dashboard (recommended)

1. Push this repo to GitHub: `https://github.com/ananta-evince/EcoTrace`
2. Go to [https://vercel.com/new](https://vercel.com/new) → Import **ananta-evince/EcoTrace**
3. Add **Environment Variables** (Production + Preview):

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon pooled connection string |
| `DIRECT_URL` | Neon direct connection string |
| `AUTH_SECRET` | Random 32+ char secret |
| `AUTH_URL` | `https://YOUR-APP.vercel.app` (set after first deploy, then redeploy) |
| `NEXTAUTH_SECRET` | Same as `AUTH_SECRET` |
| `NEXTAUTH_URL` | Same as `AUTH_URL` |
| `GEMINI_API_KEY` | Optional — Gemini AI insights |

4. Click **Deploy**.

5. After deploy, copy your live URL (e.g. `https://ecotrace.vercel.app`), update `AUTH_URL` and `NEXTAUTH_URL`, then **Redeploy**.

### Option B — Vercel CLI

```powershell
npm i -g vercel
vercel login
vercel link
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add AUTH_SECRET
vercel env add AUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel --prod
```

## 4. Verify

- Visit your Vercel URL
- Sign up or use seeded demo: `demo@ecotrace.app` / `SecurePass123!`
- Log an entry on `/track` and check `/dashboard`

## Local database (Docker)

If you install Docker Desktop:

```powershell
.\scripts\setup-local-db.ps1
npm run dev
```
