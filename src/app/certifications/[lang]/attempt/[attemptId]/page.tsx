"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getLangIcon } from "@/lib/languages/icons";
import { EXAM_DURATION_MINUTES, EXAM_LANGS } from "@/lib/exams/config";
import type { AttemptPayload, SubmitExamResponse } from "@/lib/exams/api-types";
import { parseJson, getApiErrorMessage } from "@/lib/fetch-utils";
import { apiFetch } from "@/lib/api-client";
import { usePassPercent } from "@/hooks/usePassPercent";
import Spinner from "@/components/Spinner";

// ── Choice letter labels ──────────────────────────────────────────────────────
const CHOICE_LABELS = ["A", "B", "C", "D", "E", "F"];

// ── Confirm modal ─────────────────────────────────────────────────────────────
function ConfirmModal({
  open, id, title, body, cancelLabel, confirmLabel, onCancel, onConfirm, danger,
}: {
  open: boolean; id: string; title: string; body: string;
  cancelLabel: string; confirmLabel: string;
  onCancel: () => void; onConfirm: () => void; danger?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-labelledby={id}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
        <h2 id={id} className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{body}</p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"
            }`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Timer display ─────────────────────────────────────────────────────────────
function TimerDisplay({ remainingSeconds, durationMinutes }: { remainingSeconds: number | null; durationMinutes: number }) {
  const isUrgent = remainingSeconds != null && remainingSeconds <= 5 * 60;
  const isWarning = remainingSeconds != null && remainingSeconds <= 15 * 60;

  const minutes = remainingSeconds != null ? Math.floor(remainingSeconds / 60) : null;
  const seconds = remainingSeconds != null ? remainingSeconds % 60 : null;
  const label = minutes != null && seconds != null
    ? `${minutes}:${seconds.toString().padStart(2, "0")}`
    : "—";

  const fraction = remainingSeconds != null
    ? Math.max(0, Math.min(1, remainingSeconds / (durationMinutes * 60)))
    : 1;

  // SVG circle timer
  const R = 20;
  const C = 2 * Math.PI * R;
  const dash = fraction * C;

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
        <svg className="-rotate-90" width="56" height="56" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={R} fill="none" strokeWidth="3.5"
            className="stroke-zinc-200 dark:stroke-zinc-700" />
          <circle cx="28" cy="28" r={R} fill="none" strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
            className={
              isUrgent ? "stroke-red-500 transition-all" :
              isWarning ? "stroke-amber-500 transition-all" :
              "stroke-emerald-500 transition-all"
            }
          />
        </svg>
        <span className={`absolute text-xs font-bold tabular-nums ${
          isUrgent ? "text-red-600 dark:text-red-400" :
          isWarning ? "text-amber-600 dark:text-amber-400" :
          "text-zinc-700 dark:text-zinc-200"
        }`}>
          {label}
        </span>
      </div>
      <div>
        <p className={`text-[11px] font-semibold uppercase tracking-wider ${
          isUrgent ? "text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"
        }`}>
          {isUrgent ? "Hurry up!" : isWarning ? "Time running low" : "Time left"}
        </p>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Auto-submits at 0:00</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PracticeExamAttemptPage() {
  const { lang, attemptId } = useParams<{ lang: string; attemptId: string }>();
  const router = useRouter();
  const [attempt, setAttempt] = useState<AttemptPayload | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingLeaveUrl, setPendingLeaveUrl] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const passPercent = usePassPercent(lang);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load attempt
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/certifications/attempt/${attemptId}`, { credentials: "same-origin" });
        const data = await parseJson<AttemptPayload & { error?: string }>(res);
        if (cancelled) return;
        if (res.status === 401) { router.replace("/login"); return; }
        if (res.status === 403) { router.replace("/certifications"); return; }
        if (!res.ok) { setError(getApiErrorMessage(res, data, "Unable to load exam.")); return; }
        setAttempt(data as AttemptPayload);
      } catch {
        if (!cancelled) setError("Network error. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [attemptId, router]);

  const totalQuestions = attempt?.questions.length ?? 0;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const allAnswered = !!attempt && answeredCount === totalQuestions;

  const handleChange = (qid: number, idx: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  };

  const handleSubmit = useCallback(async (opts?: { force?: boolean }) => {
    if (!attempt) return;
    if (!opts?.force && !allAnswered) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/certifications/attempt/${attempt.attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await parseJson<SubmitExamResponse & { error?: string }>(res);
      if (!res.ok) {
        setError(getApiErrorMessage(res, data, "Submission failed. Please try again."));
        setSubmitting(false);
        return;
      }
      const { score, passed, certificateId } = data;
      const params = new URLSearchParams();
      params.set("score", String(score));
      params.set("passed", passed ? "1" : "0");
      if (certificateId) params.set("cert", certificateId);
      router.push(`/certifications/${lang}/result/${attempt.attemptId}?${params.toString()}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }, [allAnswered, answers, attempt, lang, router]);

  const handleSwitchLanguage = (nextLang: string) => {
    if (nextLang === lang) return;
    setPendingLeaveUrl(`/certifications/${nextLang}`);
    setShowLeaveConfirm(true);
  };

  const confirmLeave = useCallback(() => {
    if (pendingLeaveUrl) router.push(pendingLeaveUrl);
    setShowLeaveConfirm(false);
    setPendingLeaveUrl(null);
  }, [pendingLeaveUrl, router]);

  // Prevent accidental close
  useEffect(() => {
    if (!attempt || autoSubmitted) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [attempt, autoSubmitted]);

  const durationMinutes = attempt?.durationMinutes ?? EXAM_DURATION_MINUTES;

  // Timer
  useEffect(() => {
    if (!attempt) return;
    const durationSec = durationMinutes * 60;
    const startedMs = new Date(attempt.startedAt).getTime();
    if (Number.isNaN(startedMs)) return;
    const computeRemaining = () => Math.max(0, durationSec - Math.floor((Date.now() - startedMs) / 1000));
    setRemainingSeconds(computeRemaining());
    let alreadyAutoSubmitted = false;
    const id = window.setInterval(() => {
      const rem = computeRemaining();
      setRemainingSeconds(rem);
      if (rem <= 0 && !alreadyAutoSubmitted) {
        alreadyAutoSubmitted = true;
        setAutoSubmitted(true);
        void handleSubmit({ force: true });
        window.clearInterval(id);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [attempt, durationMinutes, handleSubmit]);

  // Track active question via IntersectionObserver
  useEffect(() => {
    if (!attempt) return;
    const observers: IntersectionObserver[] = [];
    attempt.questions.forEach((_, idx) => {
      const el = questionRefs.current[idx];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveQuestion(idx); },
        { threshold: 0.5 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [attempt]);

  const scrollToQuestion = (idx: number) => {
    questionRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Loading exam…" />
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="mb-3 text-sm text-red-500 dark:text-red-400">{error || "Exam not found."}</p>
          <Link href="/certifications" className="text-sm font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400">
            ← Back to certifications
          </Link>
        </div>
      </div>
    );
  }

  const langConfig = LANGUAGES[attempt.lang as SupportedLanguage];

  return (
    <div className="min-h-full bg-surface-page">

      {/* ── Sticky exam header ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">

          {/* Language + title */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">{getLangIcon(attempt.lang)}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {langConfig?.name ?? attempt.lang} Certification
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {totalQuestions} questions · {passPercent}% to pass
                </p>
              </div>
            </div>
          </div>

          {/* Progress pill */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-800">
              <span className={answeredCount === totalQuestions ? "text-emerald-600" : "text-zinc-500"}>
                {answeredCount}/{totalQuestions}
              </span>
              <span className="text-zinc-400">answered</span>
            </div>
          </div>

          {/* Timer */}
          <TimerDisplay remainingSeconds={remainingSeconds} durationMinutes={durationMinutes} />

          {/* Switch language */}
          <select
            value={attempt.lang}
            onChange={(e) => handleSwitchLanguage(e.target.value)}
            className="hidden rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 sm:block"
            aria-label="Switch exam language"
          >
            {EXAM_LANGS.map((l) => (
              <option key={l} value={l}>{LANGUAGES[l]?.name}</option>
            ))}
          </select>
        </div>

        {/* Overall progress bar */}
        <div className="h-0.5 bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${(answeredCount / Math.max(totalQuestions, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:flex lg:gap-8">

        {/* Questions */}
        <div className="min-w-0 flex-1 space-y-5">
          {attempt.questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            return (
              <div
                key={q.id}
                id={`q-${q.id}`}
                ref={(el) => { questionRefs.current[idx] = el; }}
                className={`scroll-mt-24 rounded-2xl border p-5 transition-all ${
                  isAnswered
                    ? "border-amber-200 bg-white shadow-sm dark:border-amber-900/50 dark:bg-zinc-900"
                    : "border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                }`}
                role="group"
                aria-labelledby={`q-${q.id}-label`}
              >
                {/* Question header */}
                <div className="mb-4 flex items-start gap-3">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isAnswered
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}>
                    {isAnswered ? "✓" : idx + 1}
                  </span>
                  <p id={`q-${q.id}-label`} className="text-sm font-medium leading-relaxed text-zinc-900 dark:text-zinc-100">
                    {q.prompt}
                  </p>
                </div>

                {/* Choices — full-width clickable cards */}
                <div className="space-y-2.5 pl-10" role="radiogroup" aria-labelledby={`q-${q.id}-label`}>
                  {q.choices.map((choice, cIdx) => {
                    const selected = answers[q.id] === cIdx;
                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => handleChange(q.id, cIdx)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                          selected
                            ? "border-amber-400 bg-amber-50 font-medium text-amber-900 shadow-sm dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-100"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-amber-300 hover:bg-amber-50/50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:border-amber-700 dark:hover:bg-amber-950/20"
                        }`}
                        role="radio"
                        aria-checked={selected}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-colors ${
                          selected
                            ? "border-amber-500 bg-amber-500 text-white"
                            : "border-zinc-300 text-zinc-500 dark:border-zinc-600 dark:text-zinc-400"
                        }`}>
                          {CHOICE_LABELS[cIdx] ?? cIdx + 1}
                        </span>
                        <span className="flex-1 leading-snug">{choice}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Submit area */}
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center dark:border-zinc-700 dark:bg-zinc-900">
            {autoSubmitted ? (
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                ⏱ Time&apos;s up — submitting your answers now…
              </p>
            ) : (
              <>
                <p className="mb-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {allAnswered ? "All questions answered — ready to submit!" : `${totalQuestions - answeredCount} question${totalQuestions - answeredCount !== 1 ? "s" : ""} remaining`}
                </p>
                <p className="mb-5 text-xs text-zinc-400 dark:text-zinc-500">
                  You can&apos;t change your answers after submitting.
                </p>
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(true)}
                  disabled={submitting || !allAnswered}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/25 transition-all hover:-translate-y-0.5 hover:bg-amber-500 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit exam
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
                {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
              </>
            )}
          </div>
        </div>

        {/* ── Sidebar: question navigator ──────────────────────────────────── */}
        <aside className="hidden lg:block lg:w-52 lg:shrink-0">
          <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Questions
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {attempt.questions.map((q, idx) => {
                const answered = answers[q.id] !== undefined;
                const active = activeQuestion === idx;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => scrollToQuestion(idx)}
                    title={`Question ${idx + 1}${answered ? " (answered)" : ""}`}
                    className={`flex h-8 w-full items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                      answered
                        ? "bg-amber-500 text-white shadow-sm"
                        : active
                        ? "border border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 space-y-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-amber-500" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-zinc-200 dark:bg-zinc-700" />
                <span>Unanswered ({totalQuestions - answeredCount})</span>
              </div>
            </div>

            <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                disabled={!allAnswered || submitting}
                className="w-full rounded-xl bg-amber-600 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit exam
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <ConfirmModal
        open={showSubmitConfirm}
        id="submit-confirm-title"
        title="Submit your exam?"
        body="You won't be able to change your answers after submitting. Your score will be calculated immediately."
        cancelLabel="Keep reviewing"
        confirmLabel="Submit now"
        onCancel={() => setShowSubmitConfirm(false)}
        onConfirm={() => { setShowSubmitConfirm(false); void handleSubmit(); }}
      />
      <ConfirmModal
        open={showLeaveConfirm}
        id="leave-confirm-title"
        title="Leave this attempt?"
        body="Your current answers will be lost. You can start a new attempt from the certifications page."
        cancelLabel="Stay"
        confirmLabel="Leave attempt"
        onCancel={() => setShowLeaveConfirm(false)}
        onConfirm={confirmLeave}
        danger
      />
    </div>
  );
}
