/**
 * Thin OpenAI wrapper.
 *
 * The only module that imports the OpenAI SDK. It returns `null` rather than
 * throwing whenever generation is unavailable — no key configured, an API
 * error, or an empty completion — so callers treat "no AI" as an ordinary
 * outcome and fall back, instead of surfacing an error to the user.
 */
import OpenAI from "openai";

import { env } from "@/lib/env";

const DEFAULT_MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 20_000;
const MAX_OUTPUT_TOKENS = 400;

let cachedClient: OpenAI | null = null;

/** True when a key is configured. Drives the UI's "AI" vs "rule-based" label. */
export function isOpenAiConfigured(): boolean {
  return env.OPENAI_API_KEY !== undefined;
}

function getClient(): OpenAI | null {
  const apiKey = env.OPENAI_API_KEY;

  if (apiKey === undefined) return null;

  cachedClient ??= new OpenAI({ apiKey, timeout: TIMEOUT_MS, maxRetries: 1 });

  return cachedClient;
}

export interface CompletionRequest {
  readonly systemPrompt: string;
  readonly userPrompt: string;
}

/**
 * Generate a completion, or `null` if unavailable.
 *
 * `temperature` is low and deliberate: this summarises figures, so variation
 * between runs is noise rather than value.
 */
export async function generateText(
  request: CompletionRequest,
): Promise<string | null> {
  const client = getClient();

  if (client === null) return null;

  try {
    const completion = await client.chat.completions.create({
      model: env.OPENAI_MODEL ?? DEFAULT_MODEL,
      temperature: 0.2,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt },
      ],
    });

    const text = completion.choices[0]?.message.content?.trim();

    return text === undefined || text === "" ? null : text;
  } catch (error) {
    // Log for the operator; the caller falls back silently for the user.
    console.error("[openai] generation failed:", error);

    return null;
  }
}
