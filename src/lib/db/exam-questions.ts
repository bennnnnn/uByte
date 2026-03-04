import { getSql } from "./client";
import { isExamLang } from "@/lib/exams/config";

export interface ExamQuestionRow {
  id: number;
  lang: string;
  prompt: string;
  choices_json: string[];
  correct_index: number;
  explanation: string | null;
  created_at: string;
}

/** Get all question IDs for a language (for sampling 40). */
export async function getQuestionIdsByLang(lang: string): Promise<number[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id FROM exam_questions WHERE lang = ${lang}
  `;
  return (rows as { id: number }[]).map((r) => r.id);
}

/** Get questions by IDs; returns prompt + choices only (no correct_index or explanation). choicesOrder is optional per-question order. */
export async function getQuestionsByIds(
  ids: number[],
  choicesOrder?: number[][]
): Promise<{ id: number; prompt: string; choices: string[] }[]> {
  if (ids.length === 0) return [];
  const sql = getSql();
  const rows = await sql`
    SELECT id, prompt, choices_json FROM exam_questions WHERE id = ANY(${ids})
  `;
  const byId = new Map<number, { prompt: string; choices_json: string[] }>();
  for (const r of rows as { id: number; prompt: string; choices_json: string[] }[]) {
    byId.set(r.id, { prompt: r.prompt, choices_json: r.choices_json });
  }
  return ids.map((id, idx) => {
    const row = byId.get(id);
    if (!row) return { id, prompt: "", choices: [] };
    let choices = [...row.choices_json];
    const order = choicesOrder?.[idx];
    if (order && order.length === choices.length) {
      choices = order.map((i) => row.choices_json[i]);
    }
    return { id, prompt: row.prompt, choices };
  });
}

/** Get correct_index and explanation for grading (server-side only). */
export async function getCorrectAndExplanation(
  questionId: number
): Promise<{ correct_index: number; explanation: string | null } | null> {
  const sql = getSql();
  const [row] = await sql`
    SELECT correct_index, explanation FROM exam_questions WHERE id = ${questionId}
  `;
  return (row as { correct_index: number; explanation: string | null } | undefined) ?? null;
}

export interface ExamQuestionInsertRow {
  lang: string;
  prompt: string;
  choices: string[];
  correct_index: number;
  explanation?: string | null;
}

/** Bulk insert exam questions. Returns inserted count and per-row errors. */
export async function insertExamQuestions(
  rows: ExamQuestionInsertRow[]
): Promise<{ inserted: number; errors: string[] }> {
  const sql = getSql();
  const errors: string[] = [];
  let inserted = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!isExamLang(r.lang)) {
      errors.push(`Row ${i + 1}: invalid lang "${r.lang}"`);
      continue;
    }
    if (!r.prompt || typeof r.prompt !== "string") {
      errors.push(`Row ${i + 1}: prompt required`);
      continue;
    }
    if (!Array.isArray(r.choices) || r.choices.length < 2) {
      errors.push(`Row ${i + 1}: at least 2 choices required`);
      continue;
    }
    const ci = Number(r.correct_index);
    if (!Number.isInteger(ci) || ci < 0 || ci >= r.choices.length) {
      errors.push(`Row ${i + 1}: correct_index must be 0-${r.choices.length - 1}`);
      continue;
    }
    try {
      const choicesJson = JSON.stringify(r.choices);
      const explanation = r.explanation ?? null;
      await sql`
        INSERT INTO exam_questions (lang, prompt, choices_json, correct_index, explanation)
        VALUES (${r.lang}, ${r.prompt}, ${choicesJson}::jsonb, ${ci}, ${explanation})
      `;
      inserted++;
    } catch (err) {
      errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return { inserted, errors };
}
