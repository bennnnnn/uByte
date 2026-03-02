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
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

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
    return () => { document.head.removeChild(script); };
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
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-4xl font-bold text-zinc-900 dark:text-zinc-100">Simple pricing</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Everything you need to master Go.</p>
      </div>

      {/* Billing toggle */}
      <div className="mb-8 flex justify-center">
        <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            onClick={() => setBilling("monthly")}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
              billing === "monthly"
                ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
              billing === "yearly"
                ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Yearly
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
              Save 58%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing card */}
      <div className="rounded-2xl border-2 border-indigo-500 bg-white p-8 shadow-xl dark:bg-zinc-900">

        {/* Price display */}
        {billing === "monthly" ? (
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-zinc-900 dark:text-zinc-100">$9.99</span>
              <span className="text-lg text-zinc-400">/mo</span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">Cancel anytime</p>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-zinc-900 dark:text-zinc-100">$4.17</span>
              <span className="text-lg text-zinc-400">/mo</span>
            </div>
            <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              $49.99 billed yearly —{" "}
              <span className="line-through text-zinc-400">$119.88</span>{" "}
              you save $70
            </p>
          </div>
        )}

        {/* Features */}
        <ul className="mb-8 space-y-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
              <svg className="h-4 w-4 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        {alreadyOnSelected ? (
          <div className="rounded-xl bg-indigo-50 py-3 text-center text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            Current plan ✓
          </div>
        ) : onOtherPlan ? (
          <div className="rounded-xl border border-zinc-200 py-3 text-center text-sm text-zinc-400 dark:border-zinc-700">
            You&apos;re on {billing === "yearly" ? "Monthly" : "Yearly"}
          </div>
        ) : !user ? (
          <Link
            href="/"
            className="block rounded-xl bg-indigo-700 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
          >
            Sign up to get started
          </Link>
        ) : !selectedPriceId ? (
          <div className="rounded-xl bg-zinc-100 py-3 text-center text-sm text-zinc-400 dark:bg-zinc-800">
            Coming soon
          </div>
        ) : (
          <button
            onClick={() => openCheckout(selectedPriceId)}
            className="w-full rounded-xl bg-indigo-700 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
          >
            {billing === "yearly" ? "Get Yearly — $49.99/yr" : "Get Monthly — $9.99/mo"}
          </button>
        )}

        {isPaid && (
          <p className="mt-3 text-center text-xs text-zinc-400">
            You already have a paid plan.
          </p>
        )}
      </div>

      {/* Free tier note */}
      <p className="mt-6 text-center text-sm text-zinc-400">
        Not ready?{" "}
        <Link href="/" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Start with 5 free tutorials
        </Link>{" "}
        — no credit card required.
      </p>

      <p className="mt-4 text-center text-xs text-zinc-400">
        Payments processed securely by{" "}
        <a href="https://paddle.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
          Paddle
        </a>
        . Taxes handled automatically.
      </p>
    </div>
  );
}
