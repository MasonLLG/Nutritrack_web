/** HEIFA assessment queries. Read-only: the table is populated by seed only. */
import { getPool } from "@/lib/db/pool";
import { toHeifaAssessment, type HeifaAssessmentRow } from "@/lib/db/rows";
import type { HeifaAssessment } from "@/lib/types";

export async function findByUserId(
  userId: number,
): Promise<HeifaAssessment | null> {
  const [rows] = await getPool().execute<HeifaAssessmentRow[]>(
    "SELECT * FROM heifa_assessments WHERE user_id = ? LIMIT 1",
    [userId],
  );

  const row = rows[0];
  return row === undefined ? null : toHeifaAssessment(row);
}
