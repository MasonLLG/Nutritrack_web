/**
 * User queries. Every SQL statement in the application lives in a repository
 * like this one, and every one is parameterised with `?` placeholders.
 */
import { getPool } from "@/lib/db/pool";
import { SetupRequiredError } from "@/lib/domain/errors";
import { toUser, type UserRow } from "@/lib/db/rows";
import type { User } from "@/lib/types";

/**
 * The MVP has no authentication, so the application acts as one fixed user.
 * This is the `uid` from the ported Android dataset that the dashboard shows.
 * When auth arrives, the caller supplies a real user id and this goes away.
 */
export const IMPLICIT_USER_UID = "1";

const SELECT_COLUMNS = `
  id, uid, username, sex, phone_number,
  persona, meal_time, sleep_time, wake_time, food_preferences
`;

export async function findById(id: number): Promise<User | null> {
  const [rows] = await getPool().execute<UserRow[]>(
    `SELECT ${SELECT_COLUMNS} FROM users WHERE id = ? LIMIT 1`,
    [id],
  );

  const row = rows[0];
  return row === undefined ? null : toUser(row);
}

export async function findByUid(uid: string): Promise<User | null> {
  const [rows] = await getPool().execute<UserRow[]>(
    `SELECT ${SELECT_COLUMNS} FROM users WHERE uid = ? LIMIT 1`,
    [uid],
  );

  const row = rows[0];
  return row === undefined ? null : toUser(row);
}

export async function listAll(): Promise<User[]> {
  const [rows] = await getPool().execute<UserRow[]>(
    `SELECT ${SELECT_COLUMNS} FROM users ORDER BY CAST(uid AS UNSIGNED)`,
  );

  return rows.map(toUser);
}

/** The single user the MVP operates as. Throws if the seed has not been run. */
export async function getImplicitUser(): Promise<User> {
  const user = await findByUid(IMPLICIT_USER_UID);

  if (user === null) {
    // Expected on a fresh database: the UI renders setup instructions rather
    // than an error page.
    throw new SetupRequiredError(
      `No user with uid "${IMPLICIT_USER_UID}" exists yet.`,
      "npm run db:migrate && npm run db:seed",
    );
  }

  return user;
}
