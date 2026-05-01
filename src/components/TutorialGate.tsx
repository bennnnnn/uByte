"use client";

/**
 * TutorialGate — hard wall that blocks tutorial content.
 *
 * Two gates:
 * 1. Guest gate: after GUEST_LESSON_LIMIT lessons completed, must sign up.
 * 2. Email verification gate: after UNVERIFIED_LESSON_LIMIT lessons, must verify email.
 *
 * Uses localStorage to accumulate lesson counts across sessions.
 * The gate is NOT dismissable — users must act to continue.
 */

import { useState, useEffect, useRef, lazy, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

const AuthModal = lazy(() => import("@/components/auth/AuthModal"));

const LS_GUEST_LESSONS = "ubyte_guest_lessons";
const LS_UNVERIFIED_LESSONS = "ubyte_unverified_lessons";

/** Number of free lessons (steps passed) before guests must sign up. */
const GUEST_LESSON_LIMIT = 12;
/** Number of lessons before unverified users must verify email. */
const UNVERIFIED_LESSON_LIMIT = 10;

function getStoredCount(key: string): number {
  try {
    return parseInt(localStorage.getItem(key) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

function setStoredCount(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value));
  } catch { /* full storage — ignore */ }
}

interface Props {
  /** Current tutorial slug being viewed. */
  tutorialSlug: string;
  /** Number of lessons (steps) completed in the current session for this tutorial. */
  completedLessons: number;
  /** Only render content (children) when the gate is not active. */
  children: React.ReactNode;
}

export default function TutorialGate({ tutorialSlug, completedLessons, children }: Props) {
  void tutorialSlug;
  const { user, profile, loading } = useAuth();
  const [gate, setGate] = useState<"none" | "signup" | "verify">("none");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Snapshot of the stored count at the start of this session — so adding
  // completedLessons never double-counts across reloads.
  const guestBaseRef = useRef<number | null>(null);
  const unverifiedBaseRef = useRef<number | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (guestBaseRef.current === null) guestBaseRef.current = getStoredCount(LS_GUEST_LESSONS);
      const total = guestBaseRef.current + completedLessons;
      setStoredCount(LS_GUEST_LESSONS, total); // keep localStorage up to date for next session
      if (total > GUEST_LESSON_LIMIT) setGate("signup");
    } else if (profile && !profile.emailVerified) {
      if (unverifiedBaseRef.current === null) unverifiedBaseRef.current = getStoredCount(LS_UNVERIFIED_LESSONS);
      const total = unverifiedBaseRef.current + completedLessons;
      setStoredCount(LS_UNVERIFIED_LESSONS, total);
      if (total > UNVERIFIED_LESSON_LIMIT) setGate("verify");
    } else {
      setGate("none");
    }
  }, [loading, user, profile, completedLessons]);

  // Clear counts when user logs in
  useEffect(() => {
    if (user) {
      try { localStorage.removeItem(LS_GUEST_LESSONS); } catch { /* ignore */ }
    }
  }, [user]);

  // Clear unverified count when email is verified
  useEffect(() => {
    if (profile?.emailVerified) {
      try { localStorage.removeItem(LS_UNVERIFIED_LESSONS); } catch { /* ignore */ }
      setGate("none");
    }
  }, [profile?.emailVerified]);

  async function resendVerification() {
    setSending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      if (res.ok) setSent(true);
    } finally {
      setSending(false);
    }
  }

  // Still loading auth — show nothing yet
  if (loading) return <>{children}</>;

  // ── Signup gate ──────────────────────────────────────────────────────────
  if (gate === "signup") {
    return (
      <>
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/95 backdrop-blur-sm dark:bg-zinc-950/95">
          <div className="mx-4 w-full max-w-md text-center">
            {/* Icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
              <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>

            <h2 className="mb-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Create a free account to continue
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              You&apos;ve completed {GUEST_LESSON_LIMIT} free lessons — nice start!
              Sign up for free to unlock all tutorials, track your progress,
              save bookmarks, and keep your streak going.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}
                className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
              >
                Sign up free →
              </button>
              <button
                onClick={() => { setAuthMode("login"); setAuthOpen(true); }}
                className="rounded-xl border border-zinc-300 px-8 py-3 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300"
              >
                Log in
              </button>
            </div>
          </div>
        </div>

        {authOpen && (
          <Suspense>
            <AuthModal
              initialMode={authMode}
              onClose={() => setAuthOpen(false)}
            />
          </Suspense>
        )}
      </>
    );
  }

  // ── Email verification gate ──────────────────────────────────────────────
  if (gate === "verify") {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/95 backdrop-blur-sm dark:bg-zinc-950/95">
        <div className="mx-4 w-full max-w-md text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>

          <h2 className="mb-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">
            Verify your email to continue
          </h2>
          <p className="mb-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            You&apos;ve completed {UNVERIFIED_LESSON_LIMIT} lessons — great progress!
            Verify your email to keep going, lock in your progress,
            and keep your account secure.
          </p>
          <p className="mb-6 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Check your inbox for a verification link from uByte.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {sent ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700">
                Verification email sent — check your inbox!
              </p>
            ) : (
              <button
                onClick={resendVerification}
                disabled={sending}
                className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 disabled:opacity-50"
              >
                {sending ? "Sending…" : "Resend verification email"}
              </button>
            )}
          </div>

          <p className="mt-4 text-xs text-zinc-400">
            Didn&apos;t receive it? Check your spam folder or try resending.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block text-sm text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  // ── No gate — render tutorial content ────────────────────────────────────
  return <>{children}</>;
}
