"use client";

/**
 * Dismissable referral prompt banner.
 * Shows once for logged-in users who haven't yet referred anyone,
 * after they've been around for at least 1 day.
 * Dismissed state is remembered in localStorage for 14 days.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";

const DISMISS_KEY = "referral_banner_dismissed_at";
const DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

function wasDismissedRecently(): boolean {
  if (typeof window === "undefined") return true;
  const ts = localStorage.getItem(DISMISS_KEY);
  if (!ts) return false;
  return Date.now() - parseInt(ts, 10) < DISMISS_TTL_MS;
}

export default function ReferralPromptBanner() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (wasDismissedRecently()) return;

    // Only show after account is at least 1 day old
    const createdAt = (user as unknown as { created_at?: string }).created_at;
    if (createdAt) {
      const age = Date.now() - new Date(createdAt).getTime();
      if (age < 24 * 60 * 60 * 1000) return;
    }

    // Fetch referral data — only show if they have 0 referrals yet
    apiFetch("/api/referral")
      .then((r) => r.json())
      .then((j: { code?: string; shareUrl?: string; signups?: number }) => {
        if (j.shareUrl && (j.signups ?? 0) === 0) {
          setShareUrl(j.shareUrl);
          setShow(true);
        }
      })
      .catch(() => {});
  }, [user]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
  }

  async function copy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!show || !shareUrl) return null;

  return (
    <div className="relative mx-auto mb-6 max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-4 dark:border-indigo-800/50 dark:from-indigo-950/40 dark:to-violet-950/40 sm:flex-row sm:items-center sm:gap-4">
        {/* Icon + text */}
        <div className="flex flex-1 items-start gap-3">
          <span className="mt-0.5 shrink-0 text-2xl">🎁</span>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Invite a friend, get 1 month Pro free
            </p>
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
              Share your unique link. Every friend who subscribes extends your Pro by 30 days — no limit.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={copy}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-500"
          >
            {copied ? "✓ Copied!" : "Copy link"}
          </button>
          <a
            href="/profile?tab=referral"
            className="rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 dark:border-indigo-700 dark:bg-transparent dark:text-indigo-400"
          >
            View stats →
          </a>
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 rounded-md p-1 text-zinc-400 transition-colors hover:bg-white/60 hover:text-zinc-600 dark:hover:bg-zinc-800/60"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
