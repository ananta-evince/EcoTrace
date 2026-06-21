# Neon setup — 3 steps (~3 minutes)

Your Vercel project **ecotrace** is ready. Complete these steps once.

---

## Step 1 — Accept Neon terms (one-time)

Open this link in your browser and click **Accept**:

**https://vercel.com/ananta2/~/integrations/accept-terms/neon?source=cli**

---

## Step 2 — Create the database

After accepting terms, run this in PowerShell from the project folder:

```powershell
cd "d:\Prompt Wars\EcoTrace"

npx vercel integration add neon `
  --name ecotrace-db `
  -m auth=false `
  -m region=iad1 `
  --plan free_v3 `
  -e production `
  -e preview
```

This will:
- Create a free Neon Postgres database
- Connect it to **ecotrace**
- Pull env vars into `.env.local` (or tell you to run `vercel env pull`)

Then seed the database:

```powershell
npx vercel env pull .env.production.local --environment=production
node scripts/prepare-db-env.cjs
npx prisma migrate deploy
npm run db:seed
```

---

## Step 3 — Deploy

```powershell
npx vercel --prod
```

Or push to GitHub — Vercel will auto-deploy.

**Live URL:** https://ecotrace.vercel.app

**Demo login:** `demo@ecotrace.app` / `SecurePass123!`

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| Build fails on `migrate deploy` | Run Step 2 seed commands; confirm `POSTGRES_*` or `DATABASE_URL` exists in Vercel env |
| Login redirect loop | Set `AUTH_URL` and `NEXTAUTH_URL` to `https://ecotrace.vercel.app` in Vercel env |
| Terms error on Step 2 | Complete Step 1 first, then retry the command |

---

## Alternative — Neon dashboard

1. [console.neon.tech](https://console.neon.tech) → New project **ecotrace**
2. Copy **Pooled** and **Direct** connection strings
3. Add to Vercel → Settings → Environment Variables as `DATABASE_URL` and `DIRECT_URL`
4. Run: `.\scripts\init-neon-db.ps1 -DatabaseUrl "..." -DirectUrl "..."`
5. `npx vercel --prod`
