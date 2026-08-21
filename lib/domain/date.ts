/**
 * Local-calendar date helpers.
 *
 * Pure domain module. Everything here works from a Date's *local* components,
 * never its UTC ones.
 *
 * This exists because of a concrete bug: `toISOString().slice(0, 10)` returns
 * the UTC day, which is the previous calendar day for early-morning times in
 * any timezone ahead of UTC (and the next one for late times behind it). A
 * seven-day chart built that way silently drops or misfiles a day's records.
 * `nutrition_records.consumed_on` is written using these functions.
 */

/** A calendar day as `YYYY-MM-DD`, taken from the date's local components. */
export function toLocalDateString(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** A new Date offset by whole days. Does not mutate the input. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);

  return result;
}

/**
 * The `count` calendar days ending on `endDate`, inclusive, ascending.
 *
 * Used by the seven-day analytics to build the full day axis, so days with no
 * records still appear rather than being omitted.
 */
export function lastNLocalDays(endDate: Date, count: number): string[] {
  const days: string[] = [];

  for (let offset = count - 1; offset >= 0; offset--) {
    days.push(toLocalDateString(addDays(endDate, -offset)));
  }

  return days;
}
