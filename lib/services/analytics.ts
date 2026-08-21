/**
 * Weekly analytics assembly.
 *
 * Orchestration only: fetch the window through the repository, then hand the
 * rows to the pure aggregator in lib/domain/analytics.ts.
 */
import { listInDateRange } from "@/lib/db/repositories/nutritionRecordRepository";
import { getImplicitUser } from "@/lib/db/repositories/userRepository";
import {
  buildDailyTotals,
  DAYS_IN_WEEK,
  type DailyTotalsResult,
} from "@/lib/domain/analytics";
import { lastNLocalDays } from "@/lib/domain/date";

/**
 * Totals for the `dayCount` local days ending today.
 *
 * The date range is computed in the application's local calendar and passed to
 * the query as `YYYY-MM-DD` strings, which is also what `consumed_on` stores —
 * so the SQL filter and the in-memory bucketing agree by construction.
 */
export async function getWeeklyAnalytics(
  dayCount: number = DAYS_IN_WEEK,
): Promise<DailyTotalsResult> {
  const user = await getImplicitUser();
  const today = new Date();
  const days = lastNLocalDays(today, dayCount);

  const startDate = days[0];
  const endDate = days.at(-1);

  if (startDate === undefined || endDate === undefined) {
    return buildDailyTotals([], today, dayCount);
  }

  const records = await listInDateRange(user.id, startDate, endDate);

  return buildDailyTotals(records, today, dayCount);
}
