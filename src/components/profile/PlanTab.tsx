"use client";

import Link from "next/link";
import { hasPaidAccess } from "@/lib/plans";

const FREE_FEATURES = [
  "First 5 tutorials",
  "Interactive code editor",
  "Progress tracking",
  "Leaderboard",
];

const PRO_FEATURES = [
  "All 20 tutorials",
  "AI code feedback",
  "Community chat",
  "Certificate of completion",
  "Progress tracking & leaderboard",
  "Priority support",
];

interface Props {
  plan: string;
}

export default function PlanTab({ plan }: Props) {
  const isPaid = hasPaidAccess(plan);
  const isYearly = plan === "yearly";
  const isMonthly = plan === "pro";

  const planLabel = isYearly ? "Yearly Pro" : isMonthly ? "Monthly Pro" : "Free";
  const planPrice = isYearly ? "$49.99/year" : isMonthly ? "$9.99/month" : "Free forever";

  return (
    <div className="space-y-5">

      {/* Current plan */}
      <div className={`rounded-2xl border-2 p-6 ${isPaid ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-zinc-400">Current plan</p>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{planLabel}</h3>
              {isPaid && (
                <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-bold text-white">Active</span>
              )}
            </div>
            <p className={`mt-1 text-sm ${isPaid ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500"}`}>
              {planPrice}
            </p>
          </div>
          <span className="text-4xl">{isPaid ? "⭐" : "🆓"}</span>
        </div>
      </div>

      {/* Features */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
          {isPaid ? "Your plan includes" : "Free plan includes"}
        </h3>
        <ul className="space-y-2.5">
          {(isPaid ? PRO_FEATURES : FREE_FEATURES).map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
              <svg className={`h-4 w-4 shrink-0 ${isPaid ? "text-indigo-500" : "text-emerald-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        {!isPaid && (
          <div className="mt-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
            <p className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">Upgrade to unlock everything</p>
            <ul className="space-y-1">
              {PRO_FEATURES.filter((f) => !FREE_FEATURES.includes(f)).map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="text-zinc-300 dark:text-zinc-600">—</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* CTA */}
      {!isPaid ? (
        <Link
          href="/pricing"
          className="block rounded-xl bg-indigo-700 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
        >
          Upgrade to Pro — from $49.99/yr
        </Link>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Manage your subscription</p>
          <p className="mt-1 text-xs text-zinc-400">
            To update billing, switch plans, or cancel, visit your{" "}
            <a
              href="https://paddle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Paddle billing portal
            </a>.
          </p>
        </div>
      )}
    </div>
  );
}
