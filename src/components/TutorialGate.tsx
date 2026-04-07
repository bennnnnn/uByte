"use client";

/**
 * TutorialGate — hard wall that blocks tutorial content.
 *
 * Two gates:
 * 1. Guest gate: after 3 unique tutorial pages, must sign up to continue.
 * 2. Email verification gate: after 5 unique tutorial pages, must verify email.
 *
 * Uses localStorage to track unique tutorial slugs visited.
 * The gate is NOT dismissable — users must act to continue.
 */

import { useState, useEffect, lazy, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

const AuthModal = lazy(() => import("@/components/auth/AuthModal"));

const LS_GUEST_TUTORIALS = "ubyte_guest_tutorials";
const LS_UNVERIFIED_TUTORIALS = "ubyte_unverified_tutorials";

/** Number of free tutorials before guests must sign up. */
const GUEST_TUTORIAL_LIMIT = 3;
/** Number of tutorials before unverified users must verify email. */
const UNVERIFIED_TUTORIAL_LIMIT = 5;

function getVisitedSlugs(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function recordVisit(key: string, slug: string): number {
  const visited = getVisitedSlugs(key);
  if (!visited.includes(slug)) {
    visited.push(slug);
    try {
      localStorage.setItem(key, JSON.stringify(visited));
    } catch { /* full storage — ignore */ }
  }
  return visited.length;
}

interface Props {
  /** Current tutorial slug being viewed. */
  tutorialSlug: string;
  /** Only render content (children) when the gate is not active. */
  children: React.ReactNode;
}

export default function TutorialGate({ tutorialSlug, children }: Props) {
  const { user, profile, loading } = useAuth();
  const [gate, setGate] = useState<"none" | "signup" | "verify">("none");
  const [authOpen, setAuthOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Guest: track tutorials visited and gate at limit
      const count = recordVisit(LS_GUEST_TUTORIALS, tutorialSlug);
      if (count > GUEST_TUTORIAL_LIMIT) {
        setGate("signup");
      }
    } else if (profile && !profile.emailVerified) {
      // Logged in but email not verified
      const count = recordVisit(LS_UNVERIFIED_TUTORIALS, tutorialSlug);
      if (count > UNVERIFIED_TUTORIAL_LIMIT) {
        setGate("verify");
      }
    } else {
      setGate("none");
    }
  }, [loading, user, profile, tutorialSlug]);

  // Clear guest tutorials when user logs in
  useEffect(() => {
    if (user) {
      try { localStorage.removeItem(LS_GUEST_TUTORIALS); } catch { /* ignore */ }
    }
  }, [user]);

  // Clear unverified tutorials when email is verified
  useEffect(() => {
    if (profile?.emailVerified) {
      try { localStorage.removeItem(LS_UNVERIFIED_TUTORIALS); } catch { /* ignore */ }
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
              You&apos;ve explored {GUEST_TUTORIAL_LIMIT} tutorials — nice start!
              Sign up for free to unlock all tutorials, track your progress,
              earn XP, and get certified.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => setAuthOpen(true)}
                className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
              >
                Sign up free →
              </button>
              <button
                onClick={() => setAuthOpen(true)}
                className="rounded-xl border border-zinc-300 px-8 py-3 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300"
              >
                Log in
              </button>
            </div>

            <p className="mt-4 text-xs text-zinc-400">
              No credit card required · Takes 30 seconds
            </p>

            <Link
              href="/"
              className="mt-6 inline-block text-sm text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
            >
              ← Back to home
            </Link>
          </div>
        </div>

        {authOpen && (
          <Suspense>
            <AuthModal
              initialMode="signup"
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
            You&apos;ve completed {UNVERIFIED_TUTORIAL_LIMIT} tutorials — great progress!
            Verify your email to keep going, lock in your XP,
            and appear on the leaderboard.
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
