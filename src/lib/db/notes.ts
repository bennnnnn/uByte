import { getSql } from "./client";

async function ensureNotesTable(): Promise<void> {
  /* schema via npm run migrate */
}

export async function getStepNote(
  userId: number,
  slug: string,
  stepIndex: number
): Promise<string> {
  await ensureNotesTable();
  const sql = getSql();
  const [row] = await sql`
    SELECT note FROM step_notes
    WHERE user_id = ${userId} AND tutorial_slug = ${slug} AND step_index = ${stepIndex}
  `;
  return (row?.note as string) ?? "";
}

export async function upsertStepNote(
  userId: number,
  slug: string,
  stepIndex: number,
  note: string
): Promise<void> {
  await ensureNotesTable();
  const sql = getSql();
  await sql`
    INSERT INTO step_notes (user_id, tutorial_slug, step_index, note, updated_at)
    VALUES (${userId}, ${slug}, ${stepIndex}, ${note}, NOW())
    ON CONFLICT (user_id, tutorial_slug, step_index)
    DO UPDATE SET note = EXCLUDED.note, updated_at = NOW()
  `;
}
