"use client";

/**
 * TutorialGate — hard wall that blocks tutorial content.
 *
 * Guest gate: after GUEST_LESSON_LIMIT lessons completed, must sign up.
 *
 * Uses localStorage to accumulate lesson counts across sessions.
 * The gate is NOT dismissable — users must act to continue.
 *
 * Email verification is no longer enforced as a hard gate (it caused major
 * drop-off, especially for Google sign-in users). The dismissable banner in
 * EmailVerificationBanner.tsx still nudges unverified users.
 */

import { useState, useEffect, lazy, Suspense } from "react";
import { useAuth } from "@/components/AuthProvider";

const AuthModal = lazy(() => import("@/components/auth/AuthModal"));

const LS_GUEST_LESSONS = "ubyte_guest_lessons";

/** Number of free lessons (steps passed) before guests must sign up. */
const GUEST_LESSON_LIMIT = 12;

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
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");

  // Snapshot of the stored count at mount — so adding completedLessons never
  // double-counts across reloads. Lazy init runs exactly once.
  const [guestBase] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return getStoredCount(LS_GUEST_LESSONS);
  });

  // Derive gate state during render (no setState in effects needed).
  const guestTotal = !user ? guestBase + completedLessons : 0;
  const showSignupGate = !loading && !user && guestTotal > GUEST_LESSON_LIMIT;

  // Side effect: keep the guest counter in localStorage in sync.
  useEffect(() => {
    if (loading || user) return;
    setStoredCount(LS_GUEST_LESSONS, guestTotal);
  }, [loading, user, guestTotal]);

  // Clear counts when user logs in
  useEffect(() => {
    if (user) {
      try { localStorage.removeItem(LS_GUEST_LESSONS); } catch { /* ignore */ }
      // Clean up legacy counter from the now-removed email verification gate.
      try { localStorage.removeItem("ubyte_unverified_lessons"); } catch { /* ignore */ }
    }
  }, [user]);

  // Still loading auth — show nothing yet
  if (loading) return <>{children}</>;

  // ── Signup gate ──────────────────────────────────────────────────────────
  if (showSignupGate) {
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

  // ── Email verification is no longer enforced as a hard gate ──
  // (It caused major drop-off, especially for Google sign-in users
  // who were already verified upstream. The dismissable banner remains.)

  // ── No gate — render tutorial content ────────────────────────────────────
  return <>{children}</>;
}
