import { describe, expect, it } from "vitest";

import { addDays, lastNLocalDays, toLocalDateString } from "./date";

// Every Date below is built from *local* components, so these assertions hold
// in any machine timezone.
describe("toLocalDateString", () => {
  it("formats as YYYY-MM-DD", () => {
    expect(toLocalDateString(new Date(2026, 7, 21, 14, 30))).toBe("2026-08-21");
  });

  it("zero-pads month and day", () => {
    expect(toLocalDateString(new Date(2026, 0, 5, 12, 0))).toBe("2026-01-05");
  });

  it("keeps 00:10 on its own local day", () => {
    // The bug this function exists to prevent: toISOString() would report the
    // previous day for early-morning times in any timezone ahead of UTC.
    expect(toLocalDateString(new Date(2026, 0, 5, 0, 10))).toBe("2026-01-05");
  });

  it("keeps 23:59 on its own local day", () => {
    // ...and the following day for late times in any timezone behind UTC.
    expect(toLocalDateString(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("gives the same day for both ends of one local day", () => {
    const start = new Date(2026, 5, 30, 0, 0, 0);
    const end = new Date(2026, 5, 30, 23, 59, 59);

    expect(toLocalDateString(start)).toBe(toLocalDateString(end));
  });

  it("never agrees with a UTC-based implementation when the two differ", () => {
    const date = new Date(2026, 0, 5, 0, 10);
    const utcBased = date.toISOString().slice(0, 10);

    // In UTC the two agree; anywhere else at this time of day they must not,
    // and the local answer is the correct one.
    if (date.getTimezoneOffset() !== 0) {
      expect(toLocalDateString(date)).not.toBe(utcBased);
    }
    expect(toLocalDateString(date)).toBe("2026-01-05");
  });
});

describe("addDays", () => {
  it("advances by whole days", () => {
    expect(toLocalDateString(addDays(new Date(2026, 7, 21), 3))).toBe(
      "2026-08-24",
    );
  });

  it("goes backwards for a negative offset", () => {
    expect(toLocalDateString(addDays(new Date(2026, 7, 21), -6))).toBe(
      "2026-08-15",
    );
  });

  it("crosses month boundaries", () => {
    expect(toLocalDateString(addDays(new Date(2026, 7, 31), 1))).toBe(
      "2026-09-01",
    );
  });

  it("crosses year boundaries", () => {
    expect(toLocalDateString(addDays(new Date(2026, 11, 31), 1))).toBe(
      "2027-01-01",
    );
  });

  it("handles a leap day", () => {
    expect(toLocalDateString(addDays(new Date(2028, 1, 28), 1))).toBe(
      "2028-02-29",
    );
  });

  it("does not mutate its argument", () => {
    const original = new Date(2026, 7, 21);
    addDays(original, 5);

    expect(toLocalDateString(original)).toBe("2026-08-21");
  });
});

describe("lastNLocalDays", () => {
  it("returns exactly n days", () => {
    expect(lastNLocalDays(new Date(2026, 7, 21), 7)).toHaveLength(7);
  });

  it("ends on the given day and is ascending", () => {
    expect(lastNLocalDays(new Date(2026, 7, 21), 7)).toEqual([
      "2026-08-15",
      "2026-08-16",
      "2026-08-17",
      "2026-08-18",
      "2026-08-19",
      "2026-08-20",
      "2026-08-21",
    ]);
  });

  it("includes the end day itself even for n = 1", () => {
    expect(lastNLocalDays(new Date(2026, 7, 21), 1)).toEqual(["2026-08-21"]);
  });

  it("spans a month boundary correctly", () => {
    expect(lastNLocalDays(new Date(2026, 8, 2), 4)).toEqual([
      "2026-08-30",
      "2026-08-31",
      "2026-09-01",
      "2026-09-02",
    ]);
  });

  it("returns an empty list for n = 0", () => {
    expect(lastNLocalDays(new Date(2026, 7, 21), 0)).toEqual([]);
  });
});
