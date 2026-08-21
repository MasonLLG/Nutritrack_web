import { z } from "zod";

/**
 * Centralised environment access.
 *
 * This module is the ONLY place in the codebase permitted to read `process.env`.
 * Route handlers, services, clients and components import `env` from here instead.
 * Enforced by the `grep -rn "process.env" app/ lib/ scripts/` check in the plan,
 * which must match this file and nothing else.
 */

/**
 * Treat a blank value as absent.
 *
 * `.env` files routinely contain keys with no value (`OPENAI_API_KEY=`), which
 * means "not configured" to a human but arrives as `""` rather than `undefined`.
 * Without this, a blank optional key would fail validation and take down the
 * whole application — the opposite of the requirement that the app stay fully
 * functional with no OpenAI key configured.
 */
const blankAsUndefined = (value: unknown): unknown =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  /**
   * MySQL connection string, e.g. mysql://user:pass@localhost:3306/nutritrack.
   * Optional here so that `next build` and `vitest` run without a database;
   * `lib/db/pool.ts` asserts its presence at the point it is actually needed.
   */
  DATABASE_URL: z.preprocess(blankAsUndefined, z.string().min(1).optional()),

  /**
   * Optional by design. The weekly summary falls back to a deterministic,
   * rule-based summary when no key is configured, so the application stays
   * fully functional without any OpenAI setup.
   */
  OPENAI_API_KEY: z.preprocess(blankAsUndefined, z.string().min(1).optional()),

  /** Overrides the default model. Optional; ignored without an API key. */
  OPENAI_MODEL: z.preprocess(blankAsUndefined, z.string().min(1).optional()),

  FRUITYVICE_BASE_URL: z.preprocess(
    blankAsUndefined,
    z.url().default("https://www.fruityvice.com/"),
  ),
});

export type Env = Readonly<z.infer<typeof envSchema>>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Invalid environment configuration:\n${details}\n\n` +
        `Copy .env.example to .env and fill in the required values.`,
    );
  }

  return Object.freeze(parsed.data);
}

export const env: Env = loadEnv();
