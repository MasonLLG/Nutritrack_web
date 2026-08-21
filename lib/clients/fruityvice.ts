/**
 * FruityVice API client.
 *
 * Ported from the Android app's Retrofit `FruitApiService`, which called
 * `api/fruit/{name}` against https://www.fruityvice.com/.
 *
 * Only this module knows the upstream URL and response shape. It returns
 * domain types and never throws raw fetch/JSON errors at its callers: every
 * failure is mapped to a `FruityViceError` with a discriminating `kind`, so the
 * route handler can choose a status code without inspecting error strings.
 *
 * IMPORTANT: FruityVice reports nutrition per 100 g of edible portion. The
 * values returned here are therefore per 100 g, not per serving. Callers must
 * scale them; see `FRUITYVICE_BASIS_GRAMS`.
 */
import { z } from "zod";

import { env } from "@/lib/env";

/** FruityVice nutrition figures are quoted per this many grams. */
export const FRUITYVICE_BASIS_GRAMS = 100;

const DEFAULT_TIMEOUT_MS = 8_000;

const fruitSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  family: z.string(),
  genus: z.string(),
  order: z.string(),
  nutritions: z.object({
    calories: z.number(),
    fat: z.number(),
    sugar: z.number(),
    carbohydrates: z.number(),
    protein: z.number(),
  }),
});

export type Fruit = z.infer<typeof fruitSchema>;

export type FruityViceErrorKind =
  /** Upstream returned 404 — no fruit by that name. */
  | "not_found"
  /** Request timed out or the host was unreachable. */
  | "unavailable"
  /** Reached the API but the payload did not match the expected shape. */
  | "invalid_response";

export class FruityViceError extends Error {
  constructor(
    readonly kind: FruityViceErrorKind,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "FruityViceError";
  }
}

function buildUrl(path: string): string {
  // env.FRUITYVICE_BASE_URL is validated as a URL and defaults to the value
  // the Android app used. Joining via URL avoids double/missing slashes.
  return new URL(path, env.FRUITYVICE_BASE_URL).toString();
}

async function getJson(path: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      // Upstream data is effectively static; let Next cache it briefly so a
      // burst of lookups does not hammer a third-party API.
      next: { revalidate: 3600 },
    });
  } catch (cause) {
    throw new FruityViceError(
      "unavailable",
      "The nutrition service did not respond.",
      cause,
    );
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 404) {
    throw new FruityViceError("not_found", "No fruit found with that name.");
  }

  if (!response.ok) {
    throw new FruityViceError(
      "unavailable",
      `The nutrition service returned ${String(response.status)}.`,
    );
  }

  try {
    return await response.json();
  } catch (cause) {
    throw new FruityViceError(
      "invalid_response",
      "The nutrition service returned a malformed response.",
      cause,
    );
  }
}

/**
 * Look up one fruit by name. Case-insensitive upstream.
 *
 * @throws FruityViceError - never a raw fetch or JSON error.
 */
export async function findFruitByName(
  name: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Fruit> {
  const trimmed = name.trim();

  if (trimmed === "") {
    throw new FruityViceError("not_found", "No fruit name was provided.");
  }

  const payload = await getJson(
    `api/fruit/${encodeURIComponent(trimmed)}`,
    timeoutMs,
  );

  const parsed = fruitSchema.safeParse(payload);

  if (!parsed.success) {
    throw new FruityViceError(
      "invalid_response",
      "The nutrition service returned an unexpected shape.",
      parsed.error,
    );
  }

  return parsed.data;
}
