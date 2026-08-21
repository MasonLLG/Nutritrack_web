/**
 * One-off developer script: db/source/data.csv -> committed .sql seed files.
 *
 * Generates db/seeds/001_users.sql and db/seeds/002_heifa.sql. The deployed
 * application never parses CSV — it only ever reads the generated SQL, which is
 * why csv-parse is a devDependency.
 *
 * Run with:  npm run heifa:import
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { parse } from "csv-parse/sync";

import {
  HEIFA_CATEGORIES,
  parseSex,
  resolveHeifaScoresFromCsvRow,
  type Sex,
} from "@/lib/domain/heifa";

import { PROJECT_ROOT } from "./db-utils";

const SOURCE_CSV = path.join(PROJECT_ROOT, "db", "source", "data.csv");
const SEEDS_DIR = path.join(PROJECT_ROOT, "db", "seeds");

/** Score category -> database column in heifa_assessments. */
const SCORE_COLUMNS: Record<(typeof HEIFA_CATEGORIES)[number], string> = {
  total: "total_score",
  discretionary: "discretionary_score",
  vegetables: "vegetables_score",
  fruit: "fruit_score",
  grainsAndCereals: "grains_cereals_score",
  wholegrains: "wholegrains_score",
  meatAndAlternatives: "meat_alternatives_score",
  dairyAndAlternatives: "dairy_alternatives_score",
  water: "water_score",
  unsaturatedFat: "unsaturated_fat_score",
  saturatedFat: "saturated_fat_score",
  sodium: "sodium_score",
  sugar: "sugar_score",
  alcohol: "alcohol_score",
};

/** Database column -> CSV column, for the non-sex-dependent context values. */
const CONTEXT_COLUMNS: Record<string, string> = {
  discretionary_serve_size: "Discretionaryservesize",
  vegetables_serve_size: "Vegetableswithlegumesallocatedservesize",
  fruit_serve_size: "Fruitservesize",
  grains_cereals_serve_size: "Grainsandcerealsservesize",
  wholegrains_serve_size: "Wholegrainsservesize",
  meat_alternatives_serve_size:
    "Meatandalternativeswithlegumesallocatedservesize",
  dairy_alternatives_serve_size: "Dairyandalternativesservesize",
  sodium_mg: "Sodiummgmilligrams",
  alcohol_standard_drinks: "Alcoholstandarddrinks",
  water_total_ml: "WaterTotalmL",
  sugar_grams: "Sugar",
  saturated_fat_grams: "SaturatedFat",
};

/** Single-quote a string for SQL. The inputs are numeric/alphanumeric CSV
 *  fields, but escaping is applied regardless rather than assumed. */
function quote(value: string): string {
  const escaped = value
    .split("\\")
    .join("\\\\")
    .split("'")
    .join("''");

  return `'${escaped}'`;
}

function numberOrNull(raw: string | undefined): string {
  if (raw === undefined || raw.trim() === "") return "NULL";

  const value = Number(raw);
  return Number.isFinite(value) ? String(value) : "NULL";
}

function header(sourceFile: string): string {
  return [
    "-- GENERATED FILE - do not edit by hand.",
    `-- Produced by scripts/import-heifa.ts from db/source/${sourceFile}.`,
    "-- Regenerate with: npm run heifa:import",
    "",
  ].join("\n");
}

async function main(): Promise<void> {
  const csv = await readFile(SOURCE_CSV, "utf8");
  const rows = parse(csv, {
    columns: true,
    skipEmptyLines: true,
    trim: true,
  }) as Record<string, string>[];

  if (rows.length === 0) {
    throw new Error(`No data rows found in ${SOURCE_CSV}`);
  }

  const userStatements: string[] = [];
  const heifaStatements: string[] = [];

  for (const [index, row] of rows.entries()) {
    const lineNumber = index + 2; // +1 for the header, +1 for 1-based lines
    const uid = row.User_ID?.trim();
    const phone = row.PhoneNumber?.trim();
    const rawSex = row.Sex ?? "";

    if (!uid) throw new Error(`Row ${lineNumber}: missing User_ID`);
    if (!phone) throw new Error(`Row ${lineNumber}: missing PhoneNumber`);

    const sex: Sex | null = parseSex(rawSex);

    if (sex === null) {
      // Fail loudly rather than defaulting, which is what the Android app did.
      throw new Error(
        `Row ${lineNumber} (User_ID ${uid}): unrecognised Sex "${rawSex}". ` +
          `Expected "Male" or "Female".`,
      );
    }

    // The source CSV has no name field; derive a stable display name.
    const username = `User ${uid}`;

    userStatements.push(
      [
        "INSERT INTO users (uid, username, sex, phone_number) VALUES",
        `  (${quote(uid)}, ${quote(username)}, ${quote(sex)}, ${quote(phone)})`,
        "ON DUPLICATE KEY UPDATE",
        `  username = ${quote(username)},`,
        `  sex = ${quote(sex)},`,
        `  phone_number = ${quote(phone)};`,
      ].join("\n"),
    );

    const scores = resolveHeifaScoresFromCsvRow(row, sex);

    const columns: string[] = [];
    const values: string[] = [];

    for (const category of HEIFA_CATEGORIES) {
      columns.push(SCORE_COLUMNS[category]);
      values.push(String(scores[category]));
    }

    for (const [dbColumn, csvColumn] of Object.entries(CONTEXT_COLUMNS)) {
      columns.push(dbColumn);
      values.push(numberOrNull(row[csvColumn]));
    }

    const updates = columns
      .map((column, i) => `  ${column} = ${values[i]}`)
      .join(",\n");

    heifaStatements.push(
      [
        `INSERT INTO heifa_assessments (user_id, ${columns.join(", ")})`,
        `SELECT id, ${values.join(", ")}`,
        `FROM users WHERE uid = ${quote(uid)}`,
        "ON DUPLICATE KEY UPDATE",
        `${updates};`,
      ].join("\n"),
    );
  }

  const sourceFile = path.basename(SOURCE_CSV);

  await writeFile(
    path.join(SEEDS_DIR, "001_users.sql"),
    header(sourceFile) + userStatements.join("\n\n") + "\n",
    "utf8",
  );

  await writeFile(
    path.join(SEEDS_DIR, "002_heifa.sql"),
    header(sourceFile) + heifaStatements.join("\n\n") + "\n",
    "utf8",
  );

  const maleCount = rows.filter((r) => parseSex(r.Sex ?? "") === "male").length;

  console.log(`Read ${rows.length} row(s) from db/source/${sourceFile}`);
  console.log(`  male: ${maleCount}, female: ${rows.length - maleCount}`);
  console.log("Wrote db/seeds/001_users.sql");
  console.log("Wrote db/seeds/002_heifa.sql");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
