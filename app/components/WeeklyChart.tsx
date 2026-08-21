"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DailyTotals } from "@/lib/domain/analytics";

interface ChartDatum {
  date: string;
  label: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG: number;
  recordCount: number;
}

/** "2026-08-21" -> "Fri 21". Parsed as local components, never as a UTC instant. */
function shortLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);

  if (year === undefined || month === undefined || day === undefined) {
    return isoDate;
  }

  const date = new Date(year, month - 1, day);

  return `${date.toLocaleDateString(undefined, { weekday: "short" })} ${String(day)}`;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartDatum }[];
}) {
  const datum = payload?.[0]?.payload;

  if (active !== true || datum === undefined) return null;

  return (
    <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg dark:border-white/20 dark:bg-neutral-900">
      <p className="font-medium">{datum.date}</p>
      <p className="mt-1 tabular-nums">{datum.calories} kcal</p>
      <p className="mt-1 text-black/55 dark:text-white/55">
        P {datum.proteinG}g · C {datum.carbsG}g · F {datum.fatG}g
      </p>
      <p className="mt-0.5 text-black/45 dark:text-white/45">
        {datum.recordCount === 0
          ? "No records"
          : `${String(datum.recordCount)} record${datum.recordCount === 1 ? "" : "s"}`}
      </p>
    </div>
  );
}

export function WeeklyChart({ days }: { days: readonly DailyTotals[] }) {
  const data: ChartDatum[] = days.map((day) => ({
    ...day,
    label: shortLabel(day.date),
  }));

  const hasAnyRecords = days.some((day) => day.recordCount > 0);

  if (!hasAnyRecords) {
    // An all-zero bar chart reads as broken rather than empty. Say so instead.
    return (
      <div className="flex h-56 w-full items-center justify-center rounded-lg border border-dashed border-black/10 dark:border-white/15">
        <p className="text-sm text-black/50 dark:text-white/50">
          No records in this period yet.
        </p>
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -16 }}>
          {/* Recessive grid: horizontal only, no vertical rules. */}
          <CartesianGrid
            vertical={false}
            stroke="var(--chart-grid)"
            strokeDasharray="0"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "var(--chart-grid)" }}
            tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
            interval={0}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
            width={48}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "var(--chart-grid)" }}
          />
          <Bar
            dataKey="calories"
            fill="var(--chart-series)"
            // 4px rounded data-end, anchored flat to the baseline.
            radius={[4, 4, 0, 0]}
            // 2px of surface between adjacent bars.
            barSize={28}
            isAnimationActive={false}
          >
            {data.map((datum) => (
              <Cell
                key={datum.date}
                // An empty day still occupies its slot; it just has no height.
                fill="var(--chart-series)"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
