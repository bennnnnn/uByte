import { getSql } from "./client";
import { EXAM_SIZE as DEFAULT_EXAM_SIZE, EXAM_DURATION_MINUTES as DEFAULT_EXAM_DURATION_MINUTES } from "@/lib/exams/config";

export interface ExamConfig {
  examSize: number;
  examDurationMinutes: number;
}

/** Get exam config from DB; fallback to code defaults. */
export async function getExamConfig(): Promise<ExamConfig> {
  const sql = getSql();
  const rows = await sql`
    SELECT key, value FROM site_settings
    WHERE key IN ('exam_size', 'exam_duration_minutes')
  `;
  const map = new Map((rows as { key: string; value: string }[]).map((r) => [r.key, r.value]));
  const examSize = parseInt(map.get("exam_size") ?? "", 10);
  const examDurationMinutes = parseInt(map.get("exam_duration_minutes") ?? "", 10);
  return {
    examSize: Number.isInteger(examSize) && examSize > 0 ? examSize : DEFAULT_EXAM_SIZE,
    examDurationMinutes: Number.isInteger(examDurationMinutes) && examDurationMinutes > 0 ? examDurationMinutes : DEFAULT_EXAM_DURATION_MINUTES,
  };
}

/** Update exam settings (admin only). */
export async function setExamSettings(updates: Partial<ExamConfig>): Promise<void> {
  const sql = getSql();
  if (updates.examSize != null) {
    const n = Math.max(1, Math.min(200, Math.floor(Number(updates.examSize))));
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('exam_size', ${String(n)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }
  if (updates.examDurationMinutes != null) {
    const n = Math.max(5, Math.min(180, Math.floor(Number(updates.examDurationMinutes))));
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('exam_duration_minutes', ${String(n)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }
}
