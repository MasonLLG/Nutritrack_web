import { describe, expect, it } from "vitest";

import { scaleMacros, type Macros } from "./nutrition";

const per100g: Macros = {
  calories: 96,
  proteinG: 1,
  carbsG: 22,
  fatG: 0.2,
  sugarG: 17.2,
};

describe("scaleMacros", () => {
  it("returns the same values at the basis amount", () => {
    expect(scaleMacros(per100g, 100, 100)).toEqual(per100g);
  });

  it("halves at half the basis", () => {
    expect(scaleMacros(per100g, 50, 100)).toEqual({
      calories: 48,
      proteinG: 0.5,
      carbsG: 11,
      fatG: 0.1,
      sugarG: 8.6,
    });
  });

  it("doubles at twice the basis", () => {
    expect(scaleMacros(per100g, 200, 100)).toEqual({
      calories: 192,
      proteinG: 2,
      carbsG: 44,
      fatG: 0.4,
      sugarG: 34.4,
    });
  });

  it("rounds to two decimals rather than emitting float noise", () => {
    // 0.2 * 0.35 is 0.07000000000000001 in IEEE 754.
    expect(scaleMacros(per100g, 35, 100).fatG).toBe(0.07);
  });

  it("returns zeroes for a zero amount", () => {
    expect(scaleMacros(per100g, 0, 100)).toEqual({
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      sugarG: 0,
    });
  });

  it("never returns negative values for a negative amount", () => {
    const scaled = scaleMacros(per100g, -50, 100);

    for (const value of Object.values(scaled)) {
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });

  it("returns zeroes rather than dividing by zero when the basis is zero", () => {
    expect(scaleMacros(per100g, 50, 0)).toEqual({
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      sugarG: 0,
    });
  });

  it("does not mutate the input", () => {
    const input = { ...per100g };
    scaleMacros(input, 250, 100);

    expect(input).toEqual(per100g);
  });
});
