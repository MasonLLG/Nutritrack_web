import { WeeklyChart } from "@/app/components/WeeklyChart";
import type { DailyTotalsResult } from "@/lib/domain/analytics";

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function WeeklySummaryPanel({
  analytics,
}: {
  analytics: DailyTotalsResult;
}) {
  return (
    <section
      aria-labelledby="weekly-heading"
      className="flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-white/5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          {/* Single series: the heading names it, so no legend box is needed. */}
          <h2 id="weekly-heading" className="text-sm font-medium">
            Energy intake, last 7 days
          </h2>
          <p className="text-xs text-black/50 dark:text-white/50">
            {analytics.startDate} to {analytics.endDate} ·{" "}
            {analytics.daysWithRecords} of {analytics.days.length} days logged
          </p>
        </div>

        <p className="text-right">
          <span className="text-2xl font-semibold tabular-nums">
            {formatNumber(analytics.averages.calories)}
          </span>
          <span className="ml-1 text-sm text-black/50 dark:text-white/50">
            kcal/day avg
          </span>
        </p>
      </div>

      <WeeklyChart days={analytics.days} />

      {/* Table view: identity and values are never conveyed by the mark alone. */}
      <details className="text-sm">
        <summary className="cursor-pointer text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white">
          View as table
        </summary>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums">
            <thead className="text-black/55 dark:text-white/55">
              <tr>
                <th scope="col" className="py-1 pr-4 font-medium">Day</th>
                <th scope="col" className="py-1 pr-4 font-medium">kcal</th>
                <th scope="col" className="py-1 pr-4 font-medium">Protein</th>
                <th scope="col" className="py-1 pr-4 font-medium">Carbs</th>
                <th scope="col" className="py-1 pr-4 font-medium">Fat</th>
                <th scope="col" className="py-1 font-medium">Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {analytics.days.map((day) => (
                <tr key={day.date}>
                  <th scope="row" className="py-1 pr-4 font-normal">
                    {day.date}
                  </th>
                  <td className="py-1 pr-4">{formatNumber(day.calories)}</td>
                  <td className="py-1 pr-4">{formatNumber(day.proteinG)}g</td>
                  <td className="py-1 pr-4">{formatNumber(day.carbsG)}g</td>
                  <td className="py-1 pr-4">{formatNumber(day.fatG)}g</td>
                  <td className="py-1">{day.recordCount}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-black/10 font-medium dark:border-white/15">
              <tr>
                <th scope="row" className="py-1 pr-4 text-left">Total</th>
                <td className="py-1 pr-4">{formatNumber(analytics.totals.calories)}</td>
                <td className="py-1 pr-4">{formatNumber(analytics.totals.proteinG)}g</td>
                <td className="py-1 pr-4">{formatNumber(analytics.totals.carbsG)}g</td>
                <td className="py-1 pr-4">{formatNumber(analytics.totals.fatG)}g</td>
                <td className="py-1" />
              </tr>
            </tfoot>
          </table>
        </div>
      </details>
    </section>
  );
}
