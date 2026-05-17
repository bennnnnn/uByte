import { getSql } from "./client";

const TABLE_MISSING = "42P01";

async function ensureAiFeedbackTable(): Promise<void> {
  /* schema via npm run migrate */
}

export interface AiFeedbackCacheKey {
  problemId: string;
  language: string;
  codeHash: string;
  verdict: string;
  failureSignature: string;
  hintLevel: number;
  modelName: string;
}

export async function getCachedAiResponse(key: AiFeedbackCacheKey): Promise<Record<string, unknown> | null> {
  const sql = getSql();
  try {
    const [row] = await sql`
      SELECT response_json FROM ai_feedback_responses
      WHERE problem_id = ${key.problemId}
        AND language = ${key.language}
        AND code_hash = ${key.codeHash}
        AND verdict = ${key.verdict}
        AND failure_signature = ${key.failureSignature}
        AND hint_level = ${key.hintLevel}
        AND model_name = ${key.modelName}
    `;
    if (!row?.response_json) return null;
    const cached = row.response_json as Record<string, unknown>;
    // Skip cached error fallbacks — they were stored when AI was misconfigured.
    if (cached.root_cause === "ai_unavailable" || cached.root_cause === "no_ai_config" || cached.confidence === 0) {
      return null;
    }
    return cached;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === TABLE_MISSING) {
      await ensureAiFeedbackTable();
      return null;
    }
    throw err;
  }
}

export async function setCachedAiResponse(key: AiFeedbackCacheKey, responseJson: Record<string, unknown>): Promise<void> {
  const sql = getSql();
  async function doInsert() {
    await sql`
      INSERT INTO ai_feedback_responses (problem_id, language, code_hash, verdict, failure_signature, hint_level, model_name, response_json)
      VALUES (
        ${key.problemId}, ${key.language}, ${key.codeHash}, ${key.verdict},
        ${key.failureSignature}, ${key.hintLevel}, ${key.modelName},
        ${JSON.stringify(responseJson)}::jsonb
      )
      ON CONFLICT (problem_id, language, code_hash, verdict, failure_signature, hint_level, model_name)
      DO UPDATE SET response_json = EXCLUDED.response_json, created_at = NOW()
    `;
  }
  try {
    await doInsert();
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === TABLE_MISSING) {
      await ensureAiFeedbackTable();
      await doInsert();
      return;
    }
    throw err;
  }
}
