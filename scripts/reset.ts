/**
 * Drops every application table and re-applies migrations from scratch.
 *
 * Development convenience only. Refuses to run against NODE_ENV=production.
 */
import { connect } from "./db-utils";
import { env } from "@/lib/env";

// Order matters: children before parents, since foreign keys are enforced.
const TABLES = [
  "nutrition_records",
  "heifa_assessments",
  "users",
  "schema_migrations",
];

async function main(): Promise<void> {
  if (env.NODE_ENV === "production") {
    throw new Error("db:reset refuses to run with NODE_ENV=production");
  }

  const connection = await connect();

  try {
    for (const table of TABLES) {
      await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
      console.log(`  dropped ${table}`);
    }
  } finally {
    await connection.end();
  }

  console.log("Reset complete. Run: npm run db:migrate && npm run db:seed");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
