"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  BILLING_CONFIG, MONTHLY_PRICE_ID, YEARLY_PRICE_ID, hasPaidAccess,
  MONTHLY_EQUIVALENT_CENTS, YEARLY_IF_MONTHLY_CENTS, YEARLY_DISCOUNT_PERCENT,
  YEARLY_PRICE_CENTS,
} from "@/lib/plans";
import { trackConversion } from "@/lib/analytics";
import { buildAuthPageHref } from "@/lib/auth-redirect";
import { Button, Card, CheckIcon, Eyebrow, GradientText } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import PricingFAQ from "./PricingFAQ";
import PricingComparisonTable from "./PricingComparisonTable";
import { FAQ_ITEMS, FREE_FEATURES, PRO_FEATURES } from "./content";

const CLIENT_TOKEN     = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";

const COMPARISON_FEATURES: { name: string; free: string; pro: string }[] = [
  { name: "Tutorials", free: "✓ Unlimited", pro: "✓ Unlimited" },
  { name: "Interview prep problems", free: "✓ Unlimited", pro: "✓ Unlimited" },
  { name: "Languages", free: "9", pro: "9" },
  { name: "Certification exams", free: "✓ Free", pro: "✓ Free" },
  { name: "Verifiable certificates", free: "✓", pro: "✓" },
  { name: "Code editor", free: "✓", pro: "✓" },
  { name: "Progress tracking", free: "✓", pro: "✓" },
  { name: "Tutorial hints when stuck", free: "—", pro: "✓" },
  { name: "Practice feedback on submissions", free: "—", pro: "✓" },
  { name: "Certification exam review", free: "Basic results", pro: "Detailed review" },
  { name: "Interview simulator", free: "Timed practice", pro: "Timed practice + debrief" },
];

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, refreshProfile } = useAuth();
  const paddleReady = useRef(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [coupon, setCoupon]   = useState("");
  const showSuccess = searchParams.get("success") === "1";
  const planParam = searchParams.get("plan");
  const signupParam = searchParams.get("signup") === "1";

  useEffect(() => {
    trackConversion("viewed_pricing");
  }, []);

  // Preselect plan when coming from a pricing link (e.g. /pricing?plan=monthly|yearly).
  useEffect(() => {
    queueMicrotask(() => {
      if (planParam === "monthly") setBilling("monthly");
      else if (planParam === "yearly") setBilling("yearly");
    });
  }, [planParam]);

  // After a successful checkout, sync the plan from Paddle and refresh the profile.
  // This ensures the UI reflects the correct plan even if the webhook is delayed.
  useEffect(() => {
    if (!showSuccess || !user) return;
    apiFetch("/api/billing/sync").then((res) => {
      if (res.ok) refreshProfile();
    }).catch(() => {});
  // refreshProfile is excluded: it's a stable function from useAuth but its reference
  // is not guaranteed by the type, and including it risks re-triggering the sync on
  // unrelated re-renders. showSuccess + user are the only meaningful triggers here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSuccess, user]);

  // Preserve old pricing links that still use ?signup=1 by forwarding to the page-based signup flow.
  useEffect(() => {
    if (user || !signupParam) return;
    const nextPath = `/pricing${planParam ? `?plan=${planParam}` : ""}`;
    router.replace(buildAuthPageHref("signup", nextPath));
  }, [planParam, router, signupParam, user]);

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

  async function openCheckout(priceId: string) {
    if (!window.Paddle || !priceId) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    // Fetch a server-generated nonce (tied to authenticated userId server-side).
    // This prevents a malicious actor from spoofing another user's ID in customData.
    // Must use apiFetch so the CSRF token is included — plain fetch returns 403.
    let checkoutNonce: string | undefined;
    if (user) {
      try {
        // Use the plan being PURCHASED (derived from the priceId), not the current plan
        const purchasePlan = priceId === YEARLY_PRICE_ID ? "yearly" : "monthly";
        const res = await apiFetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: purchasePlan }),
        });
        if (res.ok) {
          const data = await res.json() as { checkoutNonce?: string };
          checkoutNonce = data.checkoutNonce;
        }
      } catch {
        // Non-fatal: webhook will fall back to email lookup if nonce is missing
      }
    }

    const checkoutParams: Parameters<typeof window.Paddle.Checkout.open>[0] = {
      items:      [{ priceId, quantity: 1 }],
      customData: checkoutNonce ? { checkoutNonce } : undefined,
      customer:   user ? { email: user.email } : undefined,
      settings: {
        successUrl:  `${origin}/pricing?success=1`,
        displayMode: "overlay",
        variant:     "one-page",
      },
    };
    const trimmedCoupon = coupon.trim();
    if (trimmedCoupon) {
      (checkoutParams as Record<string, unknown>).discountCode = trimmedCoupon;
    }
    window.Paddle.Checkout.open(checkoutParams);
  }

  const isYearly          = profile?.plan === "yearly";
  const isMonthly         = profile?.plan === "monthly" || profile?.plan === "pro";
  const isPaid            = hasPaidAccess(profile?.plan);
  const selectedPriceId   = billing === "yearly" ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID;
  const alreadyOnSelected = billing === "yearly" ? isYearly : isMonthly;
  const onOtherPlan       = billing === "yearly" ? isMonthly : isYearly;
  const authNextPath = `/pricing?plan=${billing}`;
  const signupHref = buildAuthPageHref("signup", authNextPath);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {/* px-4 on mobile prevents content touching screen edges on small phones */}
      <div className="px-4 pb-20 pt-8 sm:px-6 sm:pt-10">

        {/* ── Success banner ─────────────────────────────── */}
        {showSuccess && (
          <div className="mx-auto mb-6 max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-center dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">
              🎉 Payment successful. Welcome to Pro!
            </p>
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
              Your plan is now active. Check your email for the receipt.
            </p>
          </div>
        )}

        {/* ── Header (compact) ────────────────────────────── */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Everything free.{" "}
            <GradientText>
              Help when you need it.
            </GradientText>
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            Every tutorial, interview prep problem, and certification exam is free.
            <span className="ml-1 font-medium text-indigo-600 dark:text-indigo-400">Upgrade to Pro only when you want hints, code feedback, exam review, and interview debriefs that keep you moving.</span>
          </p>
        </div>

        {/* ── Social proof bar ─────────────────────────────── */}
        <div className="mx-auto mt-5 flex max-w-lg flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <span className="text-base">🎓</span>
            All content free
          </span>
          <span className="hidden text-zinc-300 dark:text-zinc-700 sm:block">·</span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <span className="text-base">💡</span>
            Help when stuck
          </span>
          <span className="hidden text-zinc-300 dark:text-zinc-700 sm:block">·</span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <span className="text-base">↩️</span>
            Cancel anytime
          </span>
        </div>

        {/* ── Billing toggle ─────────────────────────────── */}
        <div className="mx-auto mt-6 flex max-w-xs justify-center">
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
                −{YEARLY_DISCOUNT_PERCENT}%
              </span>
            </button>
          </div>
        </div>

        {/* ── Cards ──────────────────────────────────────── */}
        <div className="mx-auto mt-6 grid max-w-4xl gap-6 sm:grid-cols-2">

          {/* ── Free card ─────────────────────────────────── */}
          <Card className="flex flex-col p-5 sm:p-8">
            <div>
              <Eyebrow as="p" className="mb-1">
                Free
              </Eyebrow>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-zinc-900 dark:text-white">$0</span>
                <span className="text-zinc-400 dark:text-zinc-500">forever</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Every tutorial, interview prep problem, and certification exam is included.
              </p>
            </div>

            <div className="mt-5">
              {!user ? (
                <Link
                  href={signupHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3.5 text-center text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-surface-card dark:text-zinc-200 dark:hover:border-zinc-500"
                >
                  Get started free
                </Link>
              ) : isPaid ? (
                <div className="rounded-xl border border-zinc-200 py-3.5 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
                  You&rsquo;re on Pro
                </div>
              ) : (
                <Link
                  href="/tutorial/go"
                  className="block rounded-xl border border-zinc-300 py-3.5 text-center text-sm font-semibold text-zinc-700 transition-colors hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-indigo-600 dark:hover:text-indigo-400"
                >
                  Continue learning →
                </Link>
              )}
            </div>

            <ul className="mt-6 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <CheckIcon dim />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </Card>

          {/* ── Pro card ──────────────────────────────────── */}
          <div className="relative flex flex-col rounded-2xl border-2 border-indigo-400 bg-gradient-to-b from-indigo-50 to-white p-5 shadow-lg shadow-indigo-100 sm:p-8 dark:border-indigo-500/60 dark:from-indigo-950/50 dark:to-zinc-900 dark:shadow-indigo-900/20">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white shadow shadow-indigo-600/30">
                {billing === "yearly" ? "Best value" : "Most flexible"}
              </span>
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Pro
              </p>
              {billing === "monthly" ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-zinc-900 dark:text-white">
                      {BILLING_CONFIG.monthly.priceText.replace("/month", "")}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">/month</span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {BILLING_CONFIG.monthly.subLabel}. Switch to yearly to save {YEARLY_DISCOUNT_PERCENT}%.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-zinc-900 dark:text-white">${(MONTHLY_EQUIVALENT_CENTS / 100).toFixed(2)}</span>
                    <span className="text-zinc-500 dark:text-zinc-400">/month</span>
                  </div>
                  <p className="mt-0.5 text-sm">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {BILLING_CONFIG.yearly.priceText.replace("/year", " billed yearly")}
                    </span>
                    <span className="mx-1.5 text-zinc-400 line-through dark:text-zinc-500">${(YEARLY_IF_MONTHLY_CENTS / 100).toFixed(2)}</span>
                  </p>
                  <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    You save ${((YEARLY_IF_MONTHLY_CENTS - YEARLY_PRICE_CENTS) / 100).toFixed(2)} per year
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5">
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
                <Link
                  href={signupHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
                >
                  Get Pro
                </Link>
              ) : !selectedPriceId ? (
                <div className="rounded-xl bg-zinc-100 py-3.5 text-center text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  Coming soon
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Optional coupon code field — Paddle applies the discount at checkout */}
                  <div>
                    <label htmlFor="pricing-coupon" className="sr-only">
                      Coupon code (optional)
                    </label>
                    <input
                      id="pricing-coupon"
                      name="coupon"
                      type="text"
                      placeholder="Coupon code (optional)"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => openCheckout(selectedPriceId)}
                    size="lg"
                    className="w-full py-3.5"
                  >
                    {billing === "yearly"
                      ? `Subscribe — ${BILLING_CONFIG.yearly.priceText.replace("/year", "/yr")}`
                      : `Subscribe — ${BILLING_CONFIG.monthly.priceText.replace("/month", "/mo")}`}
                  </Button>
                  <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
                    Cancel anytime
                  </p>
                </div>
              )}
            </div>

            <ul className="mt-6 space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-200">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-600/30">
                    <CheckIcon />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {isPaid && (
              <p className="mt-3 text-center text-xs text-zinc-400 dark:text-zinc-500">
                You already have a paid plan.
              </p>
            )}
          </div>
        </div>

        {/* ── Feature comparison table ─────────────────────── */}
        <PricingComparisonTable rows={COMPARISON_FEATURES} />

        {/* ── FAQ (accordion) ─────────────────────────────── */}
        <PricingFAQ items={FAQ_ITEMS} />

        {/* ── Bottom CTA ─────────────────────────────────── */}
        <div className="mx-auto mt-10 max-w-xl rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-8 text-center dark:border-indigo-800/50 dark:bg-indigo-950/20">
          <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">
            Stay in flow. Improve faster.
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Everything is free. Pro keeps help one click away when you need a hint, feedback, exam review, or interview debrief.
          </p>
          <div className="mt-6">
            {!user ? (
              <Link
                href={signupHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
              >
                Get Pro →
              </Link>
            ) : !isPaid && selectedPriceId ? (
              <Button
                type="button"
                onClick={() => openCheckout(selectedPriceId)}
                size="lg"
                className="px-8 py-3.5"
              >
                Subscribe to Pro →
              </Button>
            ) : null}
          </div>
        </div>

        {/* ── Trust strip ────────────────────────────────── */}
        <div className="mx-auto mt-14 max-w-2xl">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">🔒</span>
              Secure payments
            </span>
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">↩️</span>
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">🌍</span>
              Available worldwide
            </span>
          </div>
          <p className="mt-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
            Not sure yet?{" "}
            <Link
              href={user ? "/tutorial/go" : buildAuthPageHref("signup", "/tutorial/go")}
              className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
            >
              Start with free tutorials
            </Link>
            {" "}— upgrade whenever you&rsquo;re ready.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PricingClient() {
  return (
    <Suspense fallback={
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-600" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
