# NutriTrack Web

A Next.js re-engineering of the [NutriTrack Android app](https://github.com/MasonLLG/Nutritrack_app_android)
(Kotlin · Jetpack Compose · Room · Hilt), built for technical learning and portfolio
demonstration.

The dashboard shows a ported HEIFA dietary-quality assessment, a seven-day food log with
analytics, fruit nutrition looked up from an external API, and an informational weekly
summary that works with or without an AI provider configured.

> **Health disclaimer.** NutriTrack is informational only. It does not provide medical
> diagnosis, treatment recommendations, or clinical advice.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript, `strict` + `noUncheckedIndexedAccess` |
| Runtime | Node.js 24 |
| Database | MySQL / MariaDB via `mysql2/promise`, raw parameterised SQL |
| Migrations | Plain `.sql` files + a ~40-line runner |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Tests | Vitest (85 unit tests) |
| External API | FruityVice |
| AI (optional) | OpenAI |

**No ORM and no query builder.** The learning goal for this project was Next.js,
TypeScript and Node — not an ORM. Since MySQL and SQL were already familiar, the
persistence layer uses SQL directly and spends the learning budget where it matters.

Also deliberately absent: no HTTP client (native `fetch`), no state library (Server
Components + `useState`), no form library, no migration framework.

---

## Getting started

Requires Node 20+ and a reachable MySQL or MariaDB server.

```bash
# 1. Install
npm install

# 2. Create a database and a user, e.g.
#    CREATE DATABASE nutritrack_web;
#    CREATE USER 'nutritrack_app'@'localhost' IDENTIFIED BY 'your-password';
#    GRANT ALL PRIVILEGES ON nutritrack_web.* TO 'nutritrack_app'@'localhost';

# 3. Configure
cp .env.example .env        # then set DATABASE_URL

# 4. Create the schema and load the ported data
npm run db:migrate
npm run db:seed

# 5. Run
npm run dev
```

Open <http://localhost:3000>. `GET /api/health` reports database connectivity.

> `.env` is read once at process start — restart the dev server after changing it.

### Environment variables

All environment access is centralised in `lib/env.ts`, which validates with Zod at
startup. **No other module reads `process.env`**; a grep enforces this.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | e.g. `mysql://user:pass@localhost:3306/nutritrack_web` |
| `FRUITYVICE_BASE_URL` | No | Defaults to the URL the Android app used |
| `OPENAI_API_KEY` | **No** | Without it the weekly summary uses a deterministic rule-based fallback. The app is fully functional with no key. |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini`. Ignored without a key. |

Blank values (`OPENAI_API_KEY=`) are treated as unset rather than invalid, so an empty
line in `.env` cannot take the app down over an optional feature.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (single run) |
| `npm run db:migrate` | Apply pending migrations (idempotent) |
| `npm run db:seed` | Load users, HEIFA assessments and sample records |
| `npm run db:reset` | Drop all tables (refuses to run in production) |
| `npm run heifa:import` | Regenerate seed SQL from `db/source/data.csv` |

---

## Architecture

Five layers. Dependencies point one way only.

```
app/(ui)              React Server Components + client components
      |
app/api/*             Route handlers - parse, validate, status codes
      |
lib/services/         Orchestration: business flows
      |          |            |
lib/db/repositories/  lib/clients/  lib/domain/
      |
lib/db/pool.ts        mysql2 connection pool
```

Root-level directories only (`app/`, `lib/`, `db/`, `scripts/`) — no `src/`.

| Layer | Rule |
|---|---|
| `lib/domain/` | Pure business rules. No database, HTTP, or environment access. Importable from anywhere, including `scripts/`. This is where the tests live. |
| `lib/db/repositories/` | **The only place SQL exists.** Returns domain objects, never driver rows. |
| `lib/clients/` | External APIs. Typed, with timeouts, mapping failures to error kinds. |
| `lib/services/` | Orchestration. Fetches through repositories and delegates calculation to `lib/domain/`. |
| `app/api/*` | HTTP concerns only: validate with Zod, call one service, map to a response. |

**Server Components call services directly**; API routes exist for client-side mutations.
An HTTP round-trip to your own server is an anti-pattern in the App Router.

**Every query is parameterised** with `?` placeholders via `connection.execute()`.
Template-literal interpolation into SQL is prohibited without exception.

### The one documented exception

`app/api/health/route.ts` queries the pool directly, skipping the service and repository
layers. It is a liveness probe for the infrastructure, not a business endpoint — routing
it through a service would test the service rather than the connection. The
layer-discipline greps below exclude exactly this path, so the exception stays visible
rather than quietly becoming a precedent.

### Verifying the architecture holds

```bash
grep -rn "mysql2" app/ lib/services/                                 # only api/health
grep -rniE "(select |insert |update |delete )" lib/services/ app/    # only api/health
grep -rn "process.env" app/ lib/ scripts/                            # only lib/env.ts
grep -rn "openai" app/ lib/services/                                 # never the SDK
```

---

## Relationship to the Android app

Not every feature is a port. The Android app's `Nutrition` entity is a **static,
one-row-per-user HEIFA assessment** loaded once from a bundled CSV — it has no date
column and no food logging. Three of the five features here are new design.

| Feature | Origin | Notes |
|---|---|---|
| HEIFA dashboard | **Ported** | From the Insights screen |
| FruityVice lookup | **Ported** | From `FruitApiService` |
| Create/list records | **New** | No equivalent in the Android app |
| Seven-day analytics | **New** | The Android schema has no dates at all |
| AI weekly summary | **New** | The Android "NutriCoach" screen contains no AI |

### Deliberate differences from the original

| Android behaviour | Here | Why |
|---|---|---|
| Insights screen showed 12 component scores, omitting `SaturatedFatHEIFAscore` | 13 components | The Android scores never summed to the total it displayed. Across all 9 source rows the shortfall equals the saturated-fat value exactly. |
| Each score stored twice (`…Male` / `…Female`), a column picked at read time | One resolved score per category | 26 columns become 13; the sex is resolved once at import. |
| Any `Sex` value other than `"Male"` fell through to the female column | Unrecognised values throw at import | Silent mis-scoring of malformed rows is worse than a failed import. |
| `User.password` stored in plaintext | No auth columns at all | Authentication is out of MVP scope and arrives in a later migration. |
| FruityVice figures shown as-is regardless of portion | Basis is explicit (per 100 g) and scaled | The upstream quotes per 100 g; treating that as per-serving corrupts every downstream total. |

---

## Notable implementation decisions

**Calendar days are local, never UTC.** `toISOString().slice(0, 10)` returns the *UTC*
day, which is the previous calendar day for early-morning times in any timezone ahead of
UTC. A record logged at 02:26 was being filed under the wrong day. `lib/domain/date.ts`
derives days from local components only, `consumed_on` is written by the application
rather than generated by MySQL, and the pool sets `dateStrings: ["DATE"]` so the read
path cannot reintroduce the shift.

**Timezone model.** `DATETIME` columns hold the application's local wall clock and
`consumed_on` holds the local calendar day — one reference frame, so `DATE(consumed_at)`
always equals `consumed_on`. This assumes the app and database share a timezone, which
holds for this single-user setup; supporting users across timezones would mean storing a
per-user zone.

**Averages divide by days in the window, not days logged.** 3654 kcal over 6 logged days
reports 522/day, not 609. Dividing by days-with-records would mean skipping a day *raises*
your average — actively misleading in a health context.

**Chart colours are validated, not chosen by eye.** Series colours pass lightness-band,
chroma-floor and 3:1 contrast checks against each mode's surface. The `emerald-400` used
for UI accents fails the lightness band for chart marks, so marks carry their own tokens.

**The AI summary is constrained twice.** A system prompt states hard prohibitions
(no diagnosis, no deficiency or risk claims, no recommendations, no healthy/unhealthy
labelling, no target values), and a post-generation check rejects output matching
`PROHIBITED_ADVICE_PATTERNS`, falling back to the rule-based summary. A model that ignores
its instructions cannot reach the user. The model only ever sees derived figures — no food
names, no user free text.

**Migrations are forward-only.** A mistake is corrected by a new migration, never by
editing one already applied; `db/migrations/002_add_saturated_fat.sql` is a real example.

---

## Testing

85 unit tests over the pure domain modules — the logic with non-obvious rules and real
failure modes. No HTTP or database mocking.

| Module | Covers |
|---|---|
| `lib/domain/heifa` | Sex-specific score resolution, category maxima summing to 100 |
| `lib/domain/date` | Local-day formatting, midnight/23:59 boundaries, month and leap-year rollover |
| `lib/domain/nutrition` | Macro scaling, zero-basis and negative-amount guards |
| `lib/domain/analytics` | Daily aggregation, empty-day filling, window boundaries, averages |
| `lib/domain/insights` | Fact-sheet extraction, fallback text, health-safety patterns |
| `lib/env` | Optional and blank-value handling |

Not covered: route handlers, repositories, React components. Those need infrastructure or
mocking that would cost more than it returns at this stage.

---

## Project status

The MVP is complete: dashboard, records, FruityVice, analytics, and the weekly summary.

Natural next steps: authentication (the `users` table and foreign keys are already shaped
for it), widening the test suite to repositories and route handlers, and pagination once
the record count grows.
