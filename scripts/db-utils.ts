import { readFile } from "node:fs/promises";
import path from "node:path";

import mysql from "mysql2/promise";

import { env } from "@/lib/env";

export const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");

/**
 * A dedicated connection for scripts, separate from the application pool.
 *
 * `multipleStatements` is enabled so a whole .sql file can be sent as one
 * statement batch. That is safe here because the only input is a file we wrote
 * and committed — never user input. The application pool leaves it off.
 */
export async function connect(): Promise<mysql.Connection> {
  const url = env.DATABASE_URL;

  if (url === undefined) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and set a MySQL " +
        "connection string before running database scripts.",
    );
  }

  return mysql.createConnection({ uri: url, multipleStatements: true });
}

export async function runSqlFile(
  connection: mysql.Connection,
  absolutePath: string,
): Promise<void> {
  const sql = await readFile(absolutePath, "utf8");

  if (sql.trim() === "") return;

  await connection.query(sql);
}
