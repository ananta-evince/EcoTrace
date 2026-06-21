# EcoTrace Architecture

EcoTrace follows a **feature-sliced** layout with clear separation between UI, domain logic, and infrastructure.

## Layer overview

```
┌─────────────────────────────────────────────────────────┐
│  app/          Route pages & API handlers (thin layer)  │
├─────────────────────────────────────────────────────────┤
│  features/     Domain modules with colocated logic    │
├─────────────────────────────────────────────────────────┤
│  components/   Shared, domain-agnostic UI primitives    │
├─────────────────────────────────────────────────────────┤
│  lib/          Cross-cutting utilities & integrations   │
└─────────────────────────────────────────────────────────┘
```

## Feature modules

| Module | Responsibility |
|--------|----------------|
| `auth` | Sign-up, login, onboarding wizard |
| `tracking` | Carbon entry CRUD, emission calculations |
| `dashboard` | Metrics visualisation and charts |
| `insights` | AI coaching via Gemini with caching |
| `actions` | Reduction action library and habit tracking |

Each feature owns:

- `api/` — server actions and repositories
- `components/` — feature-specific UI
- `types/` or `data/` — schemas and static catalogues

## Core patterns

### Result type for expected failures

Server actions return `Result<T, string>` instead of throwing for validation errors:

```typescript
type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

### Branded IDs

`UserId` and `EntryId` prevent accidental mixing of identifier types at compile time.

### Centralised session access

All authenticated server code uses `requireUserId()` from `lib/session.ts`.

### Typed database access

Repositories build `Prisma.*WhereInput` filters rather than untyped `Record<string, unknown>`.

### Named constants

Magic numbers live in `lib/constants.ts` and `features/tracking/utils/emissionFactors.ts`.

## Data flow

1. **Page** (server component) calls repository or server action
2. **Server action** validates input with Zod, calls repository
3. **Repository** queries Prisma with user-scoped filters
4. **Client component** renders data and calls server actions for mutations

## Summary aggregation

Dashboard metrics are split into focused modules under `features/tracking/api/summary/`:

- `getCarbonSummary.ts` — AI insight input
- `getDashboardData.ts` — dashboard bundle
- `calculateBaselineFootprint.ts` — onboarding baseline
- `getWeekTotal.ts` — lightweight week total for track page

## Quality gates

Pre-commit hooks run ESLint (zero warnings), TypeScript strict check, and Vitest unit tests.
