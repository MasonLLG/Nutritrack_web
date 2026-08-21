/**
 * Weekly summary orchestration.
 *
 * Decides between a model-generated summary and the deterministic rule-based
 * one, and is the single place the health-safety constraints are enforced on
 * generated text.
 */
import { generateText, isOpenAiConfigured } from "@/lib/clients/openai";
import {
  buildFactSheet,
  buildFallbackSummary,
  PROHIBITED_ADVICE_PATTERNS,
  type FactSheet,
} from "@/lib/domain/insights";
import { getWeeklyAnalytics } from "@/lib/services/analytics";

export type InsightSource =
  /** Written by the language model and passed the safety check. */
  | "ai"
  /** Deterministic rule-based text: no key configured, or generation failed. */
  | "fallback"
  /** Model text was rejected by the safety check; fallback shown instead. */
  | "fallback_after_rejection";

export interface WeeklyInsight {
  readonly summary: string;
  readonly source: InsightSource;
  readonly startDate: string;
  readonly endDate: string;
  readonly generatedAt: string;
}

/**
 * The constraints are stated as hard prohibitions rather than preferences.
 * This is the primary control; `PROHIBITED_ADVICE_PATTERNS` is the backstop.
 */
const SYSTEM_PROMPT = [
  "You summarise a person's food diary for an informational nutrition-tracking app.",
  "",
  "You are NOT a clinician and this is NOT a medical service. You must:",
  "- Describe only what the supplied figures show. Never infer a health status.",
  "- Never diagnose a condition, deficiency, disorder, or risk.",
  "- Never recommend, prescribe, or suggest any change to diet, supplements,",
  "  exercise, or medical care — not even mild suggestions like 'try adding'.",
  "- Never label foods or intake as healthy, unhealthy, good, or bad.",
  "- Never state or imply target, ideal, or recommended intake values.",
  "- Never tell the reader to consult a doctor; the interface already carries a",
  "  standing disclaimer.",
  "",
  "Write 3 to 5 plain sentences of neutral, factual description: what was",
  "logged, how consistently, and how the days compared with each other.",
  "Use only the numbers provided; never invent or estimate a figure.",
  "Do not use bullet points, headings, or markdown.",
].join("\n");

function buildUserPrompt(facts: FactSheet): string {
  // Only derived figures are sent — no food names, no free text the user typed.
  return [
    "Summarise this week of food-diary figures.",
    "",
    `Period: ${facts.startDate} to ${facts.endDate}`,
    `Days in period: ${String(facts.daysInWindow)}`,
    `Days with entries: ${String(facts.daysLogged)}`,
    `Total entries: ${String(facts.totalRecords)}`,
    `Total energy logged: ${String(facts.totalCalories)} kcal`,
    `Average energy per day in period: ${String(facts.averageCaloriesPerDay)} kcal`,
    `Average protein per day: ${String(facts.averageProteinG)} g`,
    `Average carbohydrate per day: ${String(facts.averageCarbsG)} g`,
    `Average fat per day: ${String(facts.averageFatG)} g`,
    `Average sugar per day: ${String(facts.averageSugarG)} g`,
    facts.highestDay === null
      ? "Highest logged day: none"
      : `Highest logged day: ${facts.highestDay.date} at ${String(facts.highestDay.calories)} kcal`,
    facts.lowestDay === null
      ? "Lowest logged day: none"
      : `Lowest logged day: ${facts.lowestDay.date} at ${String(facts.lowestDay.calories)} kcal`,
    "",
    "Days without entries count as zero in the averages.",
  ].join("\n");
}

/** True when generated text contains language the app must not present. */
export function violatesHealthConstraints(text: string): boolean {
  return PROHIBITED_ADVICE_PATTERNS.some((pattern) => pattern.test(text));
}

export async function getWeeklyInsight(): Promise<WeeklyInsight> {
  const analytics = await getWeeklyAnalytics();
  const fallback = buildFallbackSummary(analytics);

  const base = {
    startDate: analytics.startDate,
    endDate: analytics.endDate,
    generatedAt: new Date().toISOString(),
  };

  if (!isOpenAiConfigured()) {
    return { ...base, summary: fallback, source: "fallback" };
  }

  const generated = await generateText({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(buildFactSheet(analytics)),
  });

  if (generated === null) {
    return { ...base, summary: fallback, source: "fallback" };
  }

  if (violatesHealthConstraints(generated)) {
    // The model ignored its constraints. Discard the text rather than showing
    // it, and record that this happened.
    console.warn(
      "[insights] generated summary rejected: prohibited advice language",
    );

    return { ...base, summary: fallback, source: "fallback_after_rejection" };
  }

  return { ...base, summary: generated, source: "ai" };
}
