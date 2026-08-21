/**
 * Applies pending SQL migrations in filename order.
 *
 * Forward-only: a mistake is corrected by adding a new migration, never by
 * editing one that has already been applied. Applied filenames are recorded in
 * `schema_migrations`, so re-running is a no-op.
 *
 * Deliberately not a migration framework — it is ~40 lines over plain .sql
 * files that can also be run by hand with a mysql client.
 */
import { readdir } from "node:fs/promises";
import path from "node:path";

import type { RowDataPacket } from "mysql2";

import { connect, PROJECT_ROOT, runSqlFile } from "./db-utils";

const MIGRATIONS_DIR = path.join(PROJECT_ROOT, "db", "migrations");

interface MigrationRow extends RowDataPacket {
  filename: string;
}

const CREATE_TRACKING_TABLE = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename    VARCHAR(255) NOT NULL,
    applied_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (filename)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
`;

async function main(): Promise<void> {
  const connection = await connect();

  try {
    await connection.query(CREATE_TRACKING_TABLE);

    const [appliedRows] = await connection.query<MigrationRow[]>(
      "SELECT filename FROM schema_migrations",
    );
    const applied = new Set(appliedRows.map((row) => row.filename));

    const files = (await readdir(MIGRATIONS_DIR))
      .filter((name) => name.endsWith(".sql"))
      .sort();

    let count = 0;

    for (const filename of files) {
      if (applied.has(filename)) {
        console.log(`  skip    ${filename}`);
        continue;
      }

      await runSqlFile(connection, path.join(MIGRATIONS_DIR, filename));
      await connection.execute(
        "INSERT INTO schema_migrations (filename) VALUES (?)",
        [filename],
      );

      console.log(`  applied ${filename}`);
      count += 1;
    }

    console.log(
      count === 0
        ? "Database already up to date."
        : `Applied ${count} migration(s).`,
    );
  } finally {
    await connection.end();
  }
}


main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
