import { getSql } from "./client";

let _snapshotsReady = false;
async function ensureSnapshotsTable(): Promise<void> {
  if (_snapshotsReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS code_snapshots (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slug       TEXT NOT NULL,
      step_index INTEGER NOT NULL,
      code       TEXT NOT NULL,
      saved_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_snapshots_user_slug ON code_snapshots(user_id, slug, step_index, saved_at DESC)`;
  _snapshotsReady = true;
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
  code: string
): Promise<void> {
  await ensureSnapshotsTable();
  const sql = getSql();
  await sql`
    INSERT INTO code_snapshots (user_id, slug, step_index, code)
    VALUES (${userId}, ${slug}, ${stepIndex}, ${code})
  `;
  // Keep only 5 most recent per (user, slug, stepIndex)
  await sql`
    DELETE FROM code_snapshots
    WHERE id IN (
      SELECT id FROM code_snapshots
      WHERE user_id = ${userId} AND slug = ${slug} AND step_index = ${stepIndex}
      ORDER BY saved_at DESC
      OFFSET 5
    )
  `;
}

export async function getSnapshots(
  userId: number,
  slug: string,
  stepIndex: number
): Promise<CodeSnapshot[]> {
  await ensureSnapshotsTable();
  const sql = getSql();
  const rows = await sql`
    SELECT id, code, saved_at
    FROM code_snapshots
    WHERE user_id = ${userId} AND slug = ${slug} AND step_index = ${stepIndex}
    ORDER BY saved_at DESC
    LIMIT 5
  `;
  return rows as CodeSnapshot[];
}
