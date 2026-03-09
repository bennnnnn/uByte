"use client";

/**
 * A thin, persistent "Save your progress — sign up free" bar shown to guests
 * at the top of the tutorial and practice IDEs.
 *
 * Visible from the very first interaction (step 0, before any code is run).
 * Dismissed state stored in localStorage so it doesn't reappear once closed.
 * Opens the AuthModal in signup mode when the CTA is clicked.
 */

import { useState, useEffect, lazy, Suspense } from "react";

const AuthModal = lazy(() => import("@/components/auth/AuthModal"));

const LS_KEY = "ubyte_guest_top_banner_dismissed";
// Set to "1" after any successful login or signup (see AuthProvider).
// Prevents showing this banner to returning users who are just logged out.
const LS_HAS_ACCOUNT = "ubyte_has_account";

interface Props {
  /** Only render for guests — pass `!user` from the parent. */
  show: boolean;
}

export default function GuestTopBanner({ show }: Props) {
  const [visible, setVisible] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!show) return;
    try {
      // Don't show to users who have an account — they're just logged out
      if (localStorage.getItem(LS_HAS_ACCOUNT)) return;
      if (localStorage.getItem(LS_KEY)) return;
    } catch { /* noop */ }
    setVisible(true);
  }, [show]);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(LS_KEY, "1"); } catch { /* noop */ }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-indigo-200 bg-indigo-50 px-4 py-2 dark:border-indigo-800/60 dark:bg-indigo-950/40">
        <p className="text-xs text-indigo-800 dark:text-indigo-200">
          <span className="font-semibold">Your progress isn&apos;t saved.</span>{" "}
          Create a free account to keep your streak, XP, and completed steps.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-indigo-500"
          >
            Sign up free
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="rounded p-0.5 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {authOpen && (
        <Suspense>
          <AuthModal initialMode="signup" onClose={() => { setAuthOpen(false); dismiss(); }} />
        </Suspense>
      )}
    </>
  );
}
