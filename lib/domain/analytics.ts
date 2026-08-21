/**
 * Daily aggregation of nutrition records. Pure domain module: no I/O.
 *
 * Bucketing is done on each record's stored `consumedOn` string, which was
 * written from local calendar components (see lib/domain/date.ts). This module
 * never re-derives a day from a timestamp, so it cannot reintroduce the UTC
 * off-by-one-day bug that motivated that module.
 */
import { lastNLocalDays, toLocalDateString } from "@/lib/domain/date";
import type { NutritionRecord } from "@/lib/types";

export const DAYS_IN_WEEK = 7;

export interface DailyTotals {
  /** Local calendar day, `YYYY-MM-DD`. */
  readonly date: string;
  readonly calories: number;
  readonly proteinG: number;
  readonly carbsG: number;
  readonly fatG: number;
  readonly sugarG: number;
  readonly recordCount: number;
}

export interface MacroTotals {
  readonly calories: number;
  readonly proteinG: number;
  readonly carbsG: number;
  readonly fatG: number;
  readonly sugarG: number;
}

export interface DailyTotalsResult {
  /** Exactly `dayCount` entries, ascending, with gaps filled as zeroes. */
  readonly days: readonly DailyTotals[];
  readonly totals: MacroTotals;
  /** Per-day means over the whole window. See note below. */
  readonly averages: MacroTotals;
  readonly daysWithRecords: number;
  readonly startDate: string;
  readonly endDate: string;
}

const ZERO: MacroTotals = {
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
  sugarG: 0,
};

/** DECIMAL(8,2) is the storage precision, so two decimals is the honest limit. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundTotals(totals: MacroTotals): MacroTotals {
  return {
    calories: round2(totals.calories),
    proteinG: round2(totals.proteinG),
    carbsG: round2(totals.carbsG),
    fatG: round2(totals.fatG),
    sugarG: round2(totals.sugarG),
  };
}

/**
 * Bucket records into the `dayCount` local days ending on `endDate`.
 *
 * Records outside the window are ignored. Days with no records are still
 * present with zero values, so a chart shows a real gap instead of silently
 * compressing the axis.
 *
 * Averages divide by `dayCount`, not by the number of days that had records:
 * "average daily intake over the last 7 days" should count a day you logged
 * nothing as a zero, otherwise skipping days would inflate the average.
 */
export function buildDailyTotals(
  records: readonly NutritionRecord[],
  endDate: Date,
  dayCount: number,
): DailyTotalsResult {
  const dates = lastNLocalDays(endDate, dayCount);
  const inWindow = new Set(dates);

  const buckets = new Map<string, { totals: MacroTotals; count: number }>();
  for (const date of dates) {
    buckets.set(date, { totals: ZERO, count: 0 });
  }

  for (const record of records) {
    if (!inWindow.has(record.consumedOn)) continue;

    const bucket = buckets.get(record.consumedOn);
    if (bucket === undefined) continue;

    bucket.totals = {
      calories: bucket.totals.calories + record.calories,
      proteinG: bucket.totals.proteinG + record.proteinG,
      carbsG: bucket.totals.carbsG + record.carbsG,
      fatG: bucket.totals.fatG + record.fatG,
      sugarG: bucket.totals.sugarG + record.sugarG,
    };
    bucket.count += 1;
  }

  let running: MacroTotals = ZERO;
  let daysWithRecords = 0;

  const days: DailyTotals[] = dates.map((date) => {
    // Every date was seeded above, so this is always present.
    const bucket = buckets.get(date) ?? { totals: ZERO, count: 0 };

    running = {
      calories: running.calories + bucket.totals.calories,
      proteinG: running.proteinG + bucket.totals.proteinG,
      carbsG: running.carbsG + bucket.totals.carbsG,
      fatG: running.fatG + bucket.totals.fatG,
      sugarG: running.sugarG + bucket.totals.sugarG,
    };

    if (bucket.count > 0) daysWithRecords += 1;

    return {
      date,
      ...roundTotals(bucket.totals),
      recordCount: bucket.count,
    };
  });

  const divisor = dayCount > 0 ? dayCount : 1;

  return {
    days,
    totals: roundTotals(running),
    averages: roundTotals({
      calories: running.calories / divisor,
      proteinG: running.proteinG / divisor,
      carbsG: running.carbsG / divisor,
      fatG: running.fatG / divisor,
      sugarG: running.sugarG / divisor,
    }),
    daysWithRecords,
    startDate: dates[0] ?? toLocalDateString(endDate),
    endDate: dates.at(-1) ?? toLocalDateString(endDate),
  };
}
