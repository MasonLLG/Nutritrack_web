/** Food-log queries. */
import type { ResultSetHeader } from "mysql2";

import { getPool } from "@/lib/db/pool";
import { toNutritionRecord, type NutritionRecordRow } from "@/lib/db/rows";
import type { NewNutritionRecord, NutritionRecord } from "@/lib/types";

const SELECT_COLUMNS = `
  id, user_id, food_name, heifa_category, serving_qty, serving_unit,
  calories, protein_g, carbs_g, fat_g, sugar_g,
  source, fruityvice_id, consumed_at, consumed_on
`;

export async function insert(record: NewNutritionRecord): Promise<number> {
  const [result] = await getPool().execute<ResultSetHeader>(
    `INSERT INTO nutrition_records
       (user_id, food_name, heifa_category, serving_qty, serving_unit,
        calories, protein_g, carbs_g, fat_g, sugar_g,
        source, fruityvice_id, consumed_at, consumed_on)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.userId,
      record.foodName,
      record.heifaCategory,
      record.servingQty,
      record.servingUnit,
      record.calories,
      record.proteinG,
      record.carbsG,
      record.fatG,
      record.sugarG,
      record.source,
      record.fruityviceId,
      record.consumedAt,
      record.consumedOn,
    ],
  );

  return result.insertId;
}

export async function listByUser(
  userId: number,
  limit = 100,
): Promise<NutritionRecord[]> {
  // LIMIT is passed as a bound parameter rather than interpolated. It is
  // clamped first so a caller cannot request an unbounded result set.
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 500);

  const [rows] = await getPool().execute<NutritionRecordRow[]>(
    `SELECT ${SELECT_COLUMNS}
       FROM nutrition_records
      WHERE user_id = ?
      ORDER BY consumed_at DESC
      LIMIT ?`,
    [userId, safeLimit],
  );

  return rows.map(toNutritionRecord);
}

/**
 * Records within an inclusive calendar-day range.
 *
 * Filters on `consumed_on` rather than `consumed_at` so the query uses the
 * (user_id, consumed_on) index and matches the day bucketing the analytics
 * service performs. Dates are 'YYYY-MM-DD' strings.
 */
export async function listInDateRange(
  userId: number,
  startDate: string,
  endDate: string,
): Promise<NutritionRecord[]> {
  const [rows] = await getPool().execute<NutritionRecordRow[]>(
    `SELECT ${SELECT_COLUMNS}
       FROM nutrition_records
      WHERE user_id = ?
        AND consumed_on BETWEEN ? AND ?
      ORDER BY consumed_at ASC`,
    [userId, startDate, endDate],
  );

  return rows.map(toNutritionRecord);
}
