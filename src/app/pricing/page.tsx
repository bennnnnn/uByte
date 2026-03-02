"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { hasPaidAccess } from "@/lib/plans";

const CLIENT_TOKEN    = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
const YEARLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID ?? "";
const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID ?? "";

const FREE_FEATURES = [
  "5 free tutorials per language",
  "Interactive code editor",
  "6 programming languages",
  "Interview practice problems",
  "Progress tracking",
];

const PRO_FEATURES = [
  "All tutorials — every language",
  "AI code feedback on every step",
  "Community chat",
  "Certificate of completion",
  "Priority support",
  "New content as it ships",
];

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PricingContent() {
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const paddleReady = useRef(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const showSuccess = searchParams.get("success") === "1";

  useEffect(() => {
    if (!CLIENT_TOKEN || paddleReady.current) return;
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      if (window.Paddle) {
        if (CLIENT_TOKEN.startsWith("test_")) window.Paddle.Environment.set("sandbox");
        window.Paddle.Setup({ token: CLIENT_TOKEN });
        paddleReady.current = true;
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  function openCheckout(priceId: string) {
    if (!window.Paddle || !priceId) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: user ? { userId: String(user.id) } : undefined,
      customer:   user ? { email: user.email }       : undefined,
      settings: {
        successUrl:  `${origin}/pricing?success=1`,
        displayMode: "overlay",
        variant:     "one-page",
      },
    });
  }

  const isYearly   = profile?.plan === "yearly";
  const isMonthly  = profile?.plan === "pro";
  const isPaid     = hasPaidAccess(profile?.plan);
  const selectedPriceId  = billing === "yearly" ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID;
  const alreadyOnSelected = billing === "yearly" ? isYearly : isMonthly;
  const onOtherPlan       = billing === "yearly" ? isMonthly : isYearly;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="bg-gradient-to-b from-zinc-950 to-zinc-900 px-6 pb-20 pt-16 sm:px-8">

        {/* ── Success banner ─────────────────────────────────────────── */}
        {showSuccess && (
          <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-emerald-500/30 bg-emerald-950/60 px-6 py-4 text-center">
            <p className="font-semibold text-emerald-300">🎉 Payment successful. Welcome to Pro!</p>
            <p className="mt-1 text-sm text-emerald-400">Your plan is now active. Check your email for the receipt.</p>
          </div>
        )}

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Pricing
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Start free.{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Unlock everything.
            </span>
          </h1>
          <p className="mt-4 text-base text-zinc-400 sm:text-lg">
            No card required to start. Upgrade when you&rsquo;re ready for the full experience.
          </p>
        </div>

        {/* ── Billing toggle ─────────────────────────────────────────── */}
        <div className="mx-auto mt-10 flex max-w-xs justify-center">
          <div className="flex w-full rounded-xl border border-zinc-700 bg-zinc-800/60 p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                billing === "monthly"
                  ? "bg-white text-zinc-900 shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
                billing === "yearly"
                  ? "bg-white text-zinc-900 shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Yearly
              <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                −58%
              </span>
            </button>
          </div>
        </div>

        {/* ── Cards ──────────────────────────────────────────────────── */}
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">

          {/* Free card */}
          <div className="flex flex-col rounded-2xl border border-zinc-700 bg-zinc-800/40 p-8">
            <div className="mb-6">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-400">Free</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-zinc-500">forever</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">Get started with no commitment.</p>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-700">
                    <CheckIcon className="h-3 w-3 text-zinc-300" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/"
              className="block rounded-xl border border-zinc-600 py-3 text-center text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-400 hover:text-white"
            >
              Start for free
            </Link>
          </div>

          {/* Pro card */}
          <div className="relative flex flex-col rounded-2xl border border-indigo-500/60 bg-gradient-to-b from-indigo-950/60 to-zinc-900 p-8 shadow-xl shadow-indigo-900/30 ring-1 ring-indigo-500/20">
            {/* Popular badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-indigo-600/40">
                Most popular
              </span>
            </div>

            <div className="mb-6">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-400">Pro</p>
              {billing === "monthly" ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">$9.99</span>
                    <span className="text-zinc-400">/month</span>
                  </div>
                  <p className="mt-1.5 text-sm text-zinc-500">Cancel anytime.</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">$4.17</span>
                    <span className="text-zinc-400">/month</span>
                  </div>
                  <p className="mt-1.5 text-sm">
                    <span className="font-semibold text-emerald-400">$49.99 billed yearly</span>
                    <span className="ml-2 text-zinc-500 line-through">$119.88</span>
                    <span className="ml-1.5 text-zinc-400">— save $70</span>
                  </p>
                </div>
              )}
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-200">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600/40">
                    <CheckIcon className="h-3 w-3 text-indigo-300" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            {alreadyOnSelected ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-900/40 py-3.5 text-sm font-semibold text-emerald-300">
                <CheckIcon className="h-4 w-4" /> Current plan
              </div>
            ) : onOtherPlan ? (
              <div className="rounded-xl border border-zinc-600 py-3.5 text-center text-sm text-zinc-400">
                You&rsquo;re on {billing === "yearly" ? "Monthly" : "Yearly"}
              </div>
            ) : !user ? (
              <Link
                href="/"
                className="block rounded-xl bg-indigo-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500"
              >
                Sign up &amp; upgrade
              </Link>
            ) : !selectedPriceId ? (
              <div className="rounded-xl bg-zinc-800 py-3.5 text-center text-sm text-zinc-400">
                Coming soon
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openCheckout(selectedPriceId)}
                className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500"
              >
                {billing === "yearly" ? "Get Pro — $49.99/yr" : "Get Pro — $9.99/mo"}
              </button>
            )}

            {isPaid && (
              <p className="mt-3 text-center text-xs text-zinc-500">You already have a paid plan.</p>
            )}
          </div>
        </div>

        {/* ── Trust strip ────────────────────────────────────────────── */}
        <div className="mx-auto mt-12 max-w-xl">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Secure payments by Paddle
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
              Tax-inclusive pricing
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Cancel anytime
            </span>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-600">
            Not ready?{" "}
            <Link href="/" className="text-zinc-400 underline underline-offset-2 hover:text-zinc-200">
              Start with 5 free tutorials
            </Link>{" "}
            — no card required.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-0 flex-1 bg-zinc-950" />}>
      <PricingContent />
    </Suspense>
  );
}
