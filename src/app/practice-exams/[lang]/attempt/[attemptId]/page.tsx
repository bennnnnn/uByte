"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { EXAM_DURATION_MINUTES } from "@/lib/exams/config";
import type { AttemptPayload, SubmitExamResponse } from "@/lib/exams/api-types";
import { parseJson, getApiErrorMessage } from "@/lib/fetch-utils";

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
  const [passPercent, setPassPercent] = useState(70);

  useEffect(() => {
    fetch("/api/site-settings").then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.passPercentByLang?.[lang]) setPassPercent(d.passPercentByLang[lang]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/practice-exams/attempt/${attemptId}`, {
          credentials: "same-origin",
        });
        const data = await parseJson<AttemptPayload & { error?: string }>(res);
        if (cancelled) return;

        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (res.status === 403) {
          router.replace("/practice-exams");
          return;
        }
        if (!res.ok) {
          setError(getApiErrorMessage(res, data, "Unable to load exam."));
          return;
        }

        setAttempt(data as AttemptPayload);
      } catch {
        if (!cancelled) setError("Network error. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [attemptId, router]);

  const handleChange = (qid: number, idx: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  };

  const totalQuestions = attempt?.questions.length ?? 0;
  const answeredCount = useMemo(
    () => (attempt ? Object.keys(answers).length : 0),
    [answers, attempt]
  );
  const allAnswered = !!attempt && answeredCount === totalQuestions;

  const handleSubmit = async (opts?: { force?: boolean }) => {
    if (!attempt) return;
    if (!opts?.force && !allAnswered) {
      setError("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/practice-exams/attempt/${attempt.attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
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

      router.push(`/practice-exams/${lang}/result/${attempt.attemptId}?${params.toString()}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const handleSwitchLanguage = (nextLang: string) => {
    if (nextLang === lang) return;
    setPendingLeaveUrl(`/practice-exams/${nextLang}`);
    setShowLeaveConfirm(true);
  };

  const confirmLeave = useCallback(() => {
    if (pendingLeaveUrl) router.push(pendingLeaveUrl);
    setShowLeaveConfirm(false);
    setPendingLeaveUrl(null);
  }, [pendingLeaveUrl, router]);

  const cancelLeave = useCallback(() => {
    setShowLeaveConfirm(false);
    setPendingLeaveUrl(null);
  }, []);

  // Prevent accidental tab close/refresh during attempt
  useEffect(() => {
    if (!attempt || autoSubmitted) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [attempt, autoSubmitted]);

  const durationMinutes = attempt?.durationMinutes ?? EXAM_DURATION_MINUTES;

  // Timer — count down from durationMinutes based on attempt.startedAt
  useEffect(() => {
    if (!attempt) return;
    const durationSec = durationMinutes * 60;
    const startedMs = new Date(attempt.startedAt).getTime();
    if (Number.isNaN(startedMs)) return;
    const computeRemaining = () =>
      Math.max(0, durationSec - Math.floor((Date.now() - startedMs) / 1000));

    setRemainingSeconds(computeRemaining());

    let alreadyAutoSubmitted = false;
    const id = window.setInterval(() => {
      const rem = computeRemaining();
      setRemainingSeconds(rem);
      if (rem <= 0 && !alreadyAutoSubmitted) {
        alreadyAutoSubmitted = true;
        setAutoSubmitted(true);
        // Force submit even if some answers are missing; unanswered count as incorrect.
        void handleSubmit({ force: true });
        window.clearInterval(id);
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [attempt, durationMinutes]);

  const minutes = remainingSeconds != null ? Math.floor(remainingSeconds / 60) : null;
  const seconds = remainingSeconds != null ? remainingSeconds % 60 : null;
  const timeLabel =
    minutes != null && seconds != null
      ? `${minutes}:${seconds.toString().padStart(2, "0")}`
      : "—";
  const timeFraction =
    remainingSeconds != null && attempt
      ? Math.max(0, Math.min(1, remainingSeconds / (durationMinutes * 60)))
      : 1;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-400" />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Loading exam…</span>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="mb-3 text-sm text-red-500 dark:text-red-400">
            {error || "Exam not found."}
          </p>
          <Link
            href="/practice-exams"
            className="text-sm font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400"
          >
            ← Back to practice exams
          </Link>
        </div>
      </div>
    );
  }

  const langConfig = LANGUAGES[attempt.lang as SupportedLanguage];

  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Practice exam
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {langConfig?.name ?? attempt.lang} Exam
            </h1>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {totalQuestions} multiple-choice questions · {passPercent}% to pass ·{" "}
              {durationMinutes} minute time limit
            </p>
          </div>

          {/* Switch language */}
          <div className="flex items-center gap-2">
            <label htmlFor="switch-lang" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Switch language
            </label>
            <select
              id="switch-lang"
              className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              value={attempt.lang}
              onChange={(e) => handleSwitchLanguage(e.target.value)}
            >
              {(["go", "python", "cpp", "javascript", "java", "rust"] as SupportedLanguage[]).map(
                (l) => (
                  <option key={l} value={l}>
                    {LANGUAGES[l]?.name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Timer + progress summary */}
        <div className="mb-6 grid gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-xs shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30 sm:grid-cols-3">
          <div>
            <p className="mb-1 font-semibold text-amber-900 dark:text-amber-200">Time remaining</p>
            <div className="flex items-baseline gap-2">
              <span
                className={
                  "inline-flex items-center rounded-full px-2.5 py-1 text-sm font-semibold " +
                  (remainingSeconds != null && remainingSeconds <= 5 * 60
                    ? "bg-red-600 text-white"
                    : remainingSeconds != null && remainingSeconds <= 15 * 60
                    ? "bg-amber-600 text-white"
                    : "bg-emerald-600 text-white")
                }
              >
                {timeLabel}
              </span>
              <span className="text-[11px] text-amber-900/70 dark:text-amber-100/80">
                Exam auto-submits when time is up.
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/60">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${timeFraction * 100}%` }}
              />
            </div>
          </div>
          <div>
            <p className="mb-1 font-semibold text-amber-900 dark:text-amber-200">Questions answered</p>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-50">
              {answeredCount} / {totalQuestions}
            </p>
            <p className="mt-1 text-[11px] text-amber-900/70 dark:text-amber-100/80">
              You must answer all questions before submitting.
            </p>
          </div>
          <div>
            <p className="mb-1 font-semibold text-amber-900 dark:text-amber-200">Jump to question</p>
            <div className="flex flex-wrap gap-1.5">
              {attempt.questions.map((q, idx) => {
                const answered = answers[q.id] !== undefined;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`q-${q.id}`);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={
                      "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors " +
                      (answered
                        ? "border-amber-600 bg-amber-600 text-white"
                        : "border-amber-200 bg-white text-amber-700 hover:border-amber-400 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200")
                    }
                    aria-label={`Go to question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-5">
          {attempt.questions.map((q, idx) => (
            <div
              key={q.id}
              id={`q-${q.id}`}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              role="group"
              aria-labelledby={`q-${q.id}-label`}
            >
              <p id={`q-${q.id}-label`} className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                <span className="mr-1.5 text-xs text-zinc-400">Q{idx + 1}.</span>
                {q.prompt}
              </p>
              <div
                className="space-y-2"
                role="radiogroup"
                aria-labelledby={`q-${q.id}-label`}
              >
                {q.choices.map((choice, cIdx) => (
                  <label
                    key={cIdx}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-sm hover:border-amber-300 hover:bg-amber-50 dark:hover:border-amber-700 dark:hover:bg-amber-950/30"
                  >
                    <input
                      type="radio"
                      className="h-4 w-4 border-zinc-300 text-amber-600 focus:ring-amber-500"
                      name={`q-${q.id}`}
                      value={cIdx}
                      checked={answers[q.id] === cIdx}
                      onChange={() => handleChange(q.id, cIdx)}
                      aria-describedby={`q-${q.id}-label`}
                    />
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {choice}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => (allAnswered ? setShowSubmitConfirm(true) : void handleSubmit())}
            disabled={submitting || !allAnswered || autoSubmitted}
            className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit exam"}
          </button>
          {!allAnswered && !autoSubmitted && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Answer all questions to enable the submit button.
            </p>
          )}
          {autoSubmitted && (
            <p className="text-xs text-red-500 dark:text-red-400">
              Time is up. Your exam is being submitted with the answers you provided.
            </p>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
      </div>

      {/* Submit confirmation modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="submit-confirm-title">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h2 id="submit-confirm-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Submit exam?
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              You can&apos;t change your answers after submitting. Your score will be calculated and you&apos;ll see the result.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 rounded-xl border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={() => { setShowSubmitConfirm(false); void handleSubmit(); }}
                className="flex-1 rounded-xl bg-amber-600 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave attempt confirmation modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="leave-confirm-title">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h2 id="leave-confirm-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Leave this attempt?
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Your progress will be lost. You can start a new attempt from the exam page.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={cancelLeave}
                className="flex-1 rounded-xl border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={confirmLeave}
                className="flex-1 rounded-xl bg-amber-600 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

