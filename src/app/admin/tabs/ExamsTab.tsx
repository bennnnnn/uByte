/**
 * ExamsTab — pass threshold, per-language settings, stats, and bulk upload.
 *
 * Sections:
 *   1. Pass threshold (global % to pass any exam — saved via site settings).
 *   2. Per-language settings (question count, duration). Editable inline.
 *   3. Aggregate stat cards (total questions, attempts, pass rate, certs).
 *   4. Stats-by-language table.
 *   5. CSV / JSON bulk upload form.
 */

import { Spinner, StatCard, SectionCard, EmptyRow, SaveButton, SaveFeedback, LoadingBlock } from "../components";
import type { AdminData } from "../hooks";

interface Props {
  data: AdminData;
}

/** Display name map for supported languages. */
const LANG_NAMES: Record<string, string> = {
  go: "Go", python: "Python", javascript: "JavaScript", java: "Java", rust: "Rust", cpp: "C++",
};
const LANG_KEYS = Object.keys(LANG_NAMES);

export default function ExamsTab({ data }: Props) {
  const {
    examStats, examStatsLoading,
    examSettings, setExamSettings, examSettingsSaving, examSettingsMessage, saveExamSettings,
    setExamUploadFile, examUploading, examUploadResult, setExamUploadResult, uploadExamQuestions,
  } = data;

  return (
    <div className="space-y-5">

      {/* ── Per-language settings (questions, duration, pass %) ─────────── */}
      <SectionCard title="Exam settings" description="Questions, duration, and pass threshold per language. Each exam can have its own settings. Changes apply to new attempts.">
        {examSettings === null ? <LoadingBlock /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Language</th>
                    <th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Questions</th>
                    <th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Duration (min)</th>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Pass %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {LANG_KEYS.map((lang) => {
                    const cfg = examSettings[lang] ?? { examSize: 40, examDurationMinutes: 45, passPercent: 70 };
                    return (
                      <tr key={lang}>
                        <td className="py-2.5 pr-4 font-medium text-zinc-900 dark:text-zinc-100">{LANG_NAMES[lang]}</td>
                        <td className="py-2.5 pr-4 text-right">
                          <NumberInput value={cfg.examSize} min={1} max={200} onChange={(v) => setExamSettings((s) => s ? { ...s, [lang]: { ...cfg, examSize: v } } : s)} />
                        </td>
                        <td className="py-2.5 pr-4 text-right">
                          <NumberInput value={cfg.examDurationMinutes} min={5} max={300} onChange={(v) => setExamSettings((s) => s ? { ...s, [lang]: { ...cfg, examDurationMinutes: v } } : s)} />
                        </td>
                        <td className="py-2.5 text-right">
                          <NumberInput value={cfg.passPercent} min={1} max={100} onChange={(v) => setExamSettings((s) => s ? { ...s, [lang]: { ...cfg, passPercent: v } } : s)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <SaveButton saving={examSettingsSaving} label="Save settings" onClick={saveExamSettings} />
              <SaveFeedback message={examSettingsMessage} />
            </div>
          </>
        )}
      </SectionCard>

      {/* ── Aggregate stats ────────────────────────────────────────────── */}
      {examStatsLoading ? (
        <div className="flex items-center justify-center gap-3 py-8"><Spinner /><span className="text-sm text-zinc-400">Loading exam stats…</span></div>
      ) : examStats ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total questions" value={examStats.totalQuestions} />
            <StatCard label="Exam attempts" value={examStats.totalAttempts} />
            <StatCard label="Pass rate" value={examStats.totalAttempts > 0 ? examStats.passRatePercent + "%" : "—"} />
            <StatCard label="Certificates" value={examStats.certificatesIssued} />
          </div>

          {/* ── Per-language stats table ───────────────────────────────── */}
          <SectionCard title="Stats by language">
            <div className="overflow-auto -mx-5 -mb-5">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-surface-card">
                  <tr>
                    {["Lang", "Questions", "Attempts", "Passed", "Certs", "Pass %"].map((h, i) => (
                      <th key={h} className={`${i === 0 ? "px-5 text-left" : i === 5 ? "px-5 text-right" : "px-4 text-right"} py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {examStats.questionsByLang.length === 0
                    ? <EmptyRow cols={6} text="No questions yet. Upload below." />
                    : examStats.questionsByLang.map((r) => (
                      <tr key={r.lang} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                        <td className="px-5 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">{r.lang}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{r.question_count}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{r.attempt_count}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{r.passed_count}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{r.certificates_count}</td>
                        <td className="px-5 py-2.5 text-right">{r.attempt_count > 0 ? Math.round((r.passed_count / r.attempt_count) * 100) + "%" : "—"}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      ) : null}

      {/* ── Bulk upload ────────────────────────────────────────────────── */}
      <SectionCard title="Bulk upload questions" description="CSV columns: lang, prompt, choice1–4, correct_index (0–3), explanation. JSON: { questions: [...] }">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".csv,.json,text/csv,application/json"
            onChange={(e) => { setExamUploadFile(e.target.files?.[0] ?? null); setExamUploadResult(null); }}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
          />
          <SaveButton saving={examUploading} label="Upload" savingLabel="Uploading…" onClick={uploadExamQuestions} />
        </div>

        {/* Upload result feedback */}
        {examUploadResult && (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Inserted: {examUploadResult.inserted}</p>
            {examUploadResult.errors.length > 0 && (
              <ul className="mt-1.5 list-inside list-disc text-xs text-amber-700 dark:text-amber-400">
                {examUploadResult.errors.slice(0, 10).map((e, i) => <li key={`err-${i}-${e.slice(0, 30)}`}>{e}</li>)}
                {examUploadResult.errors.length > 10 && <li>… and {examUploadResult.errors.length - 10} more</li>}
              </ul>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/* ── Tiny inline number input ────────────────────────────────────────────── */

function NumberInput({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value, 10) || min)))}
      className="w-20 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-right text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
    />
  );
}
