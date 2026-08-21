import { HEIFA_CATEGORY_LABELS } from "@/lib/domain/heifa";
import type { NutritionRecord } from "@/lib/types";

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** Group records by their stored local calendar day, newest day first. */
function groupByDay(
  records: readonly NutritionRecord[],
): [string, NutritionRecord[]][] {
  const groups = new Map<string, NutritionRecord[]>();

  for (const record of records) {
    const existing = groups.get(record.consumedOn);

    if (existing === undefined) {
      groups.set(record.consumedOn, [record]);
    } else {
      existing.push(record);
    }
  }

  return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a));
}

export function RecordList({
  records,
}: {
  records: readonly NutritionRecord[];
}) {
  if (records.length === 0) {
    return (
      <p className="rounded-xl border border-black/10 bg-white p-6 text-sm text-black/60 dark:border-white/15 dark:bg-white/5 dark:text-white/60">
        No records yet. Add your first one to start tracking.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groupByDay(records).map(([day, dayRecords]) => {
        const dayCalories = dayRecords.reduce((sum, r) => sum + r.calories, 0);

        return (
          <section key={day} className="flex flex-col gap-2">
            <header className="flex items-baseline justify-between">
              <h2 className="text-sm font-medium">{day}</h2>
              <span className="text-xs tabular-nums text-black/50 dark:text-white/50">
                {formatNumber(dayCalories)} kcal
              </span>
            </header>

            <ul className="divide-y divide-black/5 overflow-hidden rounded-xl border border-black/10 bg-white dark:divide-white/10 dark:border-white/15 dark:bg-white/5">
              {dayRecords.map((record) => (
                <li key={record.id} className="flex flex-col gap-1 px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium">
                      {record.foodName}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums">
                      {formatNumber(record.calories)} kcal
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-black/55 dark:text-white/55">
                    <span>{formatTime(record.consumedAt)}</span>
                    <span>
                      {formatNumber(record.servingQty)} {record.servingUnit}
                    </span>
                    {record.heifaCategory !== null && (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 dark:bg-white/10">
                        {HEIFA_CATEGORY_LABELS[record.heifaCategory]}
                      </span>
                    )}
                    {record.source === "fruityvice" && (
                      <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">
                        FruityVice
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-3 text-xs tabular-nums text-black/45 dark:text-white/45">
                    <span>P {formatNumber(record.proteinG)}g</span>
                    <span>C {formatNumber(record.carbsG)}g</span>
                    <span>F {formatNumber(record.fatG)}g</span>
                    <span>Sugar {formatNumber(record.sugarG)}g</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
