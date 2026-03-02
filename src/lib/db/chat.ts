import { getSql } from "./client";
import type { TutorialMessage } from "./types";

let _chatReady = false;
async function ensureChatTable(): Promise<void> {
  if (_chatReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS tutorial_messages (
      id            SERIAL PRIMARY KEY,
      tutorial_slug TEXT NOT NULL,
      user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
      user_name     TEXT NOT NULL,
      is_ai         BOOLEAN NOT NULL DEFAULT FALSE,
      content       TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_tutorial_messages_slug ON tutorial_messages(tutorial_slug, created_at)`;
  _chatReady = true;
}

export async function getChatMessages(tutorialSlug: string, limit = 50): Promise<TutorialMessage[]> {
  await ensureChatTable();
  const sql = getSql();
  const rows = await sql`
    SELECT id, tutorial_slug, user_id, user_name, is_ai, content, created_at
    FROM tutorial_messages
    WHERE tutorial_slug = ${tutorialSlug}
    ORDER BY created_at ASC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({ ...r, is_ai: !!r.is_ai })) as TutorialMessage[];
}

export async function getChatParticipants(
  tutorialSlug: string,
  excludeUserId: number
): Promise<number[]> {
  await ensureChatTable();
  const sql = getSql();
  const rows = await sql`
    SELECT DISTINCT user_id FROM tutorial_messages
    WHERE tutorial_slug = ${tutorialSlug}
      AND user_id IS NOT NULL
      AND user_id != ${excludeUserId}
      AND is_ai = FALSE
  `;
  return rows.map((r) => r.user_id as number);
}

export async function saveChatMessage(
  tutorialSlug: string,
  userId: number | null,
  userName: string,
  content: string,
  isAi: boolean
): Promise<TutorialMessage> {
  await ensureChatTable();
  const sql = getSql();
  const [row] = await sql`
    INSERT INTO tutorial_messages (tutorial_slug, user_id, user_name, is_ai, content)
    VALUES (${tutorialSlug}, ${userId}, ${userName}, ${isAi}, ${content})
    RETURNING *
  `;
  return { ...row, is_ai: !!row.is_ai } as TutorialMessage;
}
