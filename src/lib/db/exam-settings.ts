import { getSql } from "./client";
import {
  EXAM_LANGS,
  EXAM_SIZE as DEFAULT_EXAM_SIZE,
  EXAM_DURATION_MINUTES as DEFAULT_EXAM_DURATION_MINUTES,
} from "@/lib/exams/config";
import type { ExamLang } from "@/lib/exams/config";

export interface ExamConfig {
  examSize: number;
  examDurationMinutes: number;
}

const DEFAULT_CONFIG: ExamConfig = {
  examSize: DEFAULT_EXAM_SIZE,
  examDurationMinutes: DEFAULT_EXAM_DURATION_MINUTES,
};

/** Max sensible "questions per exam" per language. */
const MAX_EXAM_SIZE = 200;

/** Get exam config for one language. Uses exam_lang_settings; falls back to code defaults. */
export async function getExamConfigForLang(lang: string): Promise<ExamConfig> {
  try {
    const sql = getSql();
    const [row] = await sql`
      SELECT exam_size, exam_duration_minutes FROM exam_lang_settings WHERE lang = ${lang}
    `;
    if (!row) return DEFAULT_CONFIG;
    const r = row as { exam_size: number; exam_duration_minutes: number };
    const examSize = Math.max(1, Math.min(MAX_EXAM_SIZE, Number(r.exam_size) || DEFAULT_EXAM_SIZE));
    const examDurationMinutes = Math.max(
      5,
      Math.min(180, Number(r.exam_duration_minutes) || DEFAULT_EXAM_DURATION_MINUTES)
    );
    return { examSize, examDurationMinutes };
  } catch {
    return DEFAULT_CONFIG;
  }
}

/** Get exam config for all exam languages. Used for home page and practice-exams listing. */
export async function getExamConfigForAllLangs(): Promise<Record<string, ExamConfig>> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT lang, exam_size, exam_duration_minutes FROM exam_lang_settings
    `;
    const byLang = new Map<string, ExamConfig>();
    for (const r of rows as { lang: string; exam_size: number; exam_duration_minutes: number }[]) {
      byLang.set(r.lang, {
        examSize: Math.max(1, Math.min(MAX_EXAM_SIZE, Number(r.exam_size) || DEFAULT_EXAM_SIZE)),
        examDurationMinutes: Math.max(
          5,
          Math.min(180, Number(r.exam_duration_minutes) || DEFAULT_EXAM_DURATION_MINUTES)
        ),
      });
    }
    const result: Record<string, ExamConfig> = {};
    for (const lang of EXAM_LANGS) {
      result[lang] = byLang.get(lang) ?? DEFAULT_CONFIG;
    }
    return result;
  } catch {
    const result: Record<string, ExamConfig> = {};
    for (const lang of EXAM_LANGS) {
      result[lang] = DEFAULT_CONFIG;
    }
    return result;
  }
}

/** Update exam settings for one language (admin only). */
export async function setExamSettingsForLang(
  lang: string,
  updates: Partial<ExamConfig>
): Promise<void> {
  if (!EXAM_LANGS.includes(lang as ExamLang)) return;
  const sql = getSql();
  const current = await getExamConfigForLang(lang);
  const examSize = updates.examSize != null
    ? Math.max(1, Math.min(MAX_EXAM_SIZE, Math.floor(Number(updates.examSize))))
    : current.examSize;
  const examDurationMinutes = updates.examDurationMinutes != null
    ? Math.max(5, Math.min(180, Math.floor(Number(updates.examDurationMinutes))))
    : current.examDurationMinutes;
  await sql`
    INSERT INTO exam_lang_settings (lang, exam_size, exam_duration_minutes, updated_at)
    VALUES (${lang}, ${examSize}, ${examDurationMinutes}, NOW())
    ON CONFLICT (lang) DO UPDATE SET
      exam_size = EXCLUDED.exam_size,
      exam_duration_minutes = EXCLUDED.exam_duration_minutes,
      updated_at = NOW()
  `;
}

/** Update exam settings for multiple languages (admin bulk save). */
export async function setExamSettingsBulk(
  settings: Record<string, Partial<ExamConfig>>
): Promise<void> {
  for (const lang of Object.keys(settings)) {
    if (EXAM_LANGS.includes(lang as ExamLang)) {
      await setExamSettingsForLang(lang, settings[lang] ?? {});
    }
  }
}

/** @deprecated Use getExamConfigForLang(lang) or getExamConfigForAllLangs(). Kept for backward compat. */
export async function getExamConfig(): Promise<ExamConfig> {
  return getExamConfigForLang("go");
}
