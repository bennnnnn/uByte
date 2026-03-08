"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { BILLING_CONFIG, hasPaidAccess } from "@/lib/plans";
import { trackConversion } from "@/lib/analytics";
import { apiFetch } from "@/lib/api-client";

const FREE_FEATURES = [
  "First 5 tutorials",
  "Interactive code editor",
  "Progress tracking",
  "Leaderboard",
];

const PRO_FEATURES = [
  "Unlimited tutorials — all languages",
  "AI code feedback",
  "Certification exams & verifiable certificates",
  "Progress tracking & leaderboard",
];

interface Props {
  plan: string;
}

function ManageOrCancelButtons() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal(action: "manage" | "cancel") {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { credentials: "same-origin" });
      const data = (await res.json()) as { portalUrl?: string | null; cancelUrl?: string | null; error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Could not open billing portal.");
        return;
      }
      const url = action === "cancel" && data.cancelUrl ? data.cancelUrl : data.portalUrl;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else setError("Billing portal is not available. Please try again later.");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => openPortal("manage")}
        disabled={loading}
        className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-700 disabled:opacity-50"
      >
        {loading ? "Opening…" : "Manage billing"}
      </button>
      <button
        type="button"
        onClick={() => openPortal("cancel")}
        disabled={loading}
        className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 disabled:opacity-50"
      >
        Cancel subscription
      </button>
      {error && <p className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export default function PlanTab({ plan }: Props) {
  const { user } = useAuth();
  const isPaid = hasPaidAccess(plan);
  const isYearly = plan === "yearly";
  const isMonthly = plan === "pro";
  const paddleReady = useRef(false);

  const planLabel = isYearly ? BILLING_CONFIG.yearly.label : isMonthly ? BILLING_CONFIG.monthly.label : "Free";
  const planPrice = isYearly
    ? BILLING_CONFIG.yearly.priceText
    : isMonthly
      ? BILLING_CONFIG.monthly.priceText
      : "Free forever";

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
              {BILLING_CONFIG.monthly.priceText.replace("/month", "")}
            </p>
            <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
              {BILLING_CONFIG.monthly.subLabel}
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
                {BILLING_CONFIG.yearly.priceText.replace("/year", "")}
              </p>
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {BILLING_CONFIG.yearly.subLabel}
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
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 px-6 py-5 dark:border-zinc-800 dark:bg-zinc-800/30">
            <p className="font-medium text-zinc-700 dark:text-zinc-300">
              You’re all set
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage billing, update payment method, or cancel your subscription below. If you cancel, you keep Pro until the end of your current billing period—then access reverts to free.
            </p>
            <ManageOrCancelButtons />
          </div>
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
