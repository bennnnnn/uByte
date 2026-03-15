"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  BILLING_CONFIG, MONTHLY_PRICE_ID, YEARLY_PRICE_ID, hasPaidAccess,
  FREE_TUTORIAL_LIMIT, MAX_FREE_PROBLEMS,
  MONTHLY_EQUIVALENT_CENTS, YEARLY_IF_MONTHLY_CENTS, YEARLY_DISCOUNT_PERCENT,
  MONTHLY_PRICE_CENTS, YEARLY_PRICE_CENTS,
} from "@/lib/plans";
import { trackConversion } from "@/lib/analytics";
import { absoluteUrl } from "@/lib/seo";
import { buildAuthPageHref } from "@/lib/auth-redirect";
import { Button, Card, CheckIcon, Eyebrow, GradientText } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";

const CLIENT_TOKEN     = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";

const FREE_FEATURES = [
  `${FREE_TUTORIAL_LIMIT} tutorials per language`,
  `${MAX_FREE_PROBLEMS} interview prep problems (2/day)`,
  "Built-in code editor",
  "7 programming languages",
  "Progress tracking",
];

const PRO_FEATURES = [
  "Unlimited tutorials — all languages",
  "Unlimited interview prep problems",
  "AI code feedback on every step",
  "Certification exams with certificates",
  "Verifiable digital certificates",
  "Add certs to LinkedIn & resume",
  "New content as it ships",
];

const COMPARISON_FEATURES: { name: string; free: string; pro: string }[] = [
  { name: "Tutorials", free: `${FREE_TUTORIAL_LIMIT} per language`, pro: "Unlimited" },
  { name: "Interview prep problems", free: `${MAX_FREE_PROBLEMS} total (2/day)`, pro: "Unlimited" },
  { name: "Languages", free: "7", pro: "7" },
  { name: "Code editor", free: "✓", pro: "✓" },
  { name: "Progress tracking", free: "✓", pro: "✓" },
  { name: "AI code feedback", free: "—", pro: "✓" },
  { name: "Certification exams", free: "—", pro: "Unlimited" },
  { name: "Verifiable certificates", free: "—", pro: "✓" },
];

const TESTIMONIALS = [
  {
    quote: "I passed my Go certification on the first try. The timed exam format is exactly like a real assessment — I actually felt prepared.",
    name: "Amir K.",
    role: "Backend Engineer",
  },
  {
    quote: "Finally a platform where I can practice Python interview questions without copying solutions from YouTube. The AI feedback is genuinely useful.",
    name: "Priya S.",
    role: "Software Developer",
  },
  {
    quote: "Added my Rust certificate to LinkedIn within an hour of passing. Three recruiters reached out that week.",
    name: "James T.",
    role: "Systems Programmer",
  },
];

const FAQ_ITEMS = [
  {
    q: "What's included in Pro?",
    a: "Unlimited tutorials in all 7 languages, unlimited interview prep problems, AI code feedback on every step, and timed certification exams with shareable certificates.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings and you'll keep Pro until the end of your billing period. No questions asked.",
  },
  {
    q: "How does the free plan work?",
    a: `You get ${FREE_TUTORIAL_LIMIT} tutorials per language and ${MAX_FREE_PROBLEMS} interview prep problems (2 new ones unlock daily). Upgrade whenever you're ready for unlimited access and certifications.`,
  },
  {
    q: "Do I get a certificate?",
    a: "Yes. Pro members can take timed certification exams. Pass and you earn a verifiable digital certificate with a unique ID that you can add to your LinkedIn, resume, or portfolio.",
  },
  {
    q: "Who processes payments?",
    a: "Payments are processed securely by Paddle. Tax may be added based on your location.",
  },
  {
    q: "Is there a refund policy?",
    a: "If you're not satisfied within the first 7 days, contact us and we'll work it out. We want you to be happy.",
  },
];

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, refreshProfile } = useAuth();
  const paddleReady = useRef(false);
  const [billing, setBilling]       = useState<"monthly" | "yearly">("yearly");
  const [faqOpen, setFaqOpen]       = useState<number | null>(null);
  const [userCount, setUserCount]   = useState<number | null>(null);
  const [coupon, setCoupon]         = useState("");

  useEffect(() => {
    fetch("/api/stats/public")
      .then((r) => r.json())
      .then((j: { userCount: number }) => { if (j.userCount > 0) setUserCount(j.userCount); })
      .catch(() => {});
  }, []);
  const showSuccess = searchParams.get("success") === "1";
  const planParam = searchParams.get("plan");
  const signupParam = searchParams.get("signup") === "1";

  useEffect(() => {
    trackConversion("viewed_pricing");
  }, []);

  // Preselect plan when coming from an upgrade wall (e.g. /pricing?plan=monthly|yearly).
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
  const isMonthly         = profile?.plan === "pro";
  const isPaid            = hasPaidAccess(profile?.plan);
  const selectedPriceId   = billing === "yearly" ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID;
  const alreadyOnSelected = billing === "yearly" ? isYearly : isMonthly;
  const onOtherPlan       = billing === "yearly" ? isMonthly : isYearly;
  const authNextPath = `/pricing?plan=${billing}`;
  const signupHref = buildAuthPageHref("signup", authNextPath);
  const pricingJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "uByte Pro",
    description:
      "Full access to coding tutorials, interview prep, and certification-style exams.",
    brand: { "@type": "Brand", name: "uByte" },
    offers: [
      {
        "@type": "Offer",
        url: absoluteUrl("/pricing"),
        priceCurrency: "USD",
        price: (MONTHLY_PRICE_CENTS / 100).toFixed(2),
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          priceCurrency: "USD",
          price: (MONTHLY_PRICE_CENTS / 100).toFixed(2),
          billingDuration: "P1M",
        },
      },
      {
        "@type": "Offer",
        url: absoluteUrl("/pricing"),
        priceCurrency: "USD",
        price: (YEARLY_PRICE_CENTS / 100).toFixed(2),
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          priceCurrency: "USD",
          price: (YEARLY_PRICE_CENTS / 100).toFixed(2),
          billingDuration: "P1Y",
        },
      },
    ],
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([pricingJsonLd, faqJsonLd]),
        }}
      />
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
            Invest in your skills.{" "}
            <GradientText>
              Get certified.
            </GradientText>
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            Tutorials, interview prep, and verifiable certificates — all in one plan.
          </p>
        </div>

        {/* ── Social proof bar ─────────────────────────────── */}
        <div className="mx-auto mt-5 flex max-w-lg flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <span className="text-base">👩‍💻</span>
            {userCount
              ? `${userCount.toLocaleString()}+ developers enrolled`
              : "Developers worldwide"}
          </span>
          <span className="hidden text-zinc-300 dark:text-zinc-700 sm:block">·</span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <span className="text-base">🏅</span>
            Verifiable certificates
          </span>
          <span className="hidden text-zinc-300 dark:text-zinc-700 sm:block">·</span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <span className="text-base">✦</span>
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
          <Card className="flex flex-col p-8">
            <div>
              <Eyebrow as="p" className="mb-1">
                Free
              </Eyebrow>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-zinc-900 dark:text-white">$0</span>
                <span className="text-zinc-400 dark:text-zinc-500">forever</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Explore tutorials and interview prep problems for free.
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
          <div className="relative flex flex-col rounded-2xl border-2 border-indigo-400 bg-gradient-to-b from-indigo-50 to-white p-8 shadow-lg shadow-indigo-100 dark:border-indigo-500/60 dark:from-indigo-950/50 dark:to-zinc-900 dark:shadow-indigo-900/20">
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
                  <p className="mt-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    7-day free trial included
                  </p>
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
                  <p className="mt-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    7-day free trial included
                  </p>
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
                  Start 7-day free trial
                </Link>
              ) : !selectedPriceId ? (
                <div className="rounded-xl bg-zinc-100 py-3.5 text-center text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  Coming soon
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Optional coupon code field — Paddle applies the discount at checkout */}
                  <input
                    type="text"
                    placeholder="Coupon code (optional)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
                  />
                  <Button
                    type="button"
                    onClick={() => openCheckout(selectedPriceId)}
                    size="lg"
                    className="w-full py-3.5"
                  >
                    {billing === "yearly"
                      ? `Start 7-day trial — ${BILLING_CONFIG.yearly.priceText.replace("/year", "/yr")} after`
                      : `Start 7-day trial — ${BILLING_CONFIG.monthly.priceText.replace("/month", "/mo")} after`}
                  </Button>
                  <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
                    No charge for 7 days · Cancel anytime
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

        {/* ── What you get with Pro (visual) ──────────────── */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-2 text-center text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Everything you need to level up
          </h2>
          <p className="mb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            One plan, all languages, unlimited access.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: "📖", title: "Learn", body: "Interactive tutorials in Go, Python, JavaScript, Java, Rust, C++, and C#. Bite-sized lessons with built-in code editor." },
              { icon: "💪", title: "Interview Prep", body: "Hundreds of coding challenges across all languages. AI feedback helps you understand mistakes and improve." },
              { icon: "🏆", title: "Get certified", body: "Timed exams with real scoring. Pass and earn a verifiable digital certificate for your LinkedIn and resume." },
            ].map(({ icon, title, body }) => (
              <Card key={title} className="p-5">
                <span className="text-2xl">{icon}</span>
                <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
                <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{body}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Testimonials ─────────────────────────────────── */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-6 text-center text-lg font-bold text-zinc-900 dark:text-zinc-100">
            What developers say
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-surface-card p-5 shadow-sm dark:border-zinc-800"
              >
                <blockquote className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* ── Feature comparison table ─────────────────────── */}
        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="mb-6 text-center text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Compare plans
          </h2>
          {/* overflow-x-auto lets the table scroll horizontally on narrow phones
              instead of overflowing and breaking the layout */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <th className="px-5 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">Feature</th>
                  <th className="px-5 py-3 text-center font-semibold text-zinc-500 dark:text-zinc-400">Free</th>
                  <th className="px-5 py-3 text-center font-semibold text-indigo-600 dark:text-indigo-400">Pro</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, i) => (
                  <tr key={row.name} className={i < COMPARISON_FEATURES.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800" : ""}>
                    <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300">{row.name}</td>
                    <td className="px-5 py-3 text-center text-zinc-500 dark:text-zinc-400">{row.free}</td>
                    <td className="px-5 py-3 text-center font-medium text-zinc-900 dark:text-zinc-100">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FAQ (accordion) ─────────────────────────────── */}
        <div className="mx-auto mt-14 max-w-2xl">
          <h2 className="mb-6 text-center text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Frequently asked questions
          </h2>
          <dl className="space-y-2">
            {FAQ_ITEMS.map((faq, i) => {
              const isOpen = faqOpen === i;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl border border-zinc-200 bg-surface-card dark:border-zinc-700"
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
