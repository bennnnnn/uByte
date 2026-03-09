"use client";

/**
 * GuestConversionPrompt — shown to guests after they achieve something
 * meaningful (e.g., first accepted solution or 3 completed tutorial steps).
 *
 * Renders a slide-up banner anchored to the bottom of the screen.
 * Dismissed state is persisted in sessionStorage so it doesn't re-appear
 * within the same browser tab.
 *
 * Usage:
 *   <GuestConversionPrompt
 *     trigger={isGuest && didFirstSolve}
 *     context="practice"
 *   />
 */

import { useEffect, useState, lazy, Suspense } from "react";

const AuthModal = lazy(() => import("@/components/auth/AuthModal"));

const SESSION_KEY = "ubyte_guest_prompt_dismissed";

export type ConversionContext = "practice" | "tutorial";

interface Props {
  /** Show the prompt when this flips to true (and user is a guest). */
  trigger: boolean;
  /** Controls the copy shown in the prompt. */
  context?: ConversionContext;
}

const COPY: Record<ConversionContext, { headline: string; body: string }> = {
  practice: {
    headline: "Nice work — save your progress!",
    body: "Create a free account to track solved problems, save your code, and unlock AI hints.",
  },
  tutorial: {
    headline: "You're on a roll! Keep it going.",
    body: "Sign up for free to save your progress, earn XP, and build a learning streak.",
  },
};

export default function GuestConversionPrompt({ trigger, context = "practice" }: Props) {
  const [visible, setVisible] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Show once per session when the trigger fires
  useEffect(() => {
    if (!trigger) return;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(SESSION_KEY)) return;
    setVisible(true);
  }, [trigger]);

  function dismiss() {
    setVisible(false);
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  }

  function openSignup() {
    setAuthOpen(true);
  }

  if (!visible) return null;

  const { headline, body } = COPY[context];

  return (
    <>
      {/* Slide-up banner */}
      <div
        role="complementary"
        aria-label="Sign up prompt"
        className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
      >
        <div className="mx-auto max-w-2xl px-4 pb-4">
          <div className="flex items-start gap-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-xl dark:border-indigo-800 dark:bg-indigo-950/90">
            {/* Icon */}
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg text-white">
              🚀
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-indigo-900 dark:text-indigo-100">{headline}</p>
              <p className="mt-0.5 text-sm text-indigo-700 dark:text-indigo-300">{body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={openSignup}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  Create free account
                </button>
                <button
                  onClick={dismiss}
                  className="rounded-lg border border-indigo-300 px-4 py-1.5 text-sm text-indigo-700 transition-colors hover:border-indigo-400 hover:bg-indigo-100 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                >
                  Maybe later
                </button>
              </div>
            </div>

            {/* Dismiss × */}
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="rounded-md p-1 text-indigo-400 transition-colors hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Auth modal */}
      {authOpen && (
        <Suspense>
          <AuthModal
            onClose={() => {
              setAuthOpen(false);
              dismiss();
            }}
            initialMode="signup"
          />
        </Suspense>
      )}
    </>
  );
}
