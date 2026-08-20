# NutriTrack Web

A Next.js re-engineering of the [NutriTrack Android app](https://github.com/MasonLLG/Nutritrack_app_android)
(Kotlin + Jetpack Compose + Room + Hilt), built for technical learning and portfolio demonstration.

> **Status:** Step 1 of 9 complete — project scaffold. No database, API routes or
> features yet.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript, `strict` + `noUncheckedIndexedAccess` |
| Runtime | Node.js |
| Database | MySQL via `mysql2/promise`, raw parameterised SQL |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Tests | Vitest |
| External API | FruityVice |
| AI (optional) | OpenAI |

No ORM and no query builder — schema ships as plain `.sql` migration files. This is
deliberate: the learning goal is Next.js, TypeScript and Node, so the persistence layer
uses SQL that was already familiar rather than introducing an ORM at the same time.

## Getting started

```bash
npm install
cp .env.example .env    # then edit .env
npm run dev
```

Open <http://localhost:3000>.

### Environment variables

All environment access is centralised in `lib/env.ts`, which validates with Zod at
startup. No other module reads `process.env`.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | From Step 2 | MySQL connection string |
| `FRUITYVICE_BASE_URL` | No | Defaults to `https://www.fruityvice.com/` |
| `OPENAI_API_KEY` | **No** | Without it, the weekly summary uses a deterministic rule-based fallback. The app is fully functional with no key. |

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest (watch mode) |

## Architecture

Layers, with dependencies pointing one way only:

```
app/(ui)               React Server Components + client components
      |
app/api/*              Route handlers - parse, validate, status codes
      |
lib/services/          Orchestration: business flows, 7-day analytics
      |          |            |
lib/db/repositories/  lib/clients/  lib/domain/
      |
lib/db/pool.ts         mysql2 connection pool
```

Root-level directories only (`app/`, `lib/`, `db/`, `scripts/`) — no `src/`.

Rules:

- **SQL lives only in `lib/db/repositories/`** — never in services, routes or components.
- **Every query is parameterised** with `?` placeholders; no template-literal SQL.
- **`lib/domain/` is pure** — no I/O, no environment access. Importable from anywhere,
  including `scripts/`.
- **`lib/env.ts` is the only module that reads `process.env`.**
- **`app/api/health` is a documented exception** to the layering rule: it is an
  infrastructure liveness probe and queries the pool directly.

## Relationship to the Android app

Not every feature is a port. The Android app stores a **static, one-row-per-user HEIFA
assessment** loaded from a bundled CSV — it has no dates and no food logging.

| Feature | Origin |
|---|---|
| Nutrition dashboard (HEIFA scores) | Ported from the Insights screen |
| FruityVice integration | Ported from `FruitApiService` |
| Create/list nutrition records | New — no equivalent in the Android app |
| Seven-day analytics | New — the Android schema has no dates |
| AI weekly summary | New — the Android "NutriCoach" screen contains no AI |

### Health disclaimer

The AI weekly summary is **informational only**. It does not provide medical diagnosis,
treatment recommendations, or clinical advice.
