import { getSql } from "./client";

const TABLE_MISSING = "42P01"; // PostgreSQL: relation does not exist

async function ensureSubmissionsTable(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id                 SERIAL PRIMARY KEY,
      user_id            INTEGER REFERENCES users(id) ON DELETE SET NULL,
      problem_id         TEXT NOT NULL,
      language           TEXT NOT NULL,
      code               TEXT NOT NULL,
      code_hash          TEXT NOT NULL,
      verdict            TEXT NOT NULL,
      judge0_token       TEXT,
      compile_output     TEXT,
      runtime_output     TEXT,
      runtime_error      TEXT,
      time_ms            INTEGER,
      memory_kb          INTEGER,
      failed_test_index  INTEGER,
      failed_input       TEXT,
      failed_expected    TEXT,
      failed_actual      TEXT,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_submissions_user_problem
    ON submissions(user_id, problem_id, created_at DESC)
  `;
}

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
  async function doInsert() {
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
  try {
    return await doInsert();
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === TABLE_MISSING) {
      await ensureSubmissionsTable();
      return await doInsert();
    }
    throw err;
  }
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
  try {
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
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === TABLE_MISSING) {
      await ensureSubmissionsTable();
      return 0; // no previous submissions if table just created
    }
    throw err;
  }
}
