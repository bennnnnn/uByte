"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

const DISMISS_KEY = "banner-dismissed-verify";
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export default function EmailVerificationBanner() {
  const { user, profile } = useAuth();
  const [dismissed, setDismissed] = useState(() => {
    try {
      const ts = localStorage.getItem(DISMISS_KEY);
      if (ts && Date.now() - parseInt(ts, 10) < DISMISS_TTL_MS) return true;
    } catch { /* ignore */ }
    return false;
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function dismiss() {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
  }

  // Only show for logged-in users whose email isn't verified
  if (!user || !profile || profile.emailVerified || dismissed) return null;

  async function resend() {
    setSending(true);
    try {
      await fetch("/api/auth/resend-verification", { method: "POST" });
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm dark:border-amber-900/60 dark:bg-amber-950/40">
      <p className="text-amber-800 dark:text-amber-300">
        Please verify your email address to unlock all features.{" "}
        {sent ? (
          <span className="font-medium text-amber-700 dark:text-amber-400">
            Verification email sent — check your inbox.
          </span>
        ) : (
          <button
            onClick={resend}
            disabled={sending}
            className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-600 disabled:opacity-50 dark:text-amber-400 dark:hover:text-amber-300"
          >
            {sending ? "Sending…" : "Resend verification email"}
          </button>
        )}
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded p-0.5 text-amber-500 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/50 dark:hover:text-amber-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
