import { unstable_cache } from "next/cache";
import { getSql } from "./client";
import {
  EXAM_LANGS,
  EXAM_SIZE as DEFAULT_EXAM_SIZE,
  EXAM_DURATION_MINUTES as DEFAULT_EXAM_DURATION_MINUTES,
  EXAM_PASS_PERCENT as DEFAULT_EXAM_PASS_PERCENT,
} from "@/lib/exams/config";
import type { ExamLang } from "@/lib/exams/config";

export interface ExamConfig {
  examSize: number;
  examDurationMinutes: number;
  passPercent: number;
}

export const DEFAULT_EXAM_CONFIG: ExamConfig = {
  examSize: DEFAULT_EXAM_SIZE,
  examDurationMinutes: DEFAULT_EXAM_DURATION_MINUTES,
  passPercent: DEFAULT_EXAM_PASS_PERCENT,
};

/** Max sensible "questions per exam" per language. */
const MAX_EXAM_SIZE = 200;

/**
 * Keys in site_settings for fallback when exam_lang_settings table is missing.
 * Per-language keys so updating one exam doesn't change others: exam_questions_per_attempt_go, exam_duration_minutes_go, etc.
 */
function siteKeyQuestionsPerExam(lang: string): string {
  return `exam_questions_per_attempt_${lang}`;
}
function siteKeyDurationMinutes(lang: string): string {
  return `exam_duration_minutes_${lang}`;
}
function siteKeyPassPercent(lang: string): string {
  return `exam_pass_percent_${lang}`;
}
/** Legacy global keys (single value for all langs); used only when per-lang keys are missing. */
const SITE_KEY_LEGACY_QUESTIONS = "exam_questions_per_attempt";
const SITE_KEY_LEGACY_DURATION = "exam_duration_minutes";
const SITE_KEY_LEGACY_EXAM_SIZE = "exam_size";
const SITE_KEY_LEGACY_PASS_PERCENT = "exam_pass_percent";

/** Read one lang from site_settings. Tries per-lang keys first, then legacy global keys. */
async function getExamConfigFromSiteSettings(lang: string): Promise<ExamConfig> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT key, value FROM site_settings
      WHERE key = ${siteKeyQuestionsPerExam(lang)} OR key = ${siteKeyDurationMinutes(lang)} OR key = ${siteKeyPassPercent(lang)}
         OR key IN (${SITE_KEY_LEGACY_QUESTIONS}, ${SITE_KEY_LEGACY_DURATION}, ${SITE_KEY_LEGACY_EXAM_SIZE}, ${SITE_KEY_LEGACY_PASS_PERCENT})
    `;
    const map = new Map((rows as { key: string; value: string }[]).map((r) => [r.key, r.value]));
    let examSize: number;
    const perAttempt = parseInt(map.get(siteKeyQuestionsPerExam(lang)) ?? map.get(SITE_KEY_LEGACY_QUESTIONS) ?? "", 10);
    if (Number.isInteger(perAttempt) && perAttempt >= 1 && perAttempt <= MAX_EXAM_SIZE) {
      examSize = perAttempt;
    } else {
      const legacy = parseInt(map.get(SITE_KEY_LEGACY_EXAM_SIZE) ?? "", 10);
      examSize = Number.isInteger(legacy) && legacy >= 1 && legacy <= 100 ? legacy : DEFAULT_EXAM_SIZE;
    }
    const examDurationMinutes = Math.max(
      5,
      Math.min(180, parseInt(map.get(siteKeyDurationMinutes(lang)) ?? map.get(SITE_KEY_LEGACY_DURATION) ?? "", 10) || DEFAULT_EXAM_DURATION_MINUTES)
    );
    const pp = parseInt(map.get(siteKeyPassPercent(lang)) ?? map.get(SITE_KEY_LEGACY_PASS_PERCENT) ?? "", 10);
    const passPercent = Number.isInteger(pp) && pp >= 1 && pp <= 100 ? pp : DEFAULT_EXAM_PASS_PERCENT;
    return {
      examSize: Math.max(1, Math.min(MAX_EXAM_SIZE, examSize)),
      examDurationMinutes,
      passPercent,
    };
  } catch {
    return DEFAULT_EXAM_CONFIG;
  }
}

/** Read all langs from site_settings (per-lang keys, then legacy global for missing). */
async function getExamConfigFromSiteSettingsForAllLangs(): Promise<Record<string, ExamConfig>> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT key, value FROM site_settings
      WHERE key LIKE 'exam_questions_per_attempt_%' OR key LIKE 'exam_duration_minutes_%' OR key LIKE 'exam_pass_percent_%'
         OR key IN (${SITE_KEY_LEGACY_QUESTIONS}, ${SITE_KEY_LEGACY_DURATION}, ${SITE_KEY_LEGACY_EXAM_SIZE}, ${SITE_KEY_LEGACY_PASS_PERCENT})
    `;
    const map = new Map((rows as { key: string; value: string }[]).map((r) => [r.key, r.value]));
    const result: Record<string, ExamConfig> = {};
    const legacyQ = parseInt(map.get(SITE_KEY_LEGACY_QUESTIONS) ?? map.get(SITE_KEY_LEGACY_EXAM_SIZE) ?? "", 10);
    const globalSize = Number.isInteger(legacyQ) && legacyQ >= 1 && legacyQ <= MAX_EXAM_SIZE
      ? legacyQ
      : Number.isInteger(legacyQ) && legacyQ >= 1 && legacyQ <= 100
        ? legacyQ
        : DEFAULT_EXAM_SIZE;
    const globalDuration = Math.max(5, Math.min(180, parseInt(map.get(SITE_KEY_LEGACY_DURATION) ?? "", 10) || DEFAULT_EXAM_DURATION_MINUTES));
    const globalPP = parseInt(map.get(SITE_KEY_LEGACY_PASS_PERCENT) ?? "", 10);
    const globalPassPercent = Number.isInteger(globalPP) && globalPP >= 1 && globalPP <= 100 ? globalPP : DEFAULT_EXAM_PASS_PERCENT;
    for (const lang of EXAM_LANGS) {
      const q = parseInt(map.get(siteKeyQuestionsPerExam(lang)) ?? "", 10);
      const d = parseInt(map.get(siteKeyDurationMinutes(lang)) ?? "", 10);
      const pp = parseInt(map.get(siteKeyPassPercent(lang)) ?? "", 10);
      result[lang] = {
        examSize: Number.isInteger(q) && q >= 1 && q <= MAX_EXAM_SIZE ? q : globalSize,
        examDurationMinutes: Number.isInteger(d) && d >= 5 && d <= 180 ? d : globalDuration,
        passPercent: Number.isInteger(pp) && pp >= 1 && pp <= 100 ? pp : globalPassPercent,
      };
    }
    return result;
  } catch {
    const result: Record<string, ExamConfig> = {};
    for (const lang of EXAM_LANGS) result[lang] = DEFAULT_EXAM_CONFIG;
    return result;
  }
}

/** Get exam config for one language. Uses exam_lang_settings; falls back to site_settings then defaults. */
export async function getExamConfigForLang(lang: string): Promise<ExamConfig> {
  try {
    const sql = getSql();
    const [row] = await sql`
      SELECT exam_size, exam_duration_minutes, pass_percent FROM exam_lang_settings WHERE lang = ${lang}
    `;
    if (!row) return getExamConfigFromSiteSettings(lang);
    const r = row as { exam_size: number; exam_duration_minutes: number; pass_percent?: number };
    const examSize = Math.max(1, Math.min(MAX_EXAM_SIZE, Number(r.exam_size) || DEFAULT_EXAM_SIZE));
    const examDurationMinutes = Math.max(5, Math.min(180, Number(r.exam_duration_minutes) || DEFAULT_EXAM_DURATION_MINUTES));
    const pp = Number(r.pass_percent);
    const passPercent = Number.isInteger(pp) && pp >= 1 && pp <= 100 ? pp : DEFAULT_EXAM_PASS_PERCENT;
    return { examSize, examDurationMinutes, passPercent };
  } catch {
    return getExamConfigFromSiteSettings(lang);
  }
}

/** Get exam config for all exam languages. Uses exam_lang_settings; falls back to site_settings (same value for all langs) when table missing. */
export const getExamConfigForAllLangs = unstable_cache(
  async (): Promise<Record<string, ExamConfig>> => {
    try {
      const sql = getSql();
      const rows = await sql`
        SELECT lang, exam_size, exam_duration_minutes, pass_percent FROM exam_lang_settings
      `;
      const byLang = new Map<string, ExamConfig>();
      for (const r of rows as { lang: string; exam_size: number; exam_duration_minutes: number; pass_percent?: number }[]) {
        const pp = Number(r.pass_percent);
        byLang.set(r.lang, {
          examSize: Math.max(1, Math.min(MAX_EXAM_SIZE, Number(r.exam_size) || DEFAULT_EXAM_SIZE)),
          examDurationMinutes: Math.max(5, Math.min(180, Number(r.exam_duration_minutes) || DEFAULT_EXAM_DURATION_MINUTES)),
          passPercent: Number.isInteger(pp) && pp >= 1 && pp <= 100 ? pp : DEFAULT_EXAM_PASS_PERCENT,
        });
      }
      const result: Record<string, ExamConfig> = {};
      for (const lang of EXAM_LANGS) {
        result[lang] = byLang.get(lang) ?? DEFAULT_EXAM_CONFIG;
      }
      return result;
    } catch {
      return getExamConfigFromSiteSettingsForAllLangs();
    }
  },
  ["exam-config-all"],
  { revalidate: 300, tags: ["exam-config"] }
);

/** Write per-lang settings to site_settings so each exam keeps its own value. */
async function setExamConfigInSiteSettingsBulk(settings: Record<string, ExamConfig>): Promise<void> {
  const sql = getSql();
  const writes: Promise<unknown>[] = [];
  for (const lang of EXAM_LANGS) {
    const config = settings[lang];
    if (!config) continue;
    const examSize = Math.max(1, Math.min(MAX_EXAM_SIZE, Math.floor(Number(config.examSize))));
    const examDurationMinutes = Math.max(5, Math.min(180, Math.floor(Number(config.examDurationMinutes))));
    const passPercent = Math.max(1, Math.min(100, Math.floor(Number(config.passPercent) || DEFAULT_EXAM_PASS_PERCENT)));
    writes.push(sql`
      INSERT INTO site_settings (key, value, updated_at) VALUES (${siteKeyQuestionsPerExam(lang)}, ${String(examSize)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `);
    writes.push(sql`
      INSERT INTO site_settings (key, value, updated_at) VALUES (${siteKeyDurationMinutes(lang)}, ${String(examDurationMinutes)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `);
    writes.push(sql`
      INSERT INTO site_settings (key, value, updated_at) VALUES (${siteKeyPassPercent(lang)}, ${String(passPercent)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `);
  }
  await Promise.all(writes);
}

/** Update exam settings for one language (admin only). Uses exam_lang_settings; throws if table missing. */
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
  const passPercent = updates.passPercent != null
    ? Math.max(1, Math.min(100, Math.floor(Number(updates.passPercent))))
    : current.passPercent;
  await sql`
    INSERT INTO exam_lang_settings (lang, exam_size, exam_duration_minutes, pass_percent, updated_at)
    VALUES (${lang}, ${examSize}, ${examDurationMinutes}, ${passPercent}, NOW())
    ON CONFLICT (lang) DO UPDATE SET
      exam_size = EXCLUDED.exam_size,
      exam_duration_minutes = EXCLUDED.exam_duration_minutes,
      pass_percent = EXCLUDED.pass_percent,
      updated_at = NOW()
  `;
}

/** Update exam settings for multiple languages (admin bulk save). Falls back to per-lang site_settings keys when exam_lang_settings table missing. */
export async function setExamSettingsBulk(
  settings: Record<string, Partial<ExamConfig>>
): Promise<void> {
  try {
    await Promise.all(
      Object.keys(settings)
        .filter((lang) => EXAM_LANGS.includes(lang as ExamLang))
        .map((lang) => setExamSettingsForLang(lang, settings[lang] ?? {}))
    );
  } catch {
    const current = await getExamConfigFromSiteSettingsForAllLangs();
    const merged: Record<string, ExamConfig> = {};
    for (const lang of EXAM_LANGS) {
      const incoming = settings[lang];
      merged[lang] = {
        examSize: incoming?.examSize != null ? Math.max(1, Math.min(MAX_EXAM_SIZE, Math.floor(Number(incoming.examSize)))) : current[lang].examSize,
        examDurationMinutes: incoming?.examDurationMinutes != null ? Math.max(5, Math.min(180, Math.floor(Number(incoming.examDurationMinutes)))) : current[lang].examDurationMinutes,
        passPercent: incoming?.passPercent != null ? Math.max(1, Math.min(100, Math.floor(Number(incoming.passPercent)))) : current[lang].passPercent,
      };
    }
    await setExamConfigInSiteSettingsBulk(merged);
  }
}

/** @deprecated Use getExamConfigForLang(lang) or getExamConfigForAllLangs(). Kept for backward compat. */
export async function getExamConfig(): Promise<ExamConfig> {
  return getExamConfigForLang("go");
}
