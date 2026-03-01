"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { hasPaidAccess } from "@/lib/plans";

declare global {
  interface Window {
    Paddle?: {
      Setup: (opts: { token: string; eventCallback?: (ev: unknown) => void }) => void;
      Checkout: {
        open: (opts: {
          items: { priceId: string; quantity: number }[];
          customData?: Record<string, string>;
          customer?: { email?: string };
        }) => void;
      };
    };
  }
}

const CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
const YEARLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID ?? "";
const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID ?? "";

export default function PricingPage() {
  const { user, profile } = useAuth();
  const paddleReady = useRef(false);

  useEffect(() => {
    if (!CLIENT_TOKEN || paddleReady.current) return;
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      if (window.Paddle) {
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

  const isPaid = hasPaidAccess(profile?.plan);
  const isYearly = profile?.plan === "yearly";
  const isMonthly = profile?.plan === "pro";

  function UpgradeButton({ priceId, label, className }: { priceId: string; label: string; className: string }) {
    if (!user) {
      return (
        <Link href="/" className={className}>Sign up to upgrade</Link>
      );
    }
    if (!priceId) {
      return <div className="rounded-xl bg-zinc-100 py-3 text-center text-sm text-zinc-400 dark:bg-zinc-800">Coming soon</div>;
    }
    return (
      <button onClick={() => openCheckout(priceId)} className={`w-full ${className}`}>{label}</button>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-zinc-900 dark:text-zinc-100">Simple pricing</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">Start free. Upgrade when you&apos;re ready.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">

        {/* Free */}
        <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-zinc-500">Free</p>
          <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">$0</p>
          <p className="mt-1 mb-6 text-sm text-zinc-400">Forever free</p>
          <ul className="mb-8 flex-1 space-y-2.5 text-sm text-zinc-600 dark:text-zinc-400">
            {["First 5 tutorials", "Interactive code editor", "Progress tracking", "Leaderboard"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                {f}
              </li>
            ))}
          </ul>
          {!user ? (
            <Link href="/" className="block rounded-xl border border-zinc-300 py-3 text-center text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Get started free
            </Link>
          ) : (
            <div className="rounded-xl border border-zinc-200 py-3 text-center text-sm font-semibold text-zinc-400 dark:border-zinc-700">
              {isPaid ? "Previous plan" : "Current plan ✓"}
            </div>
          )}
        </div>

        {/* Yearly — highlighted */}
        <div className="relative flex flex-col rounded-2xl border-2 border-indigo-500 bg-white p-7 shadow-xl dark:bg-zinc-900">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">
            50% off
          </span>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Yearly</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">$4.50<span className="text-lg font-normal text-zinc-400">/mo</span></p>
            <span className="text-sm font-medium text-zinc-400 line-through">$9</span>
          </div>
          <p className="mt-1 mb-6 text-sm font-medium text-indigo-600 dark:text-indigo-400">$54 billed yearly — save $54</p>
          <ul className="mb-8 flex-1 space-y-2.5 text-sm text-zinc-600 dark:text-zinc-400">
            {["All 20 tutorials", "AI code feedback", "Community chat", "Certificate of completion", "Best value"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                {f}
              </li>
            ))}
          </ul>
          {isYearly ? (
            <div className="rounded-xl bg-indigo-50 py-3 text-center text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">Current plan ✓</div>
          ) : isMonthly ? (
            <div className="rounded-xl border border-zinc-200 py-3 text-center text-sm text-zinc-400 dark:border-zinc-700">You&apos;re on Monthly</div>
          ) : (
            <UpgradeButton priceId={YEARLY_PRICE_ID} label="Get Yearly — $4.50/mo" className="block rounded-xl bg-indigo-700 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-800" />
          )}
        </div>

        {/* Monthly */}
        <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-zinc-500">Monthly</p>
          <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">$9<span className="text-lg font-normal text-zinc-400">/mo</span></p>
          <p className="mt-1 mb-6 text-sm text-zinc-400">Cancel anytime</p>
          <ul className="mb-8 flex-1 space-y-2.5 text-sm text-zinc-600 dark:text-zinc-400">
            {["All 20 tutorials", "AI code feedback", "Community chat", "Certificate of completion", "Flexible — no commitment"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                {f}
              </li>
            ))}
          </ul>
          {isMonthly ? (
            <div className="rounded-xl bg-zinc-100 py-3 text-center text-sm font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">Current plan ✓</div>
          ) : isYearly ? (
            <div className="rounded-xl border border-zinc-200 py-3 text-center text-sm text-zinc-400 dark:border-zinc-700">You&apos;re on Yearly</div>
          ) : (
            <UpgradeButton priceId={MONTHLY_PRICE_ID} label="Get Monthly — $9/mo" className="block rounded-xl border border-zinc-300 py-3 text-center text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800" />
          )}
        </div>

      </div>

      <p className="mt-8 text-center text-xs text-zinc-400">
        Payments processed securely by{" "}
        <a href="https://paddle.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Paddle</a>.
        Taxes handled automatically.
      </p>
    </div>
  );
}
