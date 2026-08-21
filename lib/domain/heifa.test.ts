import { describe, expect, it } from "vitest";

import {
  HEIFA_CATEGORIES,
  HEIFA_CATEGORY_MAX,
  HEIFA_COMPONENT_CATEGORIES,
  HEIFA_CSV_COLUMNS,
  HEIFA_TOTAL_MAX,
  parseSex,
  resolveHeifaScores,
  resolveHeifaScoresFromCsvRow,
} from "./heifa";

/** A CSV row where every Male column is 1 and every Female column is 2. */
function pairedRow(overrides: Record<string, string> = {}): Record<string, string> {
  const row: Record<string, string> = { Sex: "Male" };

  for (const category of HEIFA_CATEGORIES) {
    const columns = HEIFA_CSV_COLUMNS[category];
    row[columns.male] = "1";
    row[columns.female] = "2";
  }

  return { ...row, ...overrides };
}

describe("parseSex", () => {
  it("accepts the exact casing used in the Android CSV", () => {
    expect(parseSex("Male")).toBe("male");
    expect(parseSex("Female")).toBe("female");
  });

  it("is case-insensitive", () => {
    expect(parseSex("male")).toBe("male");
    expect(parseSex("MALE")).toBe("male");
    expect(parseSex("fEmAlE")).toBe("female");
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseSex("  Female  ")).toBe("female");
  });

  it("returns null for an unknown value rather than guessing", () => {
    // The Android app fell through to the Female column for anything that was
    // not "Male". Returning null instead makes bad data surface at import.
    expect(parseSex("Other")).toBeNull();
    expect(parseSex("")).toBeNull();
    expect(parseSex("   ")).toBeNull();
  });
});

describe("resolveHeifaScores", () => {
  const pairs = {
    total: { male: 41.67, female: 46.17 },
    discretionary: { male: 10, female: 8 },
  };

  it("picks the male value for a male subject", () => {
    expect(resolveHeifaScores(pairs, "male")).toEqual({
      total: 41.67,
      discretionary: 10,
    });
  });

  it("picks the female value for a female subject", () => {
    expect(resolveHeifaScores(pairs, "female")).toEqual({
      total: 46.17,
      discretionary: 8,
    });
  });

  it("does not mutate the input", () => {
    const input = { total: { male: 1, female: 2 } };
    resolveHeifaScores(input, "male");

    expect(input).toEqual({ total: { male: 1, female: 2 } });
  });
});

describe("resolveHeifaScoresFromCsvRow", () => {
  it("resolves every category to its male column for a male row", () => {
    const scores = resolveHeifaScoresFromCsvRow(pairedRow(), "male");

    expect(Object.keys(scores).sort()).toEqual([...HEIFA_CATEGORIES].sort());
    for (const category of HEIFA_CATEGORIES) {
      expect(scores[category]).toBe(1);
    }
  });

  it("resolves every category to its female column for a female row", () => {
    const scores = resolveHeifaScoresFromCsvRow(pairedRow(), "female");

    for (const category of HEIFA_CATEGORIES) {
      expect(scores[category]).toBe(2);
    }
  });

  it("covers the total plus 13 scored components", () => {
    expect(HEIFA_CATEGORIES).toHaveLength(14);
    expect(HEIFA_COMPONENT_CATEGORIES).toHaveLength(13);
  });

  it("parses decimal scores rather than truncating them", () => {
    const row = pairedRow({ HEIFAtotalscoreMale: "41.67" });

    expect(resolveHeifaScoresFromCsvRow(row, "male").total).toBe(41.67);
  });

  it("throws a message naming the column when a value is missing", () => {
    const row = pairedRow({ HEIFAtotalscoreMale: "" });

    expect(() => resolveHeifaScoresFromCsvRow(row, "male")).toThrowError(
      /HEIFAtotalscoreMale/,
    );
  });

  it("throws a message naming the column when a value is not numeric", () => {
    const row = pairedRow({ FruitHEIFAscoreFemale: "n/a" });

    expect(() => resolveHeifaScoresFromCsvRow(row, "female")).toThrowError(
      /FruitHEIFAscoreFemale/,
    );
  });

  it("reads the opposite sex's column only when asked to", () => {
    // Guards against an off-by-one in the column map: a male row must not be
    // able to read a female value by accident.
    const row = pairedRow({ HEIFAtotalscoreMale: "10", HEIFAtotalscoreFemale: "20" });

    expect(resolveHeifaScoresFromCsvRow(row, "male").total).toBe(10);
    expect(resolveHeifaScoresFromCsvRow(row, "female").total).toBe(20);
  });
});

describe("HEIFA maxima", () => {
  it("excludes the aggregate total from the component list", () => {
    expect(HEIFA_COMPONENT_CATEGORIES).not.toContain("total");
  });

  it("includes saturated fat, which the Android Insights screen omitted", () => {
    expect(HEIFA_COMPONENT_CATEGORIES).toContain("saturatedFat");
  });

  it("has a maximum for every component and no extras", () => {
    expect(Object.keys(HEIFA_CATEGORY_MAX).sort()).toEqual(
      [...HEIFA_COMPONENT_CATEGORIES].sort(),
    );
  });

  it("has component maxima summing to the total maximum", () => {
    // If this fails, the dashboard progress bars no longer add up to 100%.
    const sum = HEIFA_COMPONENT_CATEGORIES.reduce(
      (acc, category) => acc + HEIFA_CATEGORY_MAX[category],
      0,
    );

    expect(sum).toBe(HEIFA_TOTAL_MAX);
  });
});
