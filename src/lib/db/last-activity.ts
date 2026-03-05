import { getSql } from "./client";

export type LastActivityType = "tutorial" | "practice";

export interface LastActivity {
  user_id: number;
  activity_type: LastActivityType;
  lang: string;
  slug: string | null;
  step: number | null;
  updated_at: string;
}

export async function ensureLastActivityTable(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS user_last_activity (
      user_id       INTEGER      PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      activity_type TEXT         NOT NULL CHECK (activity_type IN ('tutorial', 'practice')),
      lang          TEXT         NOT NULL,
      slug          TEXT,
      step          INTEGER,
      updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `;
}

export interface SaveLastActivityInput {
  type: LastActivityType;
  lang: string;
  slug?: string | null;
  step?: number | null;
}

export async function saveLastActivity(userId: number, input: SaveLastActivityInput): Promise<void> {
  await ensureLastActivityTable();
  const sql = getSql();
  await sql`
    INSERT INTO user_last_activity (user_id, activity_type, lang, slug, step, updated_at)
    VALUES (${userId}, ${input.type}, ${input.lang}, ${input.slug ?? null}, ${input.step ?? null}, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      activity_type = EXCLUDED.activity_type,
      lang = EXCLUDED.lang,
      slug = EXCLUDED.slug,
      step = EXCLUDED.step,
      updated_at = NOW()
  `;
}

export async function getLastActivity(userId: number): Promise<LastActivity | null> {
  await ensureLastActivityTable();
  const sql = getSql();
  const [row] = await sql`
    SELECT user_id, activity_type, lang, slug, step, updated_at
    FROM user_last_activity
    WHERE user_id = ${userId}
  `;
  if (!row) return null;
  return row as LastActivity;
}
