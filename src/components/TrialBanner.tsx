"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

function getDaysLeft(expiresAt: string | null | undefined): number | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (isNaN(ms)) return null;
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Shown to users on a Paddle free trial so they always know how many days remain.
 * Disappears once the plan converts to "pro" / "yearly" (no dismissal needed —
 * it's important information, not marketing).
 */
export default function TrialBanner() {
  const { profile } = useAuth();

  const isTrial = profile?.plan === "trial" || profile?.plan === "trial_yearly";
  if (!isTrial) return null;

  const daysLeft = getDaysLeft(profile.subscription_expires_at);
  const daysText =
    daysLeft === null
      ? "Your free trial is active"
      : daysLeft === 0
        ? "Your trial ends today"
        : daysLeft === 1
          ? "1 day left in your trial"
          : `${daysLeft} days left in your trial`;

  const isUrgent = daysLeft !== null && daysLeft <= 2;

  return (
    <div
      role="region"
      aria-label="Trial status"
      className={`relative z-30 shrink-0 border-b ${
        isUrgent
          ? "border-amber-300/70 bg-amber-50/90 dark:border-amber-700/50 dark:bg-amber-950/50"
          : "border-emerald-200/70 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/40"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2.5 sm:px-6">
        <p
          className={`text-center text-[13px] font-medium ${
            isUrgent
              ? "text-amber-900 dark:text-amber-100"
              : "text-emerald-900 dark:text-emerald-100"
          }`}
        >
          {isUrgent ? "⚠️ " : "✨ "}
          {daysText} — you have full Pro access.{" "}
          <Link
            href="/pricing"
            className={`font-semibold underline underline-offset-2 transition-colors ${
              isUrgent
                ? "text-amber-700 decoration-amber-600/50 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
                : "text-emerald-700 decoration-emerald-600/40 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
            }`}
          >
            Subscribe to keep access →
          </Link>
        </p>
      </div>
    </div>
  );
}
