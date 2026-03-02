"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { hasPaidAccess } from "@/lib/plans";

const CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
const YEARLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID ?? "";
const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID ?? "";

const FEATURES = [
  "All 20 tutorials",
  "AI code feedback",
  "Community chat",
  "Certificate of completion",
  "Interactive code editor",
  "Progress tracking & leaderboard",
];

export default function PricingPage() {
  const { user, profile } = useAuth();
  const paddleReady = useRef(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  useEffect(() => {
    if (!CLIENT_TOKEN || paddleReady.current) return;
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      if (window.Paddle) {
        if (CLIENT_TOKEN.startsWith("test_")) {
          window.Paddle.Environment.set("sandbox");
        }
        window.Paddle.Setup({ token: CLIENT_TOKEN });
        paddleReady.current = true;
      }
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  function openCheckout(priceId: string) {
    if (!window.Paddle || !priceId) return;
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: user ? { userId: String(user.id) } : undefined,
      customer: user ? { email: user.email } : undefined,
    });
  }

  const isYearly = profile?.plan === "yearly";
  const isMonthly = profile?.plan === "pro";
  const isPaid = hasPaidAccess(profile?.plan);

  const selectedPriceId = billing === "yearly" ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID;
  const alreadyOnSelected = billing === "yearly" ? isYearly : isMonthly;
  const onOtherPlan = billing === "yearly" ? isMonthly : isYearly;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
            Simple pricing
          </h1>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            One plan. All tutorials. Cancel anytime.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
                billing === "monthly"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
                billing === "yearly"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Yearly
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                Save 58%
              </span>
            </button>
          </div>
        </div>

        {/* Main card */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
          <div className="border-b border-zinc-100 bg-zinc-50/50 px-8 py-6 dark:border-zinc-800 dark:bg-zinc-800/30">
            {billing === "monthly" ? (
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  $9.99
                </span>
                <span className="text-lg text-zinc-500">/month</span>
                <span className="ml-2 text-sm text-zinc-500">Cancel anytime</span>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    $4.17
                  </span>
                  <span className="text-lg text-zinc-500">/month</span>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    $49.99 billed yearly
                  </span>
                  {" "}
                  — <span className="line-through text-zinc-400">$119.88</span>
                  {" "}
                  you save $70
                </p>
              </div>
            )}
          </div>

          <div className="px-8 py-8">
            <ul className="space-y-4">
              {FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {alreadyOnSelected ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-4 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="text-emerald-500">✓</span> Current plan
                </div>
              ) : onOtherPlan ? (
                <div className="rounded-2xl border border-zinc-200 py-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  You’re on {billing === "yearly" ? "Monthly" : "Yearly"}
                </div>
              ) : !user ? (
                <Link
                  href="/"
                  className="block rounded-2xl bg-zinc-900 py-4 text-center text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  Sign up to get started
                </Link>
              ) : !selectedPriceId ? (
                <div className="rounded-2xl bg-zinc-100 py-4 text-center text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  Coming soon
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openCheckout(selectedPriceId)}
                  className="w-full rounded-2xl bg-zinc-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  {billing === "yearly"
                    ? "Get Yearly — $49.99/yr"
                    : "Get Monthly — $9.99/mo"}
                </button>
              )}

              {isPaid && (
                <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  You already have a paid plan.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Trust & free tier */}
        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Not ready?{" "}
          <Link
            href="/"
            className="font-semibold text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-200 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
          >
            Start with 5 free tutorials
          </Link>
          {" "}
          — no card required.
        </p>
        <p className="mt-3 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Payments by Paddle. Secure & tax-inclusive.
        </p>
      </div>
    </div>
  );
}
