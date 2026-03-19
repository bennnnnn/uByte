"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

interface Props {
  totalLessons: number;
  problemCount: number;
  certCount: number;
}

export default function HomeHero({ totalLessons, problemCount, certCount }: Props) {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const firstName = (user as { name?: string } | null)?.name?.split(" ")[0];

  if (isLoggedIn && firstName) {
    // Returning user — compact, action-oriented
    return (
      <section className="border-b border-zinc-100 bg-white py-12 sm:py-16 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">👋 Welcome back, {firstName}</p>
              <h1 className="mt-1 text-2xl font-black text-zinc-900 sm:text-3xl dark:text-zinc-100">
                Keep the momentum going.
              </h1>
              <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                Pick up where you left off, or challenge yourself with something new.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link
                href="/certifications"
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
              >
                Take a free exam
              </Link>
              <Link
                href="/practice"
                className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-700 transition-all hover:border-indigo-200 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Practice problems
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Guest hero — conversion-focused
  return (
    <section className="border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">

      {/* Main hero */}
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-24">

        {/* Social proof pill */}
        <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-800">
          🎓 Certifications are completely free — no credit card, no subscription
        </p>

        {/* Headline */}
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl lg:text-[3.5rem] lg:leading-tight dark:text-zinc-100">
          Learn to code.{" "}
          <span className="text-indigo-600 dark:text-indigo-400">Get certified for free.</span>
          <br className="hidden sm:block" />
          Actually get hired.
        </h1>

        {/* Sub-headline — specifics, not generics */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
          Interactive tutorials in 9 languages, {problemCount}+ real interview problems, and
          timed certification exams that actually prove your skills.{" "}
          <strong className="font-semibold text-zinc-700 dark:text-zinc-300">Everything in your browser. Nothing to install.</strong>
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
          >
            Start for free →
          </Link>
          <Link
            href="/certifications"
            className="rounded-xl border border-zinc-200 bg-white px-8 py-3.5 text-base font-bold text-zinc-700 transition-all hover:border-indigo-200 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            See certifications
          </Link>
        </div>

        <p className="mt-4 text-xs text-zinc-400">
          Free forever · No credit card required · Certification exams are free
        </p>

        {/* Stats — concrete, specific */}
        <div className="mt-12 grid grid-cols-2 gap-4 border-t border-zinc-100 pt-10 sm:grid-cols-4 dark:border-zinc-800">
          {[
            { value: "9",                label: "Languages",             sub: "Go, Python, TypeScript, SQL & more" },
            { value: `${totalLessons}+`, label: "Lessons",               sub: "Step-by-step, run in your browser" },
            { value: `${problemCount}+`, label: "Interview problems",    sub: "LeetCode-style with test cases" },
            { value: `${certCount}`,     label: "Free certifications",   sub: "Timed exams, shareable certificate" },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{stat.value}</p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{stat.label}</p>
              <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Value prop strip — the "why uByte" answer */}
      <div className="border-t border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: "💻",
                title: "Code runs in your browser",
                desc: "No IDE, no terminal, no installs. Open the page and start coding in seconds.",
              },
              {
                icon: "🧩",
                title: "Learn → Practice → Certify",
                desc: "Tutorials build the knowledge. Practice problems sharpen it. Certifications prove it.",
              },
              {
                icon: "🎓",
                title: "Real certificates, zero cost",
                desc: "Unlike Codecademy and Coursera — our exams and certificates are 100% free, always.",
              },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3 rounded-xl p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-lg shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-800 dark:ring-zinc-700">
                  {item.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
