# EcoTrace — Carbon Footprint Tracker

A production-ready Next.js application that helps individuals understand, track, and reduce their personal carbon footprint.

## Features

- **Onboarding & Baseline** — 3-step wizard with estimated annual footprint
- **Carbon Entry Logging** — 5 categories with DEFRA 2024 emission factors
- **Dashboard** — Charts, metrics, streaks, and data export
- **AI Insights** — Personalised coaching via Gemini (with caching)
- **Action Library** — 40+ curated reduction actions with habit tracking
- **Profile & Gamification** — Badges, projections, and CO₂ equivalents

## Tech Stack

Next.js 14 · TypeScript · Tailwind CSS · Prisma · PostgreSQL · NextAuth.js · Zustand · React Query · Recharts · Vitest · Playwright

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

```bash
# Install dependencies
npm ci

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

# Run database migrations
npx prisma migrate dev --name init

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo account:** `demo@ecotrace.app` / `SecurePass123!`

## Deploy to Vercel + Neon

**Start here:** **[NEON-SETUP.md](./NEON-SETUP.md)** — 3-step guide (~3 minutes).

Or run the interactive script after accepting Neon terms:

```powershell
.\scripts\setup-neon-production.ps1
```

See also [DEPLOY.md](./DEPLOY.md) for details.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Run unit tests |
| `npm run test:coverage` | Tests with coverage |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run lint` | ESLint (zero warnings) |
| `npm run type-check` | TypeScript check |

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── features/         # Feature modules (auth, tracking, dashboard, insights, actions)
├── components/       # Shared UI and layout
└── lib/              # Core utilities (auth, prisma, result)
```

## Environment Variables

See `.env.example` for all required keys.

## License

MIT
