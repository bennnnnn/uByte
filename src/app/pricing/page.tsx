"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { hasPaidAccess } from "@/lib/plans";
import { trackConversion } from "@/lib/analytics";
import AuthModal from "@/components/auth/AuthModal";

const CLIENT_TOKEN     = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
const YEARLY_PRICE_ID  = process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID ?? "";
const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID ?? "";

const FREE_FEATURES = [
  "5 free tutorials per language",
  "15 free practice problems per language",
  "Interactive code editor",
  "6 programming languages",
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

function Check({ dim = false }) {
  return (
    <svg
      className={`h-3 w-3 ${dim ? "text-zinc-400 dark:text-zinc-500" : "text-indigo-600 dark:text-indigo-400"}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PricingContent() {
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const paddleReady = useRef(false);
  const [billing, setBilling]       = useState<"monthly" | "yearly">("yearly");
  const [showAuth, setShowAuth]     = useState(false);
  const [faqOpen, setFaqOpen]       = useState<number | null>(null);
  const showSuccess = searchParams.get("success") === "1";

  useEffect(() => {
    trackConversion("viewed_pricing");
  }, []);

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
      items:      [{ priceId, quantity: 1 }],
      customData: user ? { userId: String(user.id) } : undefined,
      customer:   user ? { email: user.email }       : undefined,
      settings: {
        successUrl:  `${origin}/pricing?success=1`,
        displayMode: "overlay",
        variant:     "one-page",
      },
    });
  }

  const isYearly          = profile?.plan === "yearly";
  const isMonthly         = profile?.plan === "pro";
  const isPaid            = hasPaidAccess(profile?.plan);
  const selectedPriceId   = billing === "yearly" ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID;
  const alreadyOnSelected = billing === "yearly" ? isYearly : isMonthly;
  const onOtherPlan       = billing === "yearly" ? isMonthly : isYearly;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <div className="px-6 pb-20 pt-16 sm:px-8">

        {/* ── Success banner ─────────────────────────────── */}
        {showSuccess && (
          <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-center dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">
              🎉 Payment successful. Welcome to Pro!
            </p>
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
              Your plan is now active. Check your email for the receipt.
            </p>
          </div>
        )}

        {/* ── Header ─────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
            Pricing
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-4xl lg:text-5xl">
            Start free.{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              Unlock everything.
            </span>
          </h1>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 sm:text-lg">
            No card required to start. Upgrade when you&rsquo;re ready for the full experience.
          </p>
        </div>

        {/* ── Billing toggle ─────────────────────────────── */}
        <div className="mx-auto mt-10 flex max-w-xs justify-center">
          <div className="flex w-full rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/60">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                billing === "monthly"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
                billing === "yearly"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Yearly
              <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                −58%
              </span>
            </button>
          </div>
        </div>

        {/* ── Cards ──────────────────────────────────────── */}
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">

          {/* ── Free card ─────────────────────────────────── */}
          <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900">
            <div className="mb-6">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Free
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-zinc-900 dark:text-white">$0</span>
                <span className="text-zinc-400 dark:text-zinc-500">forever</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Get started with no commitment.
              </p>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <Check dim />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* Free CTA — context-aware */}
            {!user ? (
              <button
                type="button"
                onClick={() => setShowAuth(true)}
                className="block w-full rounded-xl border border-zinc-300 py-3 text-center text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400 dark:hover:text-white"
              >
                Create free account
              </button>
            ) : isPaid ? (
              <div className="rounded-xl border border-zinc-200 py-3 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
                You&rsquo;re on a Pro plan
              </div>
            ) : (
              <Link
                href="/tutorial/go"
                className="block rounded-xl border border-zinc-300 py-3 text-center text-sm font-semibold text-zinc-700 transition-colors hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-indigo-600 dark:hover:text-indigo-400"
              >
                Continue learning →
              </Link>
            )}
          </div>

          {/* ── Pro card ──────────────────────────────────── */}
          <div className="relative flex flex-col rounded-2xl border border-indigo-300 bg-gradient-to-b from-indigo-50 to-white p-8 shadow-lg shadow-indigo-100 dark:border-indigo-500/50 dark:from-indigo-950/50 dark:to-zinc-900 dark:shadow-indigo-900/20">
            {/* Popular badge — only for yearly (the recommended option) */}
            {billing === "yearly" && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white shadow shadow-indigo-600/30">
                  Most popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Pro
              </p>
              {billing === "monthly" ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-zinc-900 dark:text-white">$9.99</span>
                    <span className="text-zinc-500 dark:text-zinc-400">/month</span>
                  </div>
                  <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">Cancel anytime.</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-zinc-900 dark:text-white">$4.17</span>
                    <span className="text-zinc-500 dark:text-zinc-400">/month</span>
                  </div>
                  <p className="mt-1.5 text-sm">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      $49.99 billed yearly
                    </span>
                    <span className="mx-1.5 text-zinc-400 line-through dark:text-zinc-600">$119.88</span>
                    <span className="text-zinc-500 dark:text-zinc-400">— save $70</span>
                  </p>
                </div>
              )}
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-200">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-600/30">
                    <Check />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* Pro CTA */}
            {alreadyOnSelected ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-100 py-3.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Current plan
              </div>
            ) : onOtherPlan ? (
              <div className="rounded-xl border border-zinc-200 py-3.5 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                You&rsquo;re on {billing === "yearly" ? "Monthly" : "Yearly"}
              </div>
            ) : !user ? (
              <button
                type="button"
                onClick={() => setShowAuth(true)}
                className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow shadow-indigo-600/20 transition-colors hover:bg-indigo-700"
              >
                Sign up &amp; upgrade
              </button>
            ) : !selectedPriceId ? (
              <div className="rounded-xl bg-zinc-100 py-3.5 text-center text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                Coming soon
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openCheckout(selectedPriceId)}
                className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow shadow-indigo-600/20 transition-colors hover:bg-indigo-700"
              >
                {billing === "yearly" ? "Get Pro — $49.99/yr" : "Get Pro — $9.99/mo"}
              </button>
            )}

            {isPaid && (
              <p className="mt-3 text-center text-xs text-zinc-400 dark:text-zinc-500">
                You already have a paid plan.
              </p>
            )}
          </div>
        </div>

        {/* ── FAQ (accordion) ─────────────────────────────── */}
        <div className="mx-auto mt-14 max-w-2xl">
          <h2 className="mb-6 text-center text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Frequently asked questions
          </h2>
          <dl className="space-y-2">
            {[
              {
                q: "What's included in Pro?",
                a: "Unlimited tutorials in all 6 languages, AI code feedback on every step, practice exams with certificates, community chat, and priority support.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel from your account settings and you'll keep Pro until the end of your billing period.",
              },
              {
                q: "How does the free trial work?",
                a: "Start with 5 free tutorials per language and 15 practice problems per language. No card required. Upgrade when you want full access.",
              },
              {
                q: "Who processes payments?",
                a: "Payments are processed securely by Paddle. Tax may be added based on your location.",
              },
            ].map((faq, i) => {
              const isOpen = faqOpen === i;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900/50"
                >
                  <dt>
                    <button
                      type="button"
                      onClick={() => setFaqOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800/50"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${i}`}
                      id={`faq-question-${i}`}
                    >
                      {faq.q}
                      <span
                        className={`shrink-0 text-zinc-400 transition-transform dark:text-zinc-500 ${isOpen ? "rotate-180" : ""}`}
                        aria-hidden
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                  </dt>
                  <dd
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-question-${i}`}
                    className={`overflow-hidden text-sm text-zinc-600 transition-[height] dark:text-zinc-400 ${
                      isOpen ? "visible" : "hidden"
                    }`}
                  >
                    <p className="border-t border-zinc-100 px-4 pb-3.5 pt-1.5 dark:border-zinc-700">{faq.a}</p>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        {/* ── Trust strip ────────────────────────────────── */}
        <div className="mx-auto mt-12 max-w-xl">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-zinc-400 dark:text-zinc-600">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure payments by Paddle
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
              Tax-inclusive pricing
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel anytime
            </span>
          </div>
          <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
            Not ready?{" "}
            <button
              type="button"
              onClick={() => !user && setShowAuth(true)}
              className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {user ? (
                <Link href="/tutorial/go">Start with 5 free tutorials</Link>
              ) : (
                "Start with 5 free tutorials"
              )}
            </button>
            {" "}— no card required.
          </p>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-0 flex-1 bg-zinc-50 dark:bg-zinc-950" />}>
      <PricingContent />
    </Suspense>
  );
}
