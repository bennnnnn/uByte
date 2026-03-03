"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { hasPaidAccess } from "@/lib/plans";
import { trackConversion } from "@/lib/analytics";
import { apiFetch } from "@/lib/api-client";

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
  const { user } = useAuth();
  const isPaid = hasPaidAccess(plan);
  const isYearly = plan === "yearly";
  const isMonthly = plan === "pro";
  const paddleReady = useRef(false);

  const planLabel = isYearly ? "Yearly Pro" : isMonthly ? "Monthly Pro" : "Free";
  const planPrice = isYearly ? "$49.99/year" : isMonthly ? "$9.99/month" : "Free forever";

  useEffect(() => {
    if (paddleReady.current) return;
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      if (!window.Paddle) return;
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
      if (token.startsWith("test_")) window.Paddle.Environment.set("sandbox");
      window.Paddle.Setup({ token });
      paddleReady.current = true;
    };
    document.head.appendChild(script);
  }, []);

  async function openCheckout(billingPlan: "monthly" | "yearly") {
    trackConversion("clicked_upgrade", { plan: billingPlan });
    const res = await apiFetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: billingPlan }),
    });
    if (!res.ok) return;
    const { priceId } = await res.json();
    if (!window.Paddle || !priceId) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: user ? { userId: String(user.id) } : undefined,
      customer: user ? { email: user.email } : undefined,
      settings: {
        successUrl: `${origin}/profile?tab=plan&plan=success`,
        displayMode: "overlay",
        variant: "one-page",
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div
        className={`overflow-hidden rounded-2xl border-2 ${
          isPaid
            ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        }`}
      >
        <div className="px-6 py-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Current plan
          </p>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {planLabel}
                </h3>
                {isPaid && (
                  <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                    Active
                  </span>
                )}
              </div>
              <p
                className={`mt-0.5 text-sm ${
                  isPaid ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {planPrice}
              </p>
            </div>
            <span className="text-3xl" aria-hidden>
              {isPaid ? "✓" : "○"}
            </span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {isPaid ? "Your plan includes" : "Free plan includes"}
          </h3>
        </div>
        <ul className="space-y-3 px-6 py-4">
          {(isPaid ? PRO_FEATURES : FREE_FEATURES).map((f) => (
            <li
              key={f}
              className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  isPaid ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>

        {!isPaid && (
          <div className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/30">
            <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Upgrade to unlock
            </p>
            <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              {PRO_FEATURES.filter((f) => !FREE_FEATURES.includes(f)).map((f) => (
                <li key={f} className="flex items-center gap-2">
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              $9.99
              <span className="text-sm font-normal text-zinc-500">/mo</span>
            </p>
            <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
              Monthly · cancel anytime
            </p>
            <button
              type="button"
              onClick={() => openCheckout("monthly")}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Get Monthly
            </button>
          </div>
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <div className="mb-1 flex items-center gap-2">
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                $49.99
                <span className="text-sm font-normal text-zinc-500">/yr</span>
              </p>
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                Save 58%
              </span>
            </div>
            <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
              Yearly · best value
            </p>
            <button
              type="button"
              onClick={() => openCheckout("yearly")}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Get Yearly
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 px-6 py-5 dark:border-zinc-800 dark:bg-zinc-800/30">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            You’re all set
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage billing or cancel in the{" "}
            <a
              href="https://paddle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-200 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
            >
              Paddle billing portal
            </a>
            .
          </p>
        </div>
      )}

      {!isPaid && (
        <p className="text-center">
          <Link
            href="/pricing"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            View full pricing →
          </Link>
        </p>
      )}
    </div>
  );
}
