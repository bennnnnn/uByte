import Link from "next/link";
import { MONTHLY_PRICE_CENTS } from "@/lib/plans";

const PILLARS = [
  {
    title: "Interactive Tutorials",
    metric: "130+ chapters",
    desc: "Write and run real code in your browser. Step-by-step lessons with instant AI-powered feedback across all 7 languages.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: "Interview Prep",
    metric: "50+ problems",
    desc: "LeetCode-style challenges covering arrays, strings, dynamic programming, trees, and graphs. AI hints when you're stuck.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Verifiable Certifications",
    metric: "7 languages",
    desc: "Pass a timed exam, download a PDF certificate, and share it on LinkedIn. Recruiters actually look at these.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

interface ValuePropBannerProps {
  isPro?: boolean;
}

export default function ValuePropBanner({ isPro = false }: ValuePropBannerProps) {
  if (isPro) return null;

  return (
    <section
      aria-labelledby="value-prop-heading"
      className="relative overflow-hidden rounded-2xl bg-zinc-900 px-6 py-10 shadow-xl sm:px-10 sm:py-14 dark:bg-zinc-950"
    >
      {/* Background glow orbs */}
      <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/15 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-violet-500/15 blur-[120px]" />
      {/* Subtle grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-indigo-300">
            Everything in one place
          </div>
          <h2
            id="value-prop-heading"
            className="text-2xl font-black tracking-tight text-white sm:text-3xl"
          >
            From beginner to hire-ready.
          </h2>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            One subscription. Three powerful tools. All 7 languages.
          </p>
        </div>

        {/* Pillars */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-5 backdrop-blur-sm transition-colors hover:border-white/[0.12] hover:bg-white/[0.07]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                  {p.icon}
                </div>
                <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300">
                  {p.metric}
                </span>
              </div>
              <p className="mb-1.5 text-sm font-bold text-white">{p.title}</p>
              <p className="text-xs leading-relaxed text-zinc-400">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-indigo-500/45"
          >
            See plans — from ${(MONTHLY_PRICE_CENTS / 100).toFixed(2)}/mo
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/tutorial/go"
            className="text-sm font-semibold text-zinc-400 underline-offset-2 transition-colors hover:text-white hover:underline"
          >
            Start free first →
          </Link>
        </div>
      </div>
    </section>
  );
}
