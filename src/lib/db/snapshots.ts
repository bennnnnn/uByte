import { getSql } from "./client";

const DEFAULT_LANG = "go";

async function ensureSnapshotsTable(): Promise<void> {
  /* schema via npm run migrate */
}

export interface CodeSnapshot {
  id: number;
  code: string;
  saved_at: string;
}

export async function saveSnapshot(
  userId: number,
  slug: string,
  stepIndex: number,
  code: string,
  language: string = DEFAULT_LANG
): Promise<void> {
  await ensureSnapshotsTable();
  const sql = getSql();
  await sql`
    INSERT INTO code_snapshots (user_id, language, slug, step_index, code)
    VALUES (${userId}, ${language}, ${slug}, ${stepIndex}, ${code})
  `;
  await sql`
    DELETE FROM code_snapshots
    WHERE id IN (
      SELECT id FROM code_snapshots
      WHERE user_id = ${userId} AND slug = ${slug} AND step_index = ${stepIndex}
        AND (language = ${language} OR language IS NULL)
      ORDER BY saved_at DESC
      OFFSET 5
    )
  `;
}

export async function getSnapshots(
  userId: number,
  slug: string,
  stepIndex: number,
  language: string = DEFAULT_LANG
): Promise<CodeSnapshot[]> {
  await ensureSnapshotsTable();
  const sql = getSql();
  const rows = await sql`
    SELECT id, code, saved_at
    FROM code_snapshots
    WHERE user_id = ${userId} AND slug = ${slug} AND step_index = ${stepIndex}
      AND (language = ${language} OR language IS NULL)
    ORDER BY saved_at DESC
    LIMIT 5
  `;
  return rows as CodeSnapshot[];
}
