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

// ── Constants ─────────────────────────────────────────────────────────────────
const CHOICE_LABELS = ["A", "B", "C", "D", "E", "F"];
const PAGE_SIZE = 10;

// ── Pre-exam warning overlay ──────────────────────────────────────────────────
function ExamStartWarning({
  langName, totalQuestions, passPercent, durationMinutes, onStart, onLeave,
}: {
  langName: string; totalQuestions: number; passPercent: number;
  durationMinutes: number; onStart: () => void; onLeave: () => void;
}) {
  async function handleStart() {
    try {
      await document.documentElement.requestFullscreen();
    } catch { /* fullscreen unavailable — proceed anyway */ }
    onStart();
  }

  const rules: { text: string; type: "info" | "warn" | "danger" }[] = [
    { text: `${totalQuestions} questions · ${passPercent}% correct required to pass`, type: "info" },
    { text: `${durationMinutes}-minute time limit · the timer is already running`, type: "info" },
    { text: "Navigating away or switching tabs will automatically submit your exam", type: "danger" },
    { text: "Answers are final once submitted and cannot be changed", type: "warn" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl dark:bg-zinc-900">
        {/* Icon */}
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/40">
          <svg className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h1 className="mb-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">Before you begin</h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          You are about to take the{" "}
          <strong className="font-semibold text-zinc-700 dark:text-zinc-200">{langName}</strong> certification exam.
        </p>

        <ul className="mb-7 space-y-3">
          {rules.map(({ text, type }, i) => (
            <li key={text} className="flex items-start gap-3 text-sm">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                type === "danger"
                  ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                  : type === "warn"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              }`}>
                {i + 1}
              </span>
              <span className={`leading-snug ${
                type === "danger"
                  ? "font-semibold text-red-700 dark:text-red-300"
                  : type === "warn"
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-zinc-600 dark:text-zinc-300"
              }`}>
                {text}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex gap-3">
          <button type="button" onClick={onLeave}
            className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            Not now
          </button>
          <button type="button" onClick={handleStart}
            className="flex-1 rounded-xl bg-amber-600 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5 hover:bg-amber-500">
            I understand — start exam
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
          The exam will enter fullscreen for better focus
        </p>
      </div>
    </div>
  );
}

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
  const isUrgent  = remainingSeconds != null && remainingSeconds <= 5 * 60;
  const isWarning = remainingSeconds != null && remainingSeconds <= 15 * 60;

  const minutes = remainingSeconds != null ? Math.floor(remainingSeconds / 60) : null;
  const seconds = remainingSeconds != null ? remainingSeconds % 60 : null;
  const label = minutes != null && seconds != null
    ? `${minutes}:${seconds.toString().padStart(2, "0")}`
    : "—";

  const fraction = remainingSeconds != null
    ? Math.max(0, Math.min(1, remainingSeconds / (durationMinutes * 60)))
    : 1;

  const R = 20;
  const C = 2 * Math.PI * R;
  const dash = fraction * C;

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
        <svg className="-rotate-90" width="56" height="56" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={R} fill="none" strokeWidth="3.5" className="stroke-zinc-200 dark:stroke-zinc-700" />
          <circle cx="28" cy="28" r={R} fill="none" strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
            className={isUrgent ? "stroke-red-500 transition-all" : isWarning ? "stroke-amber-500 transition-all" : "stroke-emerald-500 transition-all"}
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
  const [tabViolation, setTabViolation] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingLeaveUrl, setPendingLeaveUrl] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const passPercent = usePassPercent(lang);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Queue a scroll to this question index after the next render
  const pendingScrollRef = useRef<number | null>(null);
  // Prevent concurrent submit calls (timer expiry + tab-switch can fire simultaneously)
  const submitInProgressRef = useRef(false);

  // ── Load attempt ────────────────────────────────────────────────────────────
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

  // Visible questions — grow in PAGE_SIZE increments as the user progresses
  const visibleQuestions = useMemo(
    () => attempt?.questions.slice(0, Math.min(visibleCount, totalQuestions)) ?? [],
    [attempt, visibleCount, totalQuestions]
  );

  // ── Scroll queue — fires after every render ──────────────────────────────
  useEffect(() => {
    if (pendingScrollRef.current === null) return;
    const idx = pendingScrollRef.current;
    const el = questionRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      pendingScrollRef.current = null;
    }
  });

  // ── Track fullscreen state ───────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const reEnterFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  // ── Handle answer change ─────────────────────────────────────────────────
  const handleChange = useCallback((qid: number, choiceIdx: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: choiceIdx }));
  }, []);

  // ── Auto-advance to next page when all visible questions are answered ────
  useEffect(() => {
    if (!attempt || visibleCount >= totalQuestions) return;
    const allVisibleDone = visibleQuestions.every((q) => answers[q.id] !== undefined);
    if (!allVisibleDone) return;
    const nextStart = visibleCount;
    const timer = setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, totalQuestions));
      pendingScrollRef.current = nextStart;
    }, 600);
    return () => clearTimeout(timer);
  }, [answers, attempt, visibleCount, visibleQuestions, totalQuestions]);

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (opts?: { force?: boolean }) => {
    if (!attempt) return;
    if (!opts?.force && !allAnswered) return;
    // Guard against concurrent calls (timer + tab-switch can both fire at expiry)
    if (submitInProgressRef.current) return;
    submitInProgressRef.current = true;
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
        submitInProgressRef.current = false;
        return;
      }
      const { score, passed, certificateId } = data;
      const params = new URLSearchParams();
      params.set("score", String(score));
      params.set("passed", passed ? "1" : "0");
      params.set("total", String(totalQuestions));
      if (certificateId) params.set("cert", certificateId);
      // Exit fullscreen before navigating away
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      router.push(`/certifications/${lang}/result/${attempt.attemptId}?${params.toString()}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
      submitInProgressRef.current = false;
    }
  }, [allAnswered, answers, attempt, lang, router, totalQuestions]);

  // ── Language switch ──────────────────────────────────────────────────────
  const handleSwitchLanguage = (nextLang: string) => {
    if (nextLang === lang) return;
    setPendingLeaveUrl(`/certifications/${nextLang}`);
    setShowLeaveConfirm(true);
  };

  const confirmLeave = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (pendingLeaveUrl) router.push(pendingLeaveUrl);
    setShowLeaveConfirm(false);
    setPendingLeaveUrl(null);
  }, [pendingLeaveUrl, router]);

  // ── beforeunload protection ──────────────────────────────────────────────
  useEffect(() => {
    if (!attempt || autoSubmitted) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [attempt, autoSubmitted]);

  // ── Tab-switch auto-submit ───────────────────────────────────────────────
  useEffect(() => {
    if (!attempt || autoSubmitted || !examStarted) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabViolation(true);
        setAutoSubmitted(true);
        void handleSubmit({ force: true });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [attempt, autoSubmitted, examStarted, handleSubmit]);

  // ── Timer ────────────────────────────────────────────────────────────────
  const durationMinutes = attempt?.durationMinutes ?? EXAM_DURATION_MINUTES;

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

  // ── Active question via IntersectionObserver ─────────────────────────────
  useEffect(() => {
    if (!attempt) return;
    const observers: IntersectionObserver[] = [];
    visibleQuestions.forEach((_, idx) => {
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
  }, [attempt, visibleQuestions]);

  const scrollToQuestion = (idx: number) => {
    questionRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Sidebar: jump to any question, expanding pages as needed ────────────
  const jumpToQuestion = (idx: number) => {
    if (idx >= visibleCount) {
      // Expand pages to include this question
      setVisibleCount(Math.ceil((idx + 1) / PAGE_SIZE) * PAGE_SIZE);
      pendingScrollRef.current = idx;
    } else {
      scrollToQuestion(idx);
    }
  };

  // ── Loading / error states ───────────────────────────────────────────────
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
  const allVisibleAnswered = visibleQuestions.every((q) => answers[q.id] !== undefined);
  const hasMoreToLoad = visibleCount < totalQuestions;

  return (
    <div className="min-h-full bg-surface-page">

      {/* ── Pre-exam warning overlay ──────────────────────────────────────── */}
      {!examStarted && (
        <ExamStartWarning
          langName={langConfig?.name ?? attempt.lang}
          totalQuestions={totalQuestions}
          passPercent={passPercent}
          durationMinutes={durationMinutes}
          onStart={() => setExamStarted(true)}
          onLeave={() => router.push(`/certifications/${lang}`)}
        />
      )}

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

          {/* Progress pill — visible on all sizes, label hidden on xs */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-800">
              <span className={answeredCount === totalQuestions ? "text-emerald-600" : "text-zinc-500"}>
                {answeredCount}/{totalQuestions}
              </span>
              <span className="hidden text-zinc-400 sm:inline">answered</span>
            </div>
          </div>

          {/* Timer */}
          <TimerDisplay remainingSeconds={remainingSeconds} durationMinutes={durationMinutes} />

          {/* Fullscreen re-enter button — shown when fullscreen was exited */}
          {examStarted && !isFullscreen && (
            <button
              type="button"
              onClick={reEnterFullscreen}
              title="Re-enter fullscreen"
              className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300 sm:flex"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
              Fullscreen
            </button>
          )}

          {/* Switch language */}
          <select
            id="exam-language"
            name="language"
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

        {/* Fullscreen-exit warning bar */}
        {examStarted && !isFullscreen && (
          <div className="flex items-center justify-center gap-2 bg-amber-50 px-4 py-1.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            Fullscreen exited — switching tabs will auto-submit your exam.
            <button type="button" onClick={reEnterFullscreen}
              className="ml-1 underline underline-offset-2 hover:no-underline">
              Re-enter fullscreen
            </button>
          </div>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:flex lg:gap-8">

        {/* Questions */}
        <div className="min-w-0 flex-1 space-y-5">

          {/* Page label */}
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Questions {1}–{visibleQuestions.length} of {totalQuestions}
          </p>

          {visibleQuestions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            return (
              <div
                key={q.id}
                id={`q-${q.id}`}
                ref={(el) => { questionRefs.current[idx] = el; }}
                className={`scroll-mt-28 rounded-2xl border p-5 transition-all ${
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

                {/* Choices */}
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

          {/* Load next page button — shown when current page is fully answered */}
          {hasMoreToLoad && (
            <div className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              allVisibleAnswered
                ? "border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20"
                : "border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50"
            }`}>
              {allVisibleAnswered ? (
                <>
                  <p className="mb-1 text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Page complete! {totalQuestions - visibleCount} questions remaining.
                  </p>
                  <p className="mb-4 text-xs text-zinc-400 dark:text-zinc-500">
                    Continue to questions {visibleCount + 1}–{Math.min(visibleCount + PAGE_SIZE, totalQuestions)}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const nextStart = visibleCount;
                      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, totalQuestions));
                      pendingScrollRef.current = nextStart;
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/25 transition-all hover:-translate-y-0.5 hover:bg-amber-500"
                  >
                    Next {Math.min(PAGE_SIZE, totalQuestions - visibleCount)} questions
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </>
              ) : (
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  Answer all {visibleQuestions.length} questions above to continue.
                </p>
              )}
            </div>
          )}

          {/* Submit area — shown only when all questions are loaded */}
          {!hasMoreToLoad && (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center dark:border-zinc-700 dark:bg-zinc-900">
              {autoSubmitted ? (
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {tabViolation
                    ? "Tab switch detected — auto-submitting your exam…"
                    : "⏱ Time's up — submitting your answers now…"}
                </p>
              ) : (
                <>
                  <p className="mb-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {allAnswered
                      ? "All questions answered — ready to submit!"
                      : `${totalQuestions - answeredCount} question${totalQuestions - answeredCount !== 1 ? "s" : ""} remaining`}
                  </p>
                  <p className="mb-5 text-xs text-zinc-400 dark:text-zinc-500">
                    You can't change your answers after submitting.
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
          )}
        </div>

        {/* ── Sidebar: question navigator ──────────────────────────────────── */}
        <aside className="hidden lg:block lg:w-56 lg:shrink-0">
          <div className="sticky top-28 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Questions
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {attempt.questions.map((q, idx) => {
                const answered = answers[q.id] !== undefined;
                const active   = activeQuestion === idx;
                const loaded   = idx < visibleCount;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => jumpToQuestion(idx)}
                    title={`Question ${idx + 1}${answered ? " (answered)" : !loaded ? " (not yet loaded)" : ""}`}
                    className={`flex h-8 w-full items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                      answered
                        ? "bg-amber-500 text-white shadow-sm"
                        : active
                          ? "border border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : !loaded
                            ? "border border-dashed border-zinc-300 bg-white text-zinc-300 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-600"
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
                <span>Unanswered ({Math.max(0, visibleCount - answeredCount)})</span>
              </div>
              {hasMoreToLoad && (
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-dashed border-zinc-300 dark:border-zinc-600" />
                  <span>Not yet shown ({totalQuestions - visibleCount})</span>
                </div>
              )}
            </div>

            {!hasMoreToLoad && (
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
            )}
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
