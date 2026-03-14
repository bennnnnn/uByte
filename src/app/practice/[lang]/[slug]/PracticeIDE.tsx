"use client";

import { useState, useCallback, useEffect, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { DIFFICULTY_BADGE, type PracticeProblem, type ProblemCategory } from "@/lib/practice/types";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getStarterForLanguage, getAllPracticeProblems, getCategoryForSlug, getPracticeCategories, sortProblemsByCategoryAndDifficulty } from "@/lib/practice/problems";
import { useCodeEditor } from "@/hooks/useCodeEditor";
import { usePanelResize } from "@/hooks/usePanelResize";
import ThemeToggle from "@/components/ThemeToggle";
import AuthButtons from "@/components/AuthButtons";
import ProblemSidebar from "@/components/practice/ProblemSidebar";
import GripDots from "@/components/GripDots";
import type { PracticeAttemptStatus } from "@/lib/db/practice-attempts";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";
import { trackConversion } from "@/lib/analytics";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import GuestConversionPrompt from "@/components/GuestConversionPrompt";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { OutputPanel, type VerdictState } from "./OutputPanel";
import { useShareCode } from "@/hooks/useShareCode";
import { useEditorKeyDown } from "@/hooks/useEditorKeyDown";
import DiscussionThread from "./DiscussionThread";

const LANG_ORDER = ALL_LANGUAGE_KEYS;

interface Props {
  problem: PracticeProblem;
  initialLang: SupportedLanguage;
  /** Pre-filled code from a ?share= URL param — overrides the default starter code. */
  initialCode?: string;
  /** When set, sidebar shows only problems in this category (matches list filter). */
  categoryFilter?: ProblemCategory | null;
  /** Page number on the list; used for "back to list" link. */
  listPage?: number;
  /** Status filter on the list (solved / unsolved); preserved in sidebar links. */
  listStatus?: "solved" | "unsolved";
  /** Difficulty filter on the list; preserved in sidebar links. */
  listDifficulty?: string;
  /** When true, shows a countdown timer and full AI debrief on submit. */
  interviewMode?: boolean;
  /** Unix timestamp (ms) when the interview session expires. */
  interviewDeadline?: number;
}

export function PracticeIDE({ problem, initialLang, initialCode, categoryFilter = null, listPage = 1, listStatus, listDifficulty, interviewMode = false, interviewDeadline }: Props) {
  const allProblems = useMemo(() => getAllPracticeProblems(), []);
  const categories = useMemo(() => getPracticeCategories(), []);
  const sidebarProblems = useMemo(() =>
    categoryFilter === null || categoryFilter === undefined
      ? allProblems
      : sortProblemsByCategoryAndDifficulty(
          allProblems.filter((p) => getCategoryForSlug(p.slug) === categoryFilter),
          categories
        ),
    [allProblems, categories, categoryFilter]
  );
  const { user } = useAuth();
  const [lang, setLang] = useState<SupportedLanguage>(initialLang);
  const [output, setOutput]           = useState<string | null>(null);
  const [running, setRunning]         = useState(false);
  const [outputIsError, setOutputIsError] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab]     = useState<"desc" | "code">("desc");
  const isMobile = useIsMobile();
  // Bookmark — persistent toggle (load from DB on mount)
  const [bookmarkId, setBookmarkId] = useState<number | null>(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const bookmarked = bookmarkId !== null;

  // Notes (per-problem, persisted in localStorage)
  const [descTab, setDescTab] = useState<"desc" | "notes" | "discuss">("desc");
  const [notes, setNotes] = useState<string>("");
  const notesKey = `practice-notes-${problem.slug}`;
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteCollapsed, setNoteCollapsed] = useState(false);

  // Reset collapsed state when navigating to a different problem
  useEffect(() => {
    setNoteCollapsed(false);
  }, [problem.slug]);

  // Manual save — cancels the debounce timer, saves immediately, then collapses the field
  async function saveNotesNow() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (user) {
      await apiFetch("/api/practice-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: problem.slug, note: notes }),
      }).catch(() => {});
    } else {
      try { localStorage.setItem(notesKey, notes); } catch { /* ignore */ }
    }
    setNoteSaved(true);
    setNoteCollapsed(true);
    setTimeout(() => setNoteSaved(false), 2000);
  }

  const [statuses, setStatuses] = useState<Record<string, PracticeAttemptStatus>>({});
  const [xpToast, setXpToast] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState<VerdictState>(null);
  const [aiFeedback, setAiFeedback] = useState<{
    friendly_one_liner: string;
    hint: string;
    next_step: string;
    minimal_patch?: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiUpgradeRequired, setAiUpgradeRequired] = useState(false);
  const [aiLoginRequired, setAiLoginRequired] = useState(false);
  const [codeReview, setCodeReview] = useState<import("@/lib/ai/code-review-client").CodeReviewSchema | null>(null);
  const [codeReviewLoading, setCodeReviewLoading] = useState(false);
  const [codeReviewUpgrade, setCodeReviewUpgrade] = useState(false);
  const [interviewTimeLeft, setInterviewTimeLeft] = useState<number | null>(
    interviewDeadline ? Math.max(0, Math.round((interviewDeadline - Date.now()) / 1000)) : null
  );

  // Use shared code from ?share= if present, otherwise fall back to the problem's starter
  const editor = useCodeEditor(initialCode ?? getStarterForLanguage(problem, initialLang), lang);
  const { leftWidth, outputHeight, setOutputHeight, isDragging, startDragH, startDragV, startDragVTouch } = usePanelResize();

  // On mount: load saved draft from DB (share param wins — don't overwrite it)
  useEffect(() => {
    if (initialCode) return;
    if (!user) return; // guests have no draft to load
    apiFetch(`/api/practice-code?slug=${encodeURIComponent(problem.slug)}&lang=${encodeURIComponent(lang)}`)
      .then((r) => r.json())
      .then((d) => { if (typeof d?.code === "string" && d.code) editor.setCode(d.code); })
      .catch(() => {});
    // editor and initialCode omitted: editor is an imperative handle (not state),
    // initialCode is a one-time mount value. user?.id used instead of user to avoid
    // re-running on unrelated profile changes (e.g. XP, streak).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem.slug, user?.id]);

  // Debounce-save code draft to DB on every change (1 s idle, logged-in only)
  const codeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userRef2 = useRef(user);
  userRef2.current = user;
  useEffect(() => {
    if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
    codeTimerRef.current = setTimeout(() => {
      if (!userRef2.current) return; // guests — no save
      apiFetch("/api/practice-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: problem.slug, lang, code: editor.code }),
      }).catch(() => {});
    }, 1000);
    return () => { if (codeTimerRef.current) clearTimeout(codeTimerRef.current); };
    // user omitted: accessed via userRef2 inside the timeout so it's always fresh
    // without needing to be a dep (which would reset the debounce timer on every auth event).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.code, problem.slug, lang]);

  // When language changes, load the saved draft for that lang (or fall back to starter)
  const prevLangRef = useRef(lang);
  useEffect(() => {
    if (lang === prevLangRef.current) return;
    prevLangRef.current = lang;
    setOutput(null);
    if (!user) {
      editor.setCode(getStarterForLanguage(problem, lang));
      return;
    }
    apiFetch(`/api/practice-code?slug=${encodeURIComponent(problem.slug)}&lang=${encodeURIComponent(lang)}`)
      .then((r) => r.json())
      .then((d) => {
        editor.setCode(typeof d?.code === "string" && d.code ? d.code : getStarterForLanguage(problem, lang));
      })
      .catch(() => editor.setCode(getStarterForLanguage(problem, lang)));
  }, [lang, problem, editor, user]);

  // Record page view
  useEffect(() => {
    apiFetch("/api/practice-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: problem.slug }),
    }).catch(() => {});
  }, [problem.slug]);

  // Save last activity for "You left off at..." (logged-in only)
  useEffect(() => {
    apiFetch("/api/last-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "practice", lang, slug: problem.slug }),
    }).catch(() => {});
  }, [lang, problem.slug]);

  // Load attempt statuses for all problems (to show circles in sidebar)
  useEffect(() => {
    fetch("/api/practice-attempt", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => { if (d?.attempts) setStatuses(d.attempts); })
      .catch(() => {});
  }, []);

  // Interview mode countdown timer
  useEffect(() => {
    if (!interviewMode || !interviewDeadline) return;
    const tick = () => {
      const remaining = Math.max(0, Math.round((interviewDeadline - Date.now()) / 1000));
      setInterviewTimeLeft(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [interviewMode, interviewDeadline]);

  // Load bookmark state for this problem on mount
  useEffect(() => {
    if (!user) return;
    fetch(`/api/bookmarks?lang=${encodeURIComponent(lang)}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        const match = (d?.bookmarks ?? []).find(
          (b: { id: number; tutorial_slug: string }) => b.tutorial_slug === `practice:${problem.slug}`
        );
        setBookmarkId(match?.id ?? null);
      })
      .catch(() => {});
    // user?.id instead of user: only re-fetch when the logged-in identity changes,
    // not on unrelated profile updates. lang omitted — bookmarks are per-problem, not per-lang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, problem.slug]);

  // Load notes: DB for logged-in users, localStorage for guests
  useEffect(() => {
    if (user) {
      fetch(`/api/practice-notes?slug=${encodeURIComponent(problem.slug)}`, { credentials: "same-origin" })
        .then((r) => r.json())
        .then((d) => { if (typeof d?.note === "string") setNotes(d.note); })
        .catch(() => {
          try { setNotes(localStorage.getItem(notesKey) ?? ""); } catch { /* ignore */ }
        });
    } else {
      try { setNotes(localStorage.getItem(notesKey) ?? ""); } catch { /* ignore */ }
    }
    // user?.id instead of user: only reload notes when identity changes, not on profile updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem.slug, user?.id]);

  // Keep a ref to user so the debounced save always sees the latest auth state
  const userRef = useRef(user);
  userRef.current = user;

  // Save notes: debounced — DB for logged-in users, localStorage for guests
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (userRef.current) {
        apiFetch("/api/practice-notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: problem.slug, note: notes }),
        }).catch(() => {});
      } else {
        try { localStorage.setItem(notesKey, notes); } catch { /* ignore */ }
      }
    }, 800);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
    // user omitted: accessed via userRef inside the timeout so it's always current
    // without resetting the debounce timer on every auth state change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, problem.slug]);


  // Keep a ref so handleSubmit/handleRun can always read the latest outputHeight
  // without needing it as a useCallback dependency.
  const outputHeightRef = useRef(outputHeight);
  outputHeightRef.current = outputHeight;


  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput(null);
    setOutputIsError(false);
    try {
      const res = await apiFetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editor.code, language: lang }),
      });
      const data = await res.json();

      if (res.status === 429) { setOutput("Too many requests. Please wait a moment before running again."); setOutputIsError(true); return; }
      if (res.status === 504) { setOutput("Request timed out. Try simpler or faster code."); setOutputIsError(true); return; }
      if (!res.ok)            { setOutput(data?.Errors ?? data?.error ?? "Run failed."); setOutputIsError(true); return; }

      const out: string[] = [];
      if (data.CompileErrors) { out.push("Compile error:\n" + data.CompileErrors); setOutputIsError(true); }
      if (data.Errors)        { out.push(data.Errors); setOutputIsError(true); }
      if (data.Events)        { for (const e of data.Events) { if (e.Message) out.push(e.Message); } }
      setOutput(out.length ? out.join("\n") : "(no output)");
    } catch {
      setOutput("Network error. Please try again.");
      setOutputIsError(true);
    } finally {
      setRunning(false);
    }
  }, [editor.code, lang, problem.slug]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setVerdict(null);
    // Intentionally do NOT clear aiFeedback here — keep the hint visible during re-submit.
    // It is cleared on accept (problem solved) or when the user manually dismisses it.
    setAiError(null);
    try {
      // Must use apiFetch (not fetch) so the x-csrf-token header is included;
      // plain fetch omits it and the route returns 403 { error: "Missing CSRF token" }.
      const res = await apiFetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem_id: problem.slug, code: editor.code, language: lang }),
      });
      const data = await res.json();

      if (!res.ok) {
        setVerdict({ type: "error", message: data?.error ?? data?.message ?? `Server error (${res.status})` });
        setOutputHeight(Math.max(outputHeightRef.current, 400));
        return;
      }
      const v = {
        type:                data.verdict,
        message:            data.message,
        output:              data.output,
        passedCases:        data.passedCases,
        totalCases:         data.totalCases,
        submissionId:       data.submission_id,
        failedInput:        data.failedInput,
        failedExpected:     data.failedExpected,
        failedActual:       data.failedActual,
        consecutiveFailures: data.consecutive_failures,
      };
      setVerdict(v);
      // Expand the panel immediately so chips + detail are visible without scrolling
      setOutputHeight(Math.max(outputHeightRef.current, 400));

      if (data.verdict === "accepted") {
        setStatuses((prev) => ({ ...prev, [problem.slug]: "solved" }));
        // Track the conversion event for PostHog / Vercel Analytics funnel.
        trackConversion("problem_solved", { lang: String(lang), slug: problem.slug, difficulty: problem.difficulty });
        setAiFeedback(null);  // Problem solved — clear hint so panel is clean.
        setAiUpgradeRequired(false);
        setAiLoginRequired(false);
        // In interview mode, auto-trigger the full code review on solve
        if (interviewMode && user) {
          setTimeout(() => requestCodeReview(), 300);
        }
        if (data.xpAwarded > 0) {
          setXpToast(data.xpAwarded);
          setTimeout(() => setXpToast(null), 3500);
        }
      } else if (["wrong_answer", "runtime_error", "compile_error", "tle"].includes(data.verdict)) {
        setStatuses((prev) => ({ ...prev, [problem.slug]: "failed" }));
        // Only auto-trigger AI for logged-in users when no hint is already showing.
        if (user && data.consecutive_failures >= 2 && data.submission_id && !aiFeedback && !aiLoading) {
          setAiLoading(true);
          setAiError(null);
          setAiUpgradeRequired(false);
          apiFetch("/api/ai-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ submission_id: data.submission_id, hint_level: 1 }),
          })
            .then(async (res) => {
              const d = await res.json();
              if (res.status === 402 && d?.error === "upgrade_required") {
                setAiUpgradeRequired(true);
              } else if (res.ok && d?.friendly_one_liner != null) {
                setAiFeedback({
                  friendly_one_liner: d.friendly_one_liner ?? "",
                  hint: d.hint ?? "",
                  next_step: d.next_step ?? "",
                  minimal_patch: d.minimal_patch,
                });
              } else {
                setAiError(d?.message ?? d?.error ?? "Request failed");
              }
            })
            .catch(() => setAiError("Network error"))
            .finally(() => setAiLoading(false));
        }
      }
    } catch {
      setVerdict({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }, [editor.code, lang, problem.slug, aiFeedback, aiLoading]);

  const requestAiFeedback = useCallback(async () => {
    // Guest users — show a sign-in prompt instead of calling the API.
    if (!user) {
      setAiLoginRequired(true);
      return;
    }
    const sid = verdict?.submissionId;
    if (!sid) return;
    setAiLoading(true);
    setAiError(null);
    // Keep the existing hint visible while the new one loads — don't blank it eagerly.
    setAiUpgradeRequired(false);
    try {
      const res = await apiFetch("/api/ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: sid, hint_level: 1 }),
      });
      const data = await res.json();
      if (res.status === 402 && data?.error === "upgrade_required") {
        setAiUpgradeRequired(true);
        return;
      }
      if (!res.ok) {
        setAiError(data?.message ?? data?.error ?? "Request failed");
        return;
      }
      setAiFeedback({
        friendly_one_liner: data.friendly_one_liner ?? "",
        hint: data.hint ?? "",
        next_step: data.next_step ?? "",
        minimal_patch: data.minimal_patch,
      });
    } catch {
      setAiError("Network error");
    } finally {
      setAiLoading(false);
    }
  }, [verdict?.submissionId]);

  const requestCodeReview = useCallback(async () => {
    if (!user) { setAiLoginRequired(true); return; }
    if (codeReviewLoading) return;
    setCodeReviewLoading(true);
    setCodeReviewUpgrade(false);
    try {
      const res = await apiFetch("/api/code-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: editor.code,
          lang,
          problem_title: problem.title,
          verdict: verdict?.type ?? undefined,
        }),
      });
      const data = await res.json();
      if (res.status === 402 && data?.error === "upgrade_required") {
        setCodeReviewUpgrade(true);
        return;
      }
      if (!res.ok) return;
      setCodeReview(data);
    } catch {
      // silently fail
    } finally {
      setCodeReviewLoading(false);
    }
  }, [user, codeReviewLoading, editor.code, lang, problem.title, verdict?.type]);

  const canSubmit = !!problem.testCases?.length;
  // Pass ALL problems to the sidebar so it can handle its own category filter + pagination.
  // initialCategory pre-selects the filter when the user arrived from a filtered list page.
  const sidebarProps = {
    problems: allProblems,
    activeSlug: problem.slug,
    lang,
    statuses,
    initialCategory: categoryFilter ?? undefined,
    listQuery: { category: categoryFilter ?? undefined, page: listPage > 1 ? listPage : undefined, status: listStatus, difficulty: listDifficulty },
  } as const;

  async function handleBookmark() {
    if (!user || bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      if (bookmarkId !== null) {
        // Unsave
        const res = await apiFetch("/api/bookmarks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: bookmarkId }),
        });
        if (res.ok) setBookmarkId(null);
      } else {
        // Save
        const res = await apiFetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tutorialSlug: `practice:${problem.slug}`, snippet: editor.code, note: problem.title, lang }),
        });
        if (res.ok) {
          const data = await res.json();
          setBookmarkId(data?.bookmark?.id ?? null);
        }
      }
    } catch { /* ignore */ }
    finally { setBookmarkLoading(false); }
  }

  const { shareCopied, handleShare } = useShareCode(() => editor.code);

  const [resetPending, setResetPending] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleReset() {
    if (!resetPending) {
      // First click: ask for confirmation; auto-cancel after 3 seconds
      setResetPending(true);
      resetTimerRef.current = setTimeout(() => setResetPending(false), 3000);
      return;
    }
    // Second click: confirmed — delete the DB draft and reset to starter
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setResetPending(false);
    if (user) {
      apiFetch("/api/practice-code", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: problem.slug, lang }),
      }).catch(() => {});
    }
    editor.setCode(getStarterForLanguage(problem, lang));
    editor.setErrorLines(new Set());
    setOutput(null);
    setOutputIsError(false);
    setVerdict(null);
    setAiFeedback(null);
    setAiError(null);
  }

  const handleKeyDown = useEditorKeyDown({ editor, onRun: handleRun });

  // Show the guest conversion prompt after a first accepted solve
  const guestFirstSolve = !user && verdict?.type === "accepted";

  // Format mm:ss for interview timer
  const timerDisplay = interviewTimeLeft !== null ? (() => {
    const m = Math.floor(interviewTimeLeft / 60);
    const s = interviewTimeLeft % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  })() : null;
  const timerWarning = interviewTimeLeft !== null && interviewTimeLeft <= 300; // <= 5 min

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Guest conversion prompt — only for logged-out users after first solve */}
      <GuestConversionPrompt trigger={guestFirstSolve} context="practice" />

      {/* Interview mode banner */}
      {interviewMode && timerDisplay !== null && (
        <div className={`flex items-center justify-between px-4 py-1.5 text-xs font-semibold ${timerWarning ? "bg-red-600 text-white" : "bg-indigo-600 text-white"}`}>
          <span>🎤 Interview Mode — solve this problem as you would in a real interview</span>
          <span className={`font-mono ${timerWarning ? "animate-pulse" : ""}`}>⏱ {timerDisplay}</span>
        </div>
      )}

      {/* XP awarded toast */}
      {xpToast !== null && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 animate-bounce">
          <div className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
            <span>⚡</span>
            <span>+{xpToast} XP — first solve!</span>
          </div>
        </div>
      )}

      {/* Drag-cursor overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-[52]" style={{ cursor: isDragging === "h" ? "col-resize" : "row-resize" }} />
      )}

      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Left: hamburger on mobile (problem list), logo on desktop */}
        <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-initial">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
            aria-label="Open problem list"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-md py-1 pr-2 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 md:flex"
            aria-label="Back to home"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">U</span>
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">uByte</span>
          </Link>
        </div>

        {/* Breadcrumb */}
        <h1 className="min-w-0 max-w-[45%] flex-1 truncate text-center text-sm font-semibold text-zinc-800 dark:text-zinc-100 md:max-w-[40%] md:flex-initial" title={problem.title}>
          {problem.title}
          <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize align-middle ${DIFFICULTY_BADGE[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
        </h1>

        {/* Right: bookmark + theme + user menu */}
        <div className="flex flex-1 justify-end gap-2 md:flex-initial md:gap-3">
          {/* Bookmark */}
          {user && (
            <button
              type="button"
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              title={bookmarked ? "Remove bookmark" : "Bookmark this problem"}
              className={`hidden items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm transition-colors sm:flex disabled:cursor-not-allowed disabled:opacity-60 ${
                bookmarked
                  ? "border-indigo-400 bg-indigo-50 text-indigo-600 hover:border-red-400 hover:bg-red-50 hover:text-red-600 dark:border-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:border-red-600 dark:hover:text-red-400"
                  : "border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill={bookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              {bookmarkLoading ? "…" : bookmarked ? "Saved ✓" : "Save"}
            </button>
          )}
          <ThemeToggle className="hidden h-8 w-8 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 md:flex" />
          <Suspense fallback={<div className="h-9 w-20 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />}>
            <AuthButtons />
          </Suspense>
        </div>
      </header>

      {/* Mobile problem list drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[53] md:hidden">
          <div className="absolute inset-0 bg-black/50" aria-hidden onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[min(280px,85vw)] overflow-hidden bg-zinc-50 shadow-xl dark:bg-zinc-900">
            <div className="flex h-12 items-center justify-between border-b border-zinc-200 px-3 dark:border-zinc-800">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Problems</span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[calc(100%-3rem)] overflow-y-auto">
              <ProblemSidebar {...sidebarProps} onCollapse={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile tab bar — identical style to InteractiveTutorial ─── */}
      <div className="flex shrink-0 items-center border-b border-zinc-200 dark:border-zinc-800 md:hidden">
        {(["desc", "code"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`relative flex-1 py-2 text-sm font-medium capitalize transition-colors ${
              mobileTab === tab
                ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {tab === "desc" ? "Description" : "Code Editor"}
          </button>
        ))}
      </div>

      {/* ── Main split ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Problem list sidebar (desktop) — collapses to a thin expand strip */}
        <aside className="hidden shrink-0 md:flex">
          {sidebarOpen ? (
            <div className="flex w-60">
              <ProblemSidebar {...sidebarProps} onCollapse={() => setSidebarOpen(false)} />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              title="Expand problem list"
              className="flex w-8 flex-col items-center justify-center border-r border-zinc-200 bg-zinc-50 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </aside>

        {/* Description panel (left) — same bg as InstructionsSidebar */}
        <aside
          className={`flex min-w-0 flex-col overflow-hidden bg-surface-card ${
            mobileTab === "desc" ? "flex shrink" : "hidden"
          } md:flex md:shrink-0`}
          style={isMobile ? undefined : { width: leftWidth }}
          suppressHydrationWarning
        >
          {/* Tab strip: Description | Notes | Discuss */}
          <div className="flex shrink-0 border-b border-zinc-200 dark:border-zinc-800">
            {(["desc", "notes", "discuss"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setDescTab(tab)}
                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  descTab === tab
                    ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                }`}
              >
                {tab === "desc" ? "Description" : tab === "notes" ? "Notes" : "Discuss"}
              </button>
            ))}
          </div>

          {/* Description tab */}
          {descTab === "desc" && (
            <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto break-words p-4 md:p-5">
              <h1 className="mb-2 break-words text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {problem.title}
              </h1>
              <span className={`mb-4 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_BADGE[problem.difficulty]}`}>
                {problem.difficulty}
              </span>

              <p className="mb-5 min-w-0 break-words whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {problem.description}
              </p>

              {problem.examples.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Examples</h3>
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                      <p className="mb-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">Example {i + 1}</p>
                      <div className="space-y-1 font-mono text-xs">
                        <div><span className="text-zinc-400">Input:  </span><span className="text-zinc-800 dark:text-zinc-200">{ex.input}</span></div>
                        <div><span className="text-zinc-400">Output: </span><span className="text-zinc-800 dark:text-zinc-200">{ex.output}</span></div>
                        {ex.explanation && <div className="mt-1.5 text-zinc-500 dark:text-zinc-400">{ex.explanation}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Prev / Next problem */}
              <div className="mt-6 flex gap-2">
                {(() => {
                  const idx  = allProblems.findIndex((p) => p.slug === problem.slug);
                  const prev = allProblems[idx - 1];
                  const next = allProblems[idx + 1];
                  return (
                    <>
                      {prev && (
                        <Link
                          href={`/practice/${lang}/${prev.slug}`}
                          scroll={false}
                          className="flex-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-center text-xs font-medium text-indigo-600 transition-colors hover:border-indigo-300 hover:bg-indigo-100 hover:text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                        >
                          ← Prev
                        </Link>
                      )}
                      {next && (
                        <Link
                          href={`/practice/${lang}/${next.slug}`}
                          scroll={false}
                          className="flex-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-center text-xs font-medium text-indigo-600 transition-colors hover:border-indigo-300 hover:bg-indigo-100 hover:text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                        >
                          Next →
                        </Link>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Notes tab */}
          {descTab === "notes" && (
            <div className="flex min-w-0 flex-1 flex-col p-4 md:p-5">
              {noteCollapsed ? (
                /* Collapsed summary — click anywhere to expand */
                <button
                  type="button"
                  onClick={() => setNoteCollapsed(false)}
                  className="flex w-full items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50"
                >
                  <span className="mt-0.5 text-emerald-500">✓</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Note saved</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {notes.trim() || "No content yet."}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">Edit ›</span>
                </button>
              ) : (
                /* Expanded editor */
                <>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {user ? "Auto-saved as you type." : "Sign in to save notes to your account."}
                    </p>
                    <button
                      type="button"
                      onClick={saveNotesNow}
                      className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold transition-all ${
                        noteSaved
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "border-zinc-300 text-zinc-500 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-indigo-600 dark:hover:text-indigo-400"
                      }`}
                    >
                      {noteSaved ? "✓ Saved" : "Save"}
                    </button>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => { setNotes(e.target.value); setNoteSaved(false); }}
                    placeholder="Write your approach, observations, or ideas here…"
                    className="flex-1 resize-none rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-800 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-500 dark:focus:border-indigo-600"
                  />
                </>
              )}
            </div>
          )}

          {/* Discuss tab */}
          {descTab === "discuss" && (
            <DiscussionThread
              slug={problem.slug}
              currentUserId={user?.id ?? null}
              isSignedIn={!!user}
            />
          )}
        </aside>

        {/* Horizontal resize handle — identical to InteractiveTutorial */}
        <div
          onMouseDown={startDragH}
          className="group relative hidden w-1 shrink-0 cursor-col-resize bg-zinc-200 transition-colors hover:bg-indigo-400 dark:bg-zinc-800 dark:hover:bg-indigo-600 md:block"
        >
          <GripDots vertical />
        </div>

        {/* ── Right panel: editor + toolbar + output ───────────────── */}
        <div className={`flex-col overflow-hidden ${mobileTab === "code" ? "flex" : "hidden"} md:flex flex-1`}>

          {/* Shared code editor surface */}
          <CodeEditor editor={editor} onKeyDown={handleKeyDown} />

          {/* Shared toolbar — desktop only */}
          <EditorToolbar
            lang={lang}
            onLangChange={setLang}
            langOptions={LANG_ORDER}
            shareCopied={shareCopied}
            onShare={handleShare}
          >
            <button
              type="button"
              onClick={handleRun}
              disabled={running || submitting}
              title="Run code (Ctrl+Enter)"
              className="flex items-center gap-1.5 rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800 transition-colors hover:bg-green-200 disabled:opacity-50 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/70"
            >
              {running ? "Running…" : "▶ Run"}
            </button>
            {canSubmit && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={running || submitting}
                title="Submit solution against test cases"
                className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
              >
                {submitting ? "Judging…" : "✓ Submit"}
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              title={resetPending ? "Click again to confirm reset" : "Reset to starter code"}
              className={`rounded-md border px-3 py-1.5 text-sm transition-all ${
                resetPending
                  ? "border-red-400 bg-red-50 text-red-600 dark:border-red-600 dark:bg-red-950/30 dark:text-red-400"
                  : "border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
              }`}
            >
              {resetPending ? "Confirm?" : "Reset"}
            </button>
          </EditorToolbar>

          {/* Vertical resize handle — touch-friendly on mobile */}
          <div
            onMouseDown={startDragV}
            onTouchStart={startDragVTouch}
            className="group relative shrink-0 cursor-row-resize touch-none bg-zinc-200 transition-colors hover:bg-indigo-400 dark:bg-zinc-800 dark:hover:bg-indigo-600"
            style={{ minHeight: 24 }}
            role="separator"
            aria-label="Resize output"
          >
            <GripDots />
          </div>

          {/* Output / verdict panel */}
          <OutputPanel
            verdict={verdict}
            output={output}
            outputIsError={outputIsError}
            outputHeight={outputHeight}
            problem={problem}
            aiLoading={aiLoading}
            aiError={aiError}
            aiUpgradeRequired={aiUpgradeRequired}
            aiLoginRequired={aiLoginRequired}
            aiFeedback={aiFeedback}
            onRequestAI={() => requestAiFeedback()}
            onClearAI={() => { setAiFeedback(null); setAiError(null); setAiUpgradeRequired(false); setAiLoginRequired(false); }}
            codeReview={codeReview}
            codeReviewLoading={codeReviewLoading}
            codeReviewUpgrade={codeReviewUpgrade}
            onRequestCodeReview={() => requestCodeReview()}
            onClearCodeReview={() => { setCodeReview(null); setCodeReviewUpgrade(false); }}
            interviewMode={interviewMode}
          />
        </div>
      </div>

      {/* Mobile bottom bar — shared EditorToolbar in mobile mode */}
      {mobileTab === "code" && (
        <EditorToolbar
          lang={lang}
          onLangChange={setLang}
          langOptions={LANG_ORDER}
          shareCopied={shareCopied}
          onShare={handleShare}
          mobile
        >
          <button
            type="button"
            onClick={handleRun}
            disabled={running || submitting}
            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-green-100 py-2 text-sm font-medium text-green-800 disabled:opacity-50 dark:bg-green-900/40 dark:text-green-300"
          >
            {running ? "…" : "▶ Run"}
          </button>
          {canSubmit && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={running || submitting}
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-indigo-600 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting ? "…" : "✓ Submit"}
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            className={`flex shrink-0 items-center justify-center rounded-md border px-3 py-2 text-sm transition-all ${
              resetPending
                ? "border-red-400 bg-red-50 text-red-600 dark:border-red-600 dark:bg-red-950/30 dark:text-red-400"
                : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            {resetPending ? "Confirm?" : "Reset"}
          </button>
        </EditorToolbar>
      )}

    </div>
  );
}
