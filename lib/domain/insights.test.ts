import { describe, expect, it } from "vitest";

import { buildDailyTotals, DAYS_IN_WEEK } from "./analytics";
import {
  buildFactSheet,
  buildFallbackSummary,
  PROHIBITED_ADVICE_PATTERNS,
} from "./insights";
import type { NutritionRecord } from "@/lib/types";

let nextId = 1;

function record(
  consumedOn: string,
  macros: Partial<NutritionRecord> = {},
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

const END = new Date(2026, 7, 21);

const populated = buildDailyTotals(
  [
    record("2026-08-15", { calories: 689, proteinG: 41.1 }),
    record("2026-08-17", { calories: 286, proteinG: 17.2 }),
    record("2026-08-20", { calories: 790, proteinG: 19.5 }),
    record("2026-08-21", { calories: 589, proteinG: 25.4 }),
  ],
  END,
  DAYS_IN_WEEK,
);

const empty = buildDailyTotals([], END, DAYS_IN_WEEK);

describe("buildFactSheet", () => {
  it("reports the window and logging coverage", () => {
    const facts = buildFactSheet(populated);

    expect(facts.startDate).toBe("2026-08-15");
    expect(facts.endDate).toBe("2026-08-21");
    expect(facts.daysLogged).toBe(4);
    expect(facts.daysInWindow).toBe(7);
  });

  it("identifies the highest and lowest logged days", () => {
    const facts = buildFactSheet(populated);

    expect(facts.highestDay).toEqual({ date: "2026-08-20", calories: 790 });
    expect(facts.lowestDay).toEqual({ date: "2026-08-17", calories: 286 });
  });

  it("ignores unlogged days when picking the lowest day", () => {
    // A day with no records is a gap in the log, not a 0 kcal day of eating.
    expect(buildFactSheet(populated).lowestDay?.calories).not.toBe(0);
  });

  it("returns null extremes for a week with no records", () => {
    const facts = buildFactSheet(empty);

    expect(facts.daysLogged).toBe(0);
    expect(facts.highestDay).toBeNull();
    expect(facts.lowestDay).toBeNull();
  });
});

describe("buildFallbackSummary", () => {
  it("produces a non-empty summary without any AI configured", () => {
    expect(buildFallbackSummary(populated).length).toBeGreaterThan(40);
  });

  it("is deterministic for the same input", () => {
    expect(buildFallbackSummary(populated)).toBe(
      buildFallbackSummary(populated),
    );
  });

  it("states how many days were logged", () => {
    expect(buildFallbackSummary(populated)).toContain("4 of 7");
  });

  it("includes the average daily energy", () => {
    expect(buildFallbackSummary(populated)).toContain(
      String(populated.averages.calories),
    );
  });

  it("names the highest and lowest logged days", () => {
    const summary = buildFallbackSummary(populated);

    expect(summary).toContain("2026-08-20");
    expect(summary).toContain("2026-08-17");
  });

  it("handles a week with no records without crashing", () => {
    const summary = buildFallbackSummary(empty);

    expect(summary).toContain("no records");
  });
});

describe("health-safety constraints", () => {
  // The fallback is shown to users verbatim, so it must never read as clinical
  // guidance. This is the safety net for the path that runs with no API key.
  const samples = [
    buildFallbackSummary(populated),
    buildFallbackSummary(empty),
  ];

  it.each(samples)("contains no diagnostic or prescriptive language: %s", (summary) => {
    for (const pattern of PROHIBITED_ADVICE_PATTERNS) {
      expect(summary).not.toMatch(pattern);
    }
  });

  it("has a prohibited-pattern list that actually matches such language", () => {
    // Guards against the list silently becoming a no-op.
    const offending = [
      "You should eat more protein.",
      "This indicates a deficiency.",
      "We recommend increasing your fibre intake.",
      "You are at risk of malnutrition.",
      "Try to reduce your sugar intake.",
    ];

    for (const text of offending) {
      expect(
        PROHIBITED_ADVICE_PATTERNS.some((pattern) => pattern.test(text)),
      ).toBe(true);
    }
  });
});
