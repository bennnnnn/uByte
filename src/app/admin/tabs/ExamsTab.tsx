/**
 * ExamsTab — exam settings, stats, question browser/management, and bulk upload.
 *
 * Sections:
 *   1. Per-language settings (question count, duration, pass %).
 *   2. Aggregate stat cards (total questions, attempts, pass rate, certs).
 *   3. Stats-by-language table.
 *   4. Question browser — browse, preview, and delete questions per language.
 *   5. Bulk upload — CSV / JSON.
 */

import { Spinner, StatCard, SectionCard, EmptyRow, SaveButton, SaveFeedback, LoadingBlock } from "../components";
import type { AdminData } from "../hooks";

interface Props {
  data: AdminData;
}

/** Display name map for supported languages. */
const LANG_NAMES: Record<string, string> = {
  go: "Go", python: "Python", javascript: "JavaScript", java: "Java", rust: "Rust", cpp: "C++", csharp: "C#",
};
const LANG_KEYS = Object.keys(LANG_NAMES);

const CHOICE_LABELS = ["A", "B", "C", "D", "E"];

export default function ExamsTab({ data }: Props) {
  const {
    examStats, examStatsLoading,
    examSettings, setExamSettings, examSettingsSaving, examSettingsMessage, saveExamSettings,
    setExamUploadFile, examUploading, examUploadResult, setExamUploadResult, uploadExamQuestions,
    questionBrowserLang, questionBrowserRows, questionBrowserTotal, questionBrowserPage,
    questionBrowserLoading, loadQuestions, deleteQuestion,
    clearLangConfirm, setClearLangConfirm, clearLangLoading, clearAllQuestionsForLang,
  } = data;

  const LIMIT = 50;
  const totalPages = Math.max(1, Math.ceil(questionBrowserTotal / LIMIT));

  return (
    <div className="space-y-5">

      {/* ── Per-language settings (questions, duration, pass %) ─────────── */}
      <SectionCard title="Exam settings" description="Questions, duration, and pass threshold per language. Changes apply to new attempts only.">
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
              <table className="w-full min-w-[600px] text-sm">
                <thead className="bg-surface-card">
                  <tr>
                    {["Lang", "Questions", "Attempts", "Passed", "Certs", "Pass %", ""].map((h, i) => (
                      <th key={h || `actions-${i}`} className={`${i === 0 ? "px-5 text-left" : i >= 5 ? "px-5 text-right" : "px-4 text-right"} py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {examStats.questionsByLang.length === 0
                    ? <EmptyRow cols={7} text="No questions yet. Upload below." />
                    : examStats.questionsByLang.map((r) => (
                      <tr key={r.lang} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                        <td className="px-5 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                          {LANG_NAMES[r.lang] ?? r.lang}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono">{r.question_count}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{r.attempt_count}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{r.passed_count}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{r.certificates_count}</td>
                        <td className="px-5 py-2.5 text-right">{r.attempt_count > 0 ? Math.round((r.passed_count / r.attempt_count) * 100) + "%" : "—"}</td>
                        <td className="px-5 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => loadQuestions(r.lang, 1)}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Browse →
                          </button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      ) : null}

      {/* ── Question browser ───────────────────────────────────────────── */}
      {questionBrowserLang && (
        <SectionCard
          title={`Questions — ${LANG_NAMES[questionBrowserLang] ?? questionBrowserLang}`}
          description={`${questionBrowserTotal} question${questionBrowserTotal !== 1 ? "s" : ""} in the database. Showing page ${questionBrowserPage} of ${totalPages}.`}
        >
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Language switcher */}
              {LANG_KEYS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => loadQuestions(l, 1)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    questionBrowserLang === l
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  }`}
                >
                  {LANG_NAMES[l]}
                </button>
              ))}
            </div>

            {/* Clear all */}
            {questionBrowserTotal > 0 && (
              clearLangConfirm === questionBrowserLang ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600 dark:text-red-400">Delete all {questionBrowserTotal} questions?</span>
                  <button type="button" onClick={() => setClearLangConfirm(null)} className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">Cancel</button>
                  <button
                    type="button"
                    disabled={clearLangLoading}
                    onClick={() => clearAllQuestionsForLang(questionBrowserLang)}
                    className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {clearLangLoading ? "Deleting…" : "Yes, delete all"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setClearLangConfirm(questionBrowserLang)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-950/20"
                >
                  Clear all questions
                </button>
              )
            )}
          </div>

          {/* Question list */}
          {questionBrowserLoading ? (
            <div className="flex items-center justify-center gap-3 py-10"><Spinner /><span className="text-sm text-zinc-400">Loading…</span></div>
          ) : questionBrowserRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">No questions found. Upload some below.</p>
          ) : (
            <div className="space-y-3">
              {questionBrowserRows.map((q, idx) => (
                <div key={q.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                        #{q.id} · {(questionBrowserPage - 1) * LIMIT + idx + 1} of {questionBrowserTotal}
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{q.prompt}</p>
                      <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                        {q.choices_json.map((c, ci) => (
                          <span
                            key={ci}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs ${
                              ci === q.correct_index
                                ? "bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : "bg-white text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                            }`}
                          >
                            <span className="font-bold">{CHOICE_LABELS[ci] ?? ci}</span>
                            {c}
                            {ci === q.correct_index && <span className="ml-auto text-emerald-600 dark:text-emerald-400">✓</span>}
                          </span>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="font-semibold">Explanation:</span> {q.explanation}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      title="Delete this question"
                      onClick={() => deleteQuestion(q.id)}
                      className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                disabled={questionBrowserPage <= 1}
                onClick={() => loadQuestions(questionBrowserLang, questionBrowserPage - 1)}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                ← Previous
              </button>
              <span className="text-xs text-zinc-400">Page {questionBrowserPage} / {totalPages}</span>
              <button
                type="button"
                disabled={questionBrowserPage >= totalPages}
                onClick={() => loadQuestions(questionBrowserLang, questionBrowserPage + 1)}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Next →
              </button>
            </div>
          )}
        </SectionCard>
      )}

      {/* ── Bulk upload ────────────────────────────────────────────────── */}
      <SectionCard
        title="Bulk upload questions"
        description="CSV columns: lang, prompt, choice1–4, correct_index (0–3), explanation (optional). JSON: { questions: [...] } or a top-level array."
      >
        <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs dark:border-zinc-700 dark:bg-zinc-800">
          <p className="mb-2 font-semibold text-zinc-700 dark:text-zinc-300">CSV example:</p>
          <code className="whitespace-pre-wrap font-mono text-zinc-500 dark:text-zinc-400">
            {`lang,prompt,choice1,choice2,choice3,choice4,correct_index,explanation\ngo,What keyword starts a goroutine?,go,async,spawn,thread,0,The go keyword starts a goroutine.`}
          </code>
          <p className="mt-3 mb-2 font-semibold text-zinc-700 dark:text-zinc-300">JSON example:</p>
          <code className="whitespace-pre-wrap font-mono text-zinc-500 dark:text-zinc-400">
            {`{ "questions": [\n  { "lang": "go", "prompt": "...", "choices": ["A","B","C","D"], "correct_index": 0, "explanation": "..." }\n]}`}
          </code>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            id="exam-upload-file"
            name="exam_file"
            type="file"
            accept=".csv,.json,text/csv,application/json"
            onChange={(e) => { setExamUploadFile(e.target.files?.[0] ?? null); setExamUploadResult(null); }}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
          />
          <SaveButton saving={examUploading} label="Upload" savingLabel="Uploading…" onClick={uploadExamQuestions} />
        </div>

        {/* Upload result feedback */}
        {examUploadResult && (
          <div className={`mt-4 rounded-lg border p-3 ${examUploadResult.inserted > 0 ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-950/20" : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"}`}>
            <p className={`text-sm font-medium ${examUploadResult.inserted > 0 ? "text-emerald-800 dark:text-emerald-300" : "text-zinc-900 dark:text-zinc-100"}`}>
              ✓ Inserted {examUploadResult.inserted} question{examUploadResult.inserted !== 1 ? "s" : ""}
            </p>
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
      name="number_input"
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value, 10) || min)))}
      className="w-20 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-right text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
    />
  );
}
