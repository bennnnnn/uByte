"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { hasPaidAccess } from "@/lib/plans";
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
    const res = await apiFetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: billingPlan }),
    });
    if (!res.ok) return;
    const { priceId } = await res.json();
    if (!window.Paddle || !priceId) return;
    window.Paddle.Checkout.open({ items: [{ priceId, quantity: 1 }] });
  }

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
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Monthly */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">$9.99<span className="text-sm font-normal text-zinc-400">/mo</span></p>
            <p className="mb-4 text-xs text-zinc-500">Monthly Pro · cancel anytime</p>
            <button
              onClick={() => openCheckout("monthly")}
              className="w-full rounded-xl bg-indigo-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
            >
              Get Monthly
            </button>
          </div>
          {/* Yearly */}
          <div className="rounded-2xl border-2 border-indigo-500 bg-white p-5 dark:bg-zinc-900">
            <div className="mb-1 flex items-center gap-2">
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">$49.99<span className="text-sm font-normal text-zinc-400">/yr</span></p>
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">Save 58%</span>
            </div>
            <p className="mb-4 text-xs text-zinc-500">Yearly Pro · best value</p>
            <button
              onClick={() => openCheckout("yearly")}
              className="w-full rounded-xl bg-indigo-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
            >
              Get Yearly
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">You&apos;re all set ✓</p>
          <p className="mt-1 text-xs text-zinc-400">
            To update billing or cancel, visit your{" "}
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
