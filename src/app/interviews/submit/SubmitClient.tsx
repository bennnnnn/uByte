"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";

type Difficulty = "easy" | "medium" | "hard";
type Outcome    = "offer" | "rejection" | "ongoing" | "ghosted";
type Status     = "idle" | "submitting" | "success" | "error";

/* ── Company list ───────────────────────────────────────────────────────── */
const COMPANIES = [
  "Google", "Meta", "Amazon", "Apple", "Microsoft", "Netflix",
  "Stripe", "Airbnb", "Uber", "Lyft", "LinkedIn", "Salesforce",
  "Adobe", "Oracle", "IBM", "Palantir", "Coinbase", "Shopify",
  "Atlassian", "Dropbox", "Snap", "DoorDash", "Instacart", "Robinhood",
  "Block", "Twilio", "Datadog", "MongoDB", "Cloudflare", "Figma",
  "Notion", "Vercel", "GitHub", "GitLab", "Spotify", "Twitter / X",
  "Other",
] as const;

/* ── Round types ────────────────────────────────────────────────────────── */
const ROUND_TYPES = [
  "Phone screen",
  "Technical coding",
  "System design",
  "Behavioral / HR",
  "Take-home assignment",
  "Onsite",
  "Final round",
  "Other",
];

/* ── Round shape ────────────────────────────────────────────────────────── */
interface Round {
  type: string;
  questions: string[];
  notes: string;
}

const emptyRound = (): Round => ({ type: "Technical coding", questions: [""], notes: "" });

/* ── Serialize structured rounds → plain text for the DB ────────────────── */
function serializeRounds(rounds: Round[]): string {
  return rounds
    .map((r, i) => {
      const header = `Round ${i + 1} — ${r.type}`;
      const qs = r.questions
        .filter((q) => q.trim())
        .map((q, qi) => `  ${qi + 1}. ${q.trim()}`)
        .join("\n");
      const notes = r.notes.trim() ? `  Notes: ${r.notes.trim()}` : "";
      return [header, qs && `  Questions:\n${qs}`, notes].filter(Boolean).join("\n");
    })
    .join("\n\n");
}

/* ── Input style ────────────────────────────────────────────────────────── */
const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const selectCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 focus:border-indigo-300 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function SubmitClient() {
  /* Company */
  const [companyChoice, setCompanyChoice] = useState<string>("Google");
  const [companyCustom,  setCompanyCustom]  = useState("");

  /* Other fields */
  const [role,       setRole]       = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [outcome,    setOutcome]    = useState<Outcome>("rejection");
  const [tips,       setTips]       = useState("");
  const [anonymous,  setAnonymous]  = useState(true);

  /* Rounds */
  const [rounds, setRounds] = useState<Round[]>([emptyRound()]);

  /* Status */
  const [status, setStatus] = useState<Status>("idle");
  const [error,  setError]  = useState("");

  /* ── Round helpers ──────────────────────────────────────────────────── */
  const updateRound = (idx: number, patch: Partial<Round>) =>
    setRounds((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const addRound = () => setRounds((rs) => [...rs, emptyRound()]);

  const removeRound = (idx: number) =>
    setRounds((rs) => rs.filter((_, i) => i !== idx));

  const addQuestion = (rIdx: number) =>
    updateRound(rIdx, { questions: [...rounds[rIdx].questions, ""] });

  const removeQuestion = (rIdx: number, qIdx: number) =>
    updateRound(rIdx, { questions: rounds[rIdx].questions.filter((_, i) => i !== qIdx) });

  const setQuestion = (rIdx: number, qIdx: number, val: string) =>
    updateRound(rIdx, {
      questions: rounds[rIdx].questions.map((q, i) => (i === qIdx ? val : q)),
    });

  /* ── Submit ─────────────────────────────────────────────────────────── */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const company = companyChoice === "Other" ? companyCustom.trim() : companyChoice;
    if (!company) { setError("Please enter the company name."); return; }
    if (!role.trim()) { setError("Role is required."); return; }

    // Require at least one non-empty question across all rounds
    const hasQuestion = rounds.some((r) => r.questions.some((q) => q.trim().length > 0));
    if (!hasQuestion) { setError("Please add at least one question for your first round."); return; }

    const roundsText = serializeRounds(rounds);
    if (!roundsText.trim()) { setError("Please describe at least one interview round."); return; }

    setStatus("submitting");
    try {
      await apiFetch("/api/interview-experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role: role.trim(), difficulty, outcome, rounds: roundsText, tips: tips.trim(), anonymous }),
      });
      setStatus("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  /* ── Success screen ─────────────────────────────────────────────────── */
  if (status === "success") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-4 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
        </div>
        <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">Thanks for sharing!</h2>
        <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
          Your experience has been submitted and will be visible after a quick review.
        </p>
        <Link
          href="/interviews"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          Browse experiences →
        </Link>
      </div>
    );
  }

  /* ── Form ───────────────────────────────────────────────────────────── */
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

      {/* Header */}
      <div className="mb-8">
        <Link href="/interviews" className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to interviews
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Share your interview experience</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Help other developers know what to expect. You can post completely anonymously.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6">

        {/* ── Company + Role ─────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Company dropdown */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Company *</label>
            <select
              id="interview-company"
              name="company"
              value={companyChoice}
              onChange={(e) => setCompanyChoice(e.target.value)}
              className={selectCls}
            >
              {COMPANIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {companyChoice === "Other" && (
              <input
                id="interview-company-custom"
                name="company_custom"
                type="text"
                value={companyCustom}
                onChange={(e) => setCompanyCustom(e.target.value)}
                placeholder="Type company name…"
                maxLength={120}
                className={`${inputCls} mt-2`}
                autoFocus
              />
            )}
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Role / Position *</label>
            <input
              id="interview-role"
              name="role"
              required
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Software Engineer L4"
              maxLength={120}
              className={inputCls}
            />
          </div>
        </div>

        {/* ── Difficulty + Outcome ────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Difficulty *</label>
            <select id="interview-difficulty" name="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className={selectCls}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Outcome *</label>
            <select id="interview-outcome" name="outcome" value={outcome} onChange={(e) => setOutcome(e.target.value as Outcome)} className={selectCls}>
              <option value="offer">Got the offer</option>
              <option value="rejection">Rejected</option>
              <option value="ongoing">Still ongoing</option>
              <option value="ghosted">Ghosted</option>
            </select>
          </div>
        </div>

        {/* ── Interview rounds ────────────────────────────────────────── */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Interview rounds *</p>
              <p className="mt-0.5 text-xs text-zinc-400">Add each round separately. List the questions asked in each one.</p>
            </div>
          </div>

          <div className="space-y-4">
            {rounds.map((round, rIdx) => (
              <div
                key={rIdx}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/60"
              >
                {/* Round header */}
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    {rIdx + 1}
                  </span>
                  <select
                    id={`round-type-${rIdx}`}
                    name={`round_type_${rIdx}`}
                    value={round.type}
                    onChange={(e) => updateRound(rIdx, { type: e.target.value })}
                    className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-indigo-300 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    {ROUND_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {rounds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRound(rIdx)}
                      className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                      aria-label="Remove round"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Questions */}
                <div className="mb-3 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Questions asked</p>
                  {round.questions.map((q, qIdx) => (
                    <div key={qIdx} className="flex items-center gap-2">
                      <span className="w-5 shrink-0 text-right text-xs font-medium text-zinc-400">{qIdx + 1}.</span>
                      <input
                        id={`round-${rIdx}-q-${qIdx}`}
                        name={`round_${rIdx}_question_${qIdx}`}
                        type="text"
                        value={q}
                        onChange={(e) => setQuestion(rIdx, qIdx, e.target.value)}
                        placeholder={`Question ${qIdx + 1}…`}
                        maxLength={500}
                        className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      {round.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(rIdx, qIdx)}
                          className="shrink-0 rounded p-1 text-zinc-300 hover:text-red-500 dark:text-zinc-600"
                          aria-label="Remove question"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addQuestion(rIdx)}
                    className="mt-1 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add question
                  </button>
                </div>

                {/* Round notes */}
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">Notes <span className="font-normal normal-case text-zinc-400">(optional — duration, format, vibe…)</span></p>
                  <textarea
                    id={`round-notes-${rIdx}`}
                    name={`round_notes_${rIdx}`}
                    value={round.notes}
                    onChange={(e) => updateRound(rIdx, { notes: e.target.value })}
                    rows={2}
                    maxLength={1000}
                    placeholder="e.g. 60 min, interviewer was friendly, no hints given…"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm leading-relaxed text-zinc-900 placeholder-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRound}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 dark:border-zinc-700 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add another round
          </button>
        </div>

        {/* ── Tips ────────────────────────────────────────────────────── */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tips for future candidates <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <span className={`text-xs tabular-nums ${tips.length > 1800 ? "text-amber-500" : "text-zinc-400"}`}>
              {tips.length} / 2000
            </span>
          </div>
          <textarea
            id="interview-tips"
            name="tips"
            value={tips}
            onChange={(e) => setTips(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="What would you do differently? Any resources you'd recommend?"
            className={inputCls}
          />
        </div>

        {/* ── Anonymous toggle ─────────────────────────────────────────── */}
        <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3.5 dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            role="switch"
            aria-checked={anonymous}
            onClick={() => setAnonymous((v) => !v)}
            className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${anonymous ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700"}`}
          >
            <span className={`pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${anonymous ? "translate-x-4" : ""}`} />
          </button>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Post anonymously</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {anonymous ? "Your name will NOT be shown with this post." : "Your display name will be shown with this post."}
            </p>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{error}</p>
        )}

        <div className="flex items-center gap-4 pt-1">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
                Submitting…
              </>
            ) : "Submit experience"}
          </button>
          <Link href="/interviews" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            Cancel
          </Link>
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          Submissions are reviewed before going live. We&apos;ll never publish company-identifying info beyond what you share here.
        </p>
      </form>
    </div>
  );
}
