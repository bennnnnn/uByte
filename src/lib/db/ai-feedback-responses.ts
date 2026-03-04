import { getSql } from "./client";

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
  return row.response_json as Record<string, unknown>;
}

export async function setCachedAiResponse(key: AiFeedbackCacheKey, responseJson: Record<string, unknown>): Promise<void> {
  const sql = getSql();
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
