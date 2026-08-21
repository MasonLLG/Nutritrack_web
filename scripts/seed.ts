/**
 * Runs the seed files in db/seeds in filename order.
 *
 * Seeds must be idempotent (INSERT ... ON DUPLICATE KEY UPDATE, or a delete
 * scoped to the seeded rows) so re-running is safe.
 */
import { readdir } from "node:fs/promises";
import path from "node:path";

import { connect, PROJECT_ROOT, runSqlFile } from "./db-utils";

const SEEDS_DIR = path.join(PROJECT_ROOT, "db", "seeds");

async function main(): Promise<void> {
  const connection = await connect();

  try {
    const files = (await readdir(SEEDS_DIR))
      .filter((name) => name.endsWith(".sql"))
      .sort();

    for (const filename of files) {
      await runSqlFile(connection, path.join(SEEDS_DIR, filename));
      console.log(`  seeded  ${filename}`);
    }

    console.log(`Ran ${files.length} seed file(s).`);
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
