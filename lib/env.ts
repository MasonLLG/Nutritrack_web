import { z } from "zod";

/**
 * Centralised environment access.
 *
 * This module is the ONLY place in the codebase permitted to read `process.env`.
 * Route handlers, services, clients and components import `env` from here instead.
 * Enforced by the `grep -rn "process.env" app/ lib/ scripts/` check in the plan,
 * which must match this file and nothing else.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  /**
   * MySQL connection string, e.g. mysql://user:pass@localhost:3306/nutritrack.
   * Required from Step 2 onward, when database connectivity is introduced.
   */
  DATABASE_URL: z.string().min(1).optional(),

  /**
   * Optional by design. The weekly summary falls back to a deterministic,
   * rule-based summary when no key is configured, so the application stays
   * fully functional without any OpenAI setup.
   */
  OPENAI_API_KEY: z.string().min(1).optional(),

  FRUITYVICE_BASE_URL: z.url().default("https://www.fruityvice.com/"),
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

/** True when the AI weekly summary can call OpenAI; false selects the fallback. */
export const isOpenAiConfigured = (): boolean => env.OPENAI_API_KEY !== undefined;
