/**
 * Weekly summary content rules. Pure domain module: no I/O, no AI calls.
 *
 * SCOPE AND SAFETY
 * NutriTrack is an informational food log, not a clinical tool. Everything here
 * describes what was logged; nothing interprets it as a health finding. The
 * summary must never diagnose a condition, assert a deficiency or risk, or
 * prescribe a change in diet — whether written by the rule-based fallback below
 * or returned by a language model.
 */
import type { DailyTotalsResult } from "@/lib/domain/analytics";

/**
 * Language that would turn a description into medical advice.
 *
 * Used two ways: as a unit-test assertion against the fallback text, and as a
 * post-generation check on model output in lib/services/insights.ts. It is a
 * backstop, not the primary control — the system prompt is that — but it means
 * a model that ignores its instructions cannot reach the user unchallenged.
 */
export const PROHIBITED_ADVICE_PATTERNS: readonly RegExp[] = [
  /\byou should\b/i,
  /\byou need to\b/i,
  /\bwe recommend\b/i,
  /\bi recommend\b/i,
  /\brecommend(?:ed|ation)?\b/i,
  /\byou must\b/i,
  /\btry to (?:eat|reduce|increase|avoid|limit)\b/i,
  /\bdeficien(?:t|cy|cies)\b/i,
  /\bdiagnos(?:e|is|ed|tic)\b/i,
  /\bsymptom/i,
  /\bat risk of\b/i,
  /\bunhealthy\b/i,
  /\btreat(?:ment|ing)\b/i,
  /\bprescri(?:be|bed|ption)\b/i,
  /\bconsult (?:a|your) (?:doctor|physician)\b/i,
  /\bshould (?:eat|consume|increase|reduce|avoid|limit)\b/i,
];

export interface DayEnergy {
  readonly date: string;
  readonly calories: number;
}

/**
 * The facts a summary may draw on. Building this explicitly keeps the model's
 * input to logged figures only — it never sees free text a user typed, and it
 * cannot invent a number that is not here.
 */
export interface FactSheet {
  readonly startDate: string;
  readonly endDate: string;
  readonly daysInWindow: number;
  readonly daysLogged: number;
  readonly totalCalories: number;
  readonly averageCaloriesPerDay: number;
  readonly averageProteinG: number;
  readonly averageCarbsG: number;
  readonly averageFatG: number;
  readonly averageSugarG: number;
  readonly totalRecords: number;
  /** Highest/lowest among *logged* days only; null when nothing was logged. */
  readonly highestDay: DayEnergy | null;
  readonly lowestDay: DayEnergy | null;
}

export function buildFactSheet(analytics: DailyTotalsResult): FactSheet {
  // Unlogged days are gaps in the record, not zero-calorie days of eating, so
  // they are excluded from the extremes.
  const logged = analytics.days.filter((day) => day.recordCount > 0);

  let highest: DayEnergy | null = null;
  let lowest: DayEnergy | null = null;

  for (const day of logged) {
    const entry: DayEnergy = { date: day.date, calories: day.calories };

    if (highest === null || day.calories > highest.calories) highest = entry;
    if (lowest === null || day.calories < lowest.calories) lowest = entry;
  }

  return {
    startDate: analytics.startDate,
    endDate: analytics.endDate,
    daysInWindow: analytics.days.length,
    daysLogged: logged.length,
    totalCalories: analytics.totals.calories,
    averageCaloriesPerDay: analytics.averages.calories,
    averageProteinG: analytics.averages.proteinG,
    averageCarbsG: analytics.averages.carbsG,
    averageFatG: analytics.averages.fatG,
    averageSugarG: analytics.averages.sugarG,
    totalRecords: analytics.days.reduce((sum, d) => sum + d.recordCount, 0),
    highestDay: highest,
    lowestDay: lowest,
  };
}

/**
 * Deterministic, rule-based summary.
 *
 * This is what users see when no OpenAI key is configured, so it is a first
 *-class feature rather than a degraded placeholder: purely descriptive, and
 * built only from figures already on screen.
 */
export function buildFallbackSummary(analytics: DailyTotalsResult): string {
  const facts = buildFactSheet(analytics);

  if (facts.daysLogged === 0) {
    return (
      `Between ${facts.startDate} and ${facts.endDate} there are no records ` +
      `logged. Once entries are added, this summary will describe the totals ` +
      `and averages for the period.`
    );
  }

  const sentences: string[] = [
    `Between ${facts.startDate} and ${facts.endDate}, entries were logged on ` +
      `${String(facts.daysLogged)} of ${String(facts.daysInWindow)} days, ` +
      `covering ${String(facts.totalRecords)} record` +
      `${facts.totalRecords === 1 ? "" : "s"}.`,
    `Logged energy across the period totalled ` +
      `${String(facts.totalCalories)} kcal, averaging ` +
      `${String(facts.averageCaloriesPerDay)} kcal per day across all ` +
      `${String(facts.daysInWindow)} days.`,
    `Average logged macronutrients per day were ` +
      `${String(facts.averageProteinG)} g protein, ` +
      `${String(facts.averageCarbsG)} g carbohydrate, ` +
      `${String(facts.averageFatG)} g fat and ` +
      `${String(facts.averageSugarG)} g sugar.`,
  ];

  if (facts.highestDay !== null && facts.lowestDay !== null) {
    sentences.push(
      facts.highestDay.date === facts.lowestDay.date
        ? `The only logged day was ${facts.highestDay.date}, at ` +
            `${String(facts.highestDay.calories)} kcal.`
        : `The highest logged day was ${facts.highestDay.date} at ` +
            `${String(facts.highestDay.calories)} kcal, and the lowest was ` +
            `${facts.lowestDay.date} at ` +
            `${String(facts.lowestDay.calories)} kcal.`,
    );
  }

  if (facts.daysLogged < facts.daysInWindow) {
    sentences.push(
      `Days without entries are counted as zero in the averages above, so ` +
        `figures reflect logging coverage as well as intake.`,
    );
  }

  return sentences.join(" ");
}
