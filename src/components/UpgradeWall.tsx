"use client";

import { useState } from "react";
import Link from "next/link";
import { buildAuthPageHref } from "@/lib/auth-redirect";
import { BILLING_CONFIG, type BillingPlan } from "@/lib/plans";

interface UpgradeWallProps {
  tutorialTitle: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
}

export default function UpgradeWall({ tutorialTitle, subtitle, backHref = "/", backLabel = "← Back to free tutorials" }: UpgradeWallProps) {
  const [selected, setSelected] = useState<"yearly" | "monthly">("yearly");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/0 dark:from-zinc-950 dark:via-zinc-950/95 dark:to-zinc-950/0" />

      <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-8 shadow-2xl ring-1 ring-zinc-200 sm:mb-0 sm:rounded-2xl dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="mb-2 text-center text-3xl">🔒</div>
        <h2 className="mb-2 text-center text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {tutorialTitle} requires a paid plan
        </h2>
        <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {subtitle ?? "Upgrade to unlock all tutorials, AI feedback, and more."}
        </p>

        <div className="mb-5 grid grid-cols-2 gap-3">
          {(["yearly", "monthly"] as BillingPlan[]).map((plan) => {
            const cfg = BILLING_CONFIG[plan];
            const active = selected === plan;
            return (
              <button
                key={plan}
                onClick={() => setSelected(plan)}
                className={`relative flex flex-col rounded-xl border-2 p-4 text-left transition-all ${
                  active
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                    : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
                }`}
              >
                <span className={`mb-2 inline-block self-start rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}>
                  {cfg.badge ?? cfg.label}
                </span>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {cfg.priceText}
                </p>
                <p className={`mt-0.5 text-xs font-medium ${active ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"}`}>
                  {cfg.subLabel}
                </p>
                {active && (
                  <span className="absolute right-3 top-3 text-indigo-500">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <Link
          href={buildAuthPageHref("signup", `/pricing?plan=${selected}`)}
          className="block w-full rounded-xl bg-indigo-700 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
        >
          {`Get ${BILLING_CONFIG[selected].label} — ${BILLING_CONFIG[selected].priceText}`}
        </Link>

        <Link
          href={backHref}
          className="mt-3 block w-full rounded-xl border border-zinc-200 py-2.5 text-center text-sm text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
