import mysql from "mysql2/promise";

import { env } from "@/lib/env";

/**
 * The single mysql2 connection pool for the application.
 *
 * Cached on `globalThis` because Next.js re-evaluates modules on every hot
 * reload in development. Without the cache, each edit would create a new pool
 * and leak its connections until MySQL refuses new ones.
 */
const globalForPool = globalThis as typeof globalThis & {
  __nutritrackPool?: mysql.Pool;
};

function createPool(): mysql.Pool {
  const url = env.DATABASE_URL;

  if (url === undefined) {
    throw new Error(
      "DATABASE_URL is not set, so the database cannot be reached.\n" +
        "Copy .env.example to .env and set a MySQL connection string, e.g.\n" +
        '  DATABASE_URL="mysql://user:password@localhost:3306/nutritrack"',
    );
  }

  return mysql.createPool({
    uri: url,
    waitForConnections: true,
    connectionLimit: 10,
    // TIMEZONE MODEL: DATETIME columns hold the application's *local* wall
    // clock, and `consumed_on` holds the *local* calendar day. One reference
    // frame, so DATE(consumed_at) always equals consumed_on.
    //
    // An earlier version set `timezone: "Z"`, which made mysql2 convert Dates
    // to UTC on write while consumed_on was still derived from local
    // components. A record logged at 02:26 local was then stored as
    // "2026-08-20 16:26" with consumed_on "2026-08-21" — the two disagreed.
    // The default (local) is deliberate, not an omission.
    //
    // Trade-off: this assumes the app and database share a timezone, which is
    // true for this single-user setup. Supporting users across timezones would
    // mean storing a per-user zone and normalising at the edges.
    //
    // Return DECIMAL as a JS number rather than a string. Every DECIMAL column
    // in this schema is a nutrition value well inside float precision.
    decimalNumbers: true,
    // Return DATE columns as 'YYYY-MM-DD' strings. The default converts them to
    // a Date at *local* midnight, which shifts the calendar day in any timezone
    // behind UTC and would misfile records in the seven-day chart. DATETIME is
    // left as a Date; only the day bucket needs to be timezone-proof.
    dateStrings: ["DATE"],
  });
}

export function getPool(): mysql.Pool {
  const pool = globalForPool.__nutritrackPool ?? createPool();

  if (env.NODE_ENV !== "production") {
    globalForPool.__nutritrackPool = pool;
  }

  return pool;
}

/** Liveness check for the database. Used by `app/api/health`. */
export async function pingDatabase(): Promise<void> {
  const [rows] = await getPool().query("SELECT 1 AS ok");

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Database ping returned no rows");
  }
}
