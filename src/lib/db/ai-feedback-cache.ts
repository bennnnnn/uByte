import { getSql } from "./client";

const CACHE_TTL_DAYS = 30;

async function ensureTable(): Promise<void> {
  /* schema via npm run migrate */
}

export async function getCachedFeedback(cacheKey: string): Promise<string | null> {
  await ensureTable();
  const sql = getSql();
  const [row] = await sql`
    SELECT feedback FROM ai_feedback_cache
    WHERE cache_key = ${cacheKey}
      AND created_at > NOW() - INTERVAL '1 day' * ${CACHE_TTL_DAYS}
  `;
  return (row?.feedback as string) ?? null;
}

export async function setCachedFeedback(cacheKey: string, feedback: string): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO ai_feedback_cache (cache_key, feedback)
    VALUES (${cacheKey}, ${feedback})
    ON CONFLICT (cache_key) DO UPDATE SET feedback = EXCLUDED.feedback, created_at = NOW()
  `;
}

/** Prune entries older than TTL to save space. Call from cron or periodically. */
export async function pruneExpiredCache(): Promise<number> {
  await ensureTable();
  const sql = getSql();
  const [row] = await sql`
    WITH deleted AS (
      DELETE FROM ai_feedback_cache WHERE created_at < NOW() - INTERVAL '1 day' * ${CACHE_TTL_DAYS}
      RETURNING 1
    )
    SELECT COUNT(*)::int AS n FROM deleted
  `;
  return (row?.n as number) ?? 0;
}
