"use client";

import { useEffect, useRef } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

// Paddle.js v2 types (minimal)
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
const PRO_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID ?? "";

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

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  function handleUpgrade() {
    if (!window.Paddle || !PRO_PRICE_ID) return;
    window.Paddle.Checkout.open({
      items: [{ priceId: PRO_PRICE_ID, quantity: 1 }],
      customData: user ? { userId: String(user.id) } : undefined,
      customer: user ? { email: user.email } : undefined,
    });
  }

  const isPro = profile?.plan === "pro";

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-zinc-900 dark:text-zinc-100">Simple pricing</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">
          Learn Go for free. Upgrade for extra features.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Free */}
        <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6">
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-zinc-500">Free</p>
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">$0</p>
            <p className="mt-1 text-sm text-zinc-400">Forever free</p>
          </div>
          <ul className="mb-8 flex-1 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            {[
              "All Go tutorials",
              "Interactive code playground",
              "Progress tracking",
              "Leaderboard",
              "Certificate of completion",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          {!user ? (
            <Link
              href="/signup"
              className="block rounded-xl border border-zinc-300 py-3 text-center text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Get started free
            </Link>
          ) : (
            <div className="rounded-xl border border-zinc-200 py-3 text-center text-sm font-semibold text-zinc-400 dark:border-zinc-700">
              {isPro ? "Previous plan" : "Current plan"}
            </div>
          )}
        </div>

        {/* Pro */}
        <div className="flex flex-col rounded-2xl border-2 border-indigo-500 bg-white p-8 shadow-lg dark:bg-zinc-900">
          <div className="mb-6">
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Pro</p>
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">$9<span className="text-lg font-normal text-zinc-400">/mo</span></p>
            <p className="mt-1 text-sm text-zinc-400">Cancel anytime</p>
          </div>
          <ul className="mb-8 flex-1 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            {[
              "Everything in Free",
              "Priority support",
              "Early access to new languages",
              "Remove view limits",
              "Pro badge on leaderboard",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          {isPro ? (
            <div className="rounded-xl bg-indigo-50 py-3 text-center text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Current plan — Active
            </div>
          ) : !user ? (
            <Link
              href="/signup"
              className="block rounded-xl bg-indigo-700 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
            >
              Sign up to upgrade
            </Link>
          ) : !PRO_PRICE_ID ? (
            <div className="rounded-xl bg-zinc-100 py-3 text-center text-sm text-zinc-400 dark:bg-zinc-800">
              Coming soon
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              className="rounded-xl bg-indigo-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-zinc-400">
        Payments are processed securely by{" "}
        <a href="https://paddle.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
          Paddle
        </a>
        . Paddle is the Merchant of Record — taxes handled automatically.
      </p>
    </div>
  );
}
