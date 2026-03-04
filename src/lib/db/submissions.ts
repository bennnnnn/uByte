import { getSql } from "./client";

export type SubmissionVerdict =
  | "accepted"
  | "wrong_answer"
  | "compile_error"
  | "runtime_error"
  | "tle"
  | "error";

export interface SubmissionRow {
  id: number;
  user_id: number | null;
  problem_id: string;
  language: string;
  code: string;
  code_hash: string;
  verdict: SubmissionVerdict;
  judge0_token: string | null;
  compile_output: string | null;
  runtime_output: string | null;
  runtime_error: string | null;
  time_ms: number | null;
  memory_kb: number | null;
  failed_test_index: number | null;
  failed_input: string | null;
  failed_expected: string | null;
  failed_actual: string | null;
  created_at: string;
}

export interface InsertSubmissionParams {
  userId: number | null;
  problemId: string;
  language: string;
  code: string;
  codeHash: string;
  verdict: SubmissionVerdict;
  judge0Token?: string | null;
  compileOutput?: string | null;
  runtimeOutput?: string | null;
  runtimeError?: string | null;
  timeMs?: number | null;
  memoryKb?: number | null;
  failedTestIndex?: number | null;
  failedInput?: string | null;
  failedExpected?: string | null;
  failedActual?: string | null;
}

export async function insertSubmission(p: InsertSubmissionParams): Promise<number> {
  const sql = getSql();
  const [row] = await sql`
    INSERT INTO submissions (
      user_id, problem_id, language, code, code_hash, verdict,
      judge0_token, compile_output, runtime_output, runtime_error,
      time_ms, memory_kb, failed_test_index, failed_input, failed_expected, failed_actual
    )
    VALUES (
      ${p.userId}, ${p.problemId}, ${p.language}, ${p.code}, ${p.codeHash}, ${p.verdict},
      ${p.judge0Token ?? null}, ${p.compileOutput ?? null}, ${p.runtimeOutput ?? null}, ${p.runtimeError ?? null},
      ${p.timeMs ?? null}, ${p.memoryKb ?? null}, ${p.failedTestIndex ?? null},
      ${p.failedInput ?? null}, ${p.failedExpected ?? null}, ${p.failedActual ?? null}
    )
    RETURNING id
  `;
  return (row?.id as number) ?? 0;
}

export async function getSubmissionById(id: number): Promise<SubmissionRow | null> {
  const sql = getSql();
  const [row] = await sql`
    SELECT id, user_id, problem_id, language, code, code_hash, verdict,
           judge0_token, compile_output, runtime_output, runtime_error,
           time_ms, memory_kb, failed_test_index, failed_input, failed_expected, failed_actual,
           created_at
    FROM submissions WHERE id = ${id}
  `;
  return (row as SubmissionRow | undefined) ?? null;
}

/** Count consecutive failures by same user on same problem (for auto-hint after 2 fails). */
export async function getConsecutiveFailures(
  userId: number,
  problemId: string
): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT verdict FROM submissions
    WHERE user_id = ${userId} AND problem_id = ${problemId}
    ORDER BY created_at DESC
    LIMIT 10
  `;
  let count = 0;
  for (const r of rows) {
    const v = r.verdict as string;
    if (v === "accepted") break;
    if (["wrong_answer", "compile_error", "runtime_error", "tle"].includes(v)) count++;
  }
  return count;
}
