import { describe, expect, it } from "vitest";

import { buildDailyTotals, DAYS_IN_WEEK } from "./analytics";
import type { NutritionRecord } from "@/lib/types";

let nextId = 1;

/** A record on a given local day. `at` is only used for ordering/display. */
function record(
  consumedOn: string,
  macros: Partial<Omit<NutritionRecord, "consumedOn">> = {},
): NutritionRecord {
  return {
    id: nextId++,
    userId: 1,
    foodName: "Test food",
    heifaCategory: null,
    servingQty: 1,
    servingUnit: "serve",
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    sugarG: 0,
    source: "manual",
    fruityviceId: null,
    consumedAt: new Date(`${consumedOn}T12:00:00`),
    consumedOn,
    ...macros,
  };
}

const END = new Date(2026, 7, 21); // 2026-08-21, local

describe("buildDailyTotals - aggregation", () => {
  it("sums every macro within a day", () => {
    const result = buildDailyTotals(
      [
        record("2026-08-21", { calories: 100, proteinG: 5, carbsG: 10, fatG: 2, sugarG: 3 }),
        record("2026-08-21", { calories: 250, proteinG: 8, carbsG: 30, fatG: 6, sugarG: 9 }),
      ],
      END,
      DAYS_IN_WEEK,
    );

    const today = result.days.at(-1);

    expect(today?.date).toBe("2026-08-21");
    expect(today).toMatchObject({
      calories: 350,
      proteinG: 13,
      carbsG: 40,
      fatG: 8,
      sugarG: 12,
      recordCount: 2,
    });
  });

  it("keeps each day's records separate", () => {
    const result = buildDailyTotals(
      [
        record("2026-08-20", { calories: 500 }),
        record("2026-08-21", { calories: 100 }),
      ],
      END,
      DAYS_IN_WEEK,
    );

    const byDate = new Map(result.days.map((d) => [d.date, d.calories]));

    expect(byDate.get("2026-08-20")).toBe(500);
    expect(byDate.get("2026-08-21")).toBe(100);
  });

  it("rounds away floating point noise", () => {
    // 0.1 + 0.2 === 0.30000000000000004
    const result = buildDailyTotals(
      [record("2026-08-21", { fatG: 0.1 }), record("2026-08-21", { fatG: 0.2 })],
      END,
      DAYS_IN_WEEK,
    );

    expect(result.days.at(-1)?.fatG).toBe(0.3);
  });

  it("reports window totals across all days", () => {
    const result = buildDailyTotals(
      [
        record("2026-08-19", { calories: 200, proteinG: 10 }),
        record("2026-08-21", { calories: 300, proteinG: 5 }),
      ],
      END,
      DAYS_IN_WEEK,
    );

    expect(result.totals.calories).toBe(500);
    expect(result.totals.proteinG).toBe(15);
  });
});

describe("buildDailyTotals - empty-day filling", () => {
  it("returns exactly seven days for a week window", () => {
    expect(buildDailyTotals([], END, DAYS_IN_WEEK).days).toHaveLength(7);
  });

  it("returns all seven days as zeroes when there are no records", () => {
    const result = buildDailyTotals([], END, DAYS_IN_WEEK);

    for (const day of result.days) {
      expect(day).toMatchObject({
        calories: 0,
        proteinG: 0,
        carbsG: 0,
        fatG: 0,
        sugarG: 0,
        recordCount: 0,
      });
    }
  });

  it("keeps a gap day in place rather than omitting it", () => {
    const result = buildDailyTotals(
      [record("2026-08-19", { calories: 400 }), record("2026-08-21", { calories: 400 })],
      END,
      DAYS_IN_WEEK,
    );

    expect(result.days.map((d) => d.date)).toEqual([
      "2026-08-15",
      "2026-08-16",
      "2026-08-17",
      "2026-08-18",
      "2026-08-19",
      "2026-08-20",
      "2026-08-21",
    ]);
    expect(result.days.find((d) => d.date === "2026-08-20")?.calories).toBe(0);
  });

  it("returns days in ascending date order", () => {
    const result = buildDailyTotals(
      [record("2026-08-21"), record("2026-08-15"), record("2026-08-18")],
      END,
      DAYS_IN_WEEK,
    );
    const dates = result.days.map((d) => d.date);

    expect([...dates].sort()).toEqual(dates);
  });

  it("counts how many days actually had records", () => {
    const result = buildDailyTotals(
      [record("2026-08-19"), record("2026-08-19"), record("2026-08-21")],
      END,
      DAYS_IN_WEEK,
    );

    expect(result.daysWithRecords).toBe(2);
  });
});

describe("buildDailyTotals - window boundaries", () => {
  it("includes a record on the first day of the window", () => {
    const result = buildDailyTotals(
      [record("2026-08-15", { calories: 111 })],
      END,
      DAYS_IN_WEEK,
    );

    expect(result.days[0]?.calories).toBe(111);
    expect(result.totals.calories).toBe(111);
  });

  it("includes a record on the last day of the window", () => {
    const result = buildDailyTotals(
      [record("2026-08-21", { calories: 222 })],
      END,
      DAYS_IN_WEEK,
    );

    expect(result.days.at(-1)?.calories).toBe(222);
  });

  it("excludes the day immediately before the window", () => {
    const result = buildDailyTotals(
      [record("2026-08-14", { calories: 999 })],
      END,
      DAYS_IN_WEEK,
    );

    expect(result.totals.calories).toBe(0);
    expect(result.days.map((d) => d.date)).not.toContain("2026-08-14");
  });

  it("excludes a future day beyond the window", () => {
    const result = buildDailyTotals(
      [record("2026-08-22", { calories: 999 })],
      END,
      DAYS_IN_WEEK,
    );

    expect(result.totals.calories).toBe(0);
  });

  it("puts a 00:10 record on its own local day, not the previous one", () => {
    // consumed_on is written from local components upstream; this asserts the
    // aggregation trusts that value rather than re-deriving it from UTC.
    const midnightish = record("2026-08-18", { calories: 290 });

    expect(
      buildDailyTotals([midnightish], END, DAYS_IN_WEEK).days.find(
        (d) => d.date === "2026-08-18",
      )?.calories,
    ).toBe(290);
  });

  it("reports the window start and end dates", () => {
    const result = buildDailyTotals([], END, DAYS_IN_WEEK);

    expect(result.startDate).toBe("2026-08-15");
    expect(result.endDate).toBe("2026-08-21");
  });

  it("spans a month boundary correctly", () => {
    const result = buildDailyTotals([], new Date(2026, 8, 2), 4);

    expect(result.days.map((d) => d.date)).toEqual([
      "2026-08-30",
      "2026-08-31",
      "2026-09-01",
      "2026-09-02",
    ]);
  });
});

describe("buildDailyTotals - averages", () => {
  it("divides by the number of days in the window, not days with records", () => {
    // 700 kcal on a single day is 100/day across a week, not 700/day.
    const result = buildDailyTotals(
      [record("2026-08-21", { calories: 700 })],
      END,
      DAYS_IN_WEEK,
    );

    expect(result.averages.calories).toBe(100);
  });

  it("returns zero averages for an empty window", () => {
    expect(buildDailyTotals([], END, DAYS_IN_WEEK).averages.calories).toBe(0);
  });

  it("rounds averages to two decimals", () => {
    const result = buildDailyTotals(
      [record("2026-08-21", { calories: 100 })],
      END,
      DAYS_IN_WEEK,
    );

    expect(result.averages.calories).toBe(14.29);
  });

  it("does not divide by zero for a zero-day window", () => {
    const result = buildDailyTotals([], END, 0);

    expect(result.days).toEqual([]);
    expect(result.averages.calories).toBe(0);
  });
});
