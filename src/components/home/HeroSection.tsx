"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";

import type { SupportedLanguage } from "@/lib/languages/types";
import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import { GradientText } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";

type Lang = SupportedLanguage;

const LANG_META: Record<Lang, { label: string; ext: string }> = {
  go:         { label: "Go",     ext: "go"   },
  python:     { label: "Python", ext: "py"   },
  javascript: { label: "JS",     ext: "js"   },
  java:       { label: "Java",   ext: "java" },
  rust:       { label: "Rust",   ext: "rs"   },
  cpp:        { label: "C++",    ext: "cpp"  },
};

// Token color classes (avoids inline style attributes)
const K = "text-violet-700 dark:text-violet-400"; // keyword
const S = "text-emerald-600 dark:text-emerald-400"; // string
const F = "text-blue-600 dark:text-blue-400"; // function
const C = "text-zinc-400 dark:text-zinc-500"; // comment
const P = "text-cyan-600 dark:text-cyan-400"; // package
const D = "text-slate-800 dark:text-zinc-200"; // default
const N = "text-orange-600 dark:text-orange-400"; // number

type T = { t: string; c?: string };

const CODE: Record<Lang, T[][]> = {
  go: [
    [{ t: "package", c: K }, { t: " main", c: D }],
    [],
    [{ t: "import ", c: K }, { t: '"fmt"', c: S }],
    [],
    [{ t: "func ", c: K }, { t: "main", c: F }, { t: "() {", c: D }],
    [{ t: "  " }, { t: "fmt", c: P }, { t: ".", c: D }, { t: "Println", c: F }, { t: '("Hello, World!")', c: S }],
    [{ t: "}", c: D }],
  ],
  python: [
    [{ t: "# greeting.py", c: C }],
    [],
    [{ t: "name", c: D }, { t: " = ", c: K }, { t: '"World"', c: S }],
    [],
    [{ t: "def ", c: K }, { t: "greet", c: F }, { t: "(name):", c: D }],
    [{ t: "    return ", c: K }, { t: 'f"Hello, {name}!"', c: S }],
    [],
    [{ t: "print", c: F }, { t: "(", c: D }, { t: "greet", c: F }, { t: "(name))", c: D }],
  ],
  javascript: [
    [{ t: "// greeting.js", c: C }],
    [],
    [{ t: "const ", c: K }, { t: "greet ", c: D }, { t: "= ", c: K }, { t: "(name) => {", c: D }],
    [{ t: "  return ", c: K }, { t: "`Hello, ${name}!`", c: S }],
    [{ t: "};", c: D }],
    [],
    [{ t: "console", c: P }, { t: ".", c: D }, { t: "log", c: F }, { t: '(greet("World"))', c: D }],
  ],
  java: [
    [{ t: "public ", c: K }, { t: "class ", c: K }, { t: "Main ", c: F }, { t: "{", c: D }],
    [{ t: "  public static void ", c: K }, { t: "main", c: F }, { t: "(String[] args) {", c: D }],
    [{ t: "    " }, { t: "System", c: P }, { t: "." }, { t: "out", c: P }, { t: "." }, { t: "println", c: F }, { t: '("Hello, World!");', c: S }],
    [{ t: "  }", c: D }],
    [{ t: "}", c: D }],
  ],
  rust: [
    [{ t: "// greeting.rs", c: C }],
    [],
    [{ t: "fn ", c: K }, { t: "main", c: F }, { t: "() {", c: D }],
    [{ t: "  let ", c: K }, { t: "msg ", c: D }, { t: "= ", c: K }, { t: '"Hello, World!"', c: S }, { t: ";", c: D }],
    [{ t: "  println!", c: F }, { t: '("{}", msg);', c: S }],
    [{ t: "}", c: D }],
  ],
  cpp: [
    [{ t: "#include ", c: K }, { t: "<iostream>", c: S }],
    [],
    [{ t: "int ", c: K }, { t: "main", c: F }, { t: "() {", c: D }],
    [{ t: "  std", c: P }, { t: "::" }, { t: "cout ", c: F }, { t: "<< ", c: K }, { t: '"Hello, World!" ', c: S }],
    [{ t: "       " }, { t: "<< std", c: P }, { t: "::endl;", c: D }],
    [{ t: "  return ", c: K }, { t: "0", c: N }, { t: ";", c: D }],
    [{ t: "}", c: D }],
  ],
};

const STEP_TEXT: Record<Lang, string> = {
  go:         'Use fmt.Println() to print "Hello, World!" to the console.',
  python:     'Use print() with an f-string to output "Hello, World!".',
  javascript: 'Use console.log() via an arrow function to print the greeting.',
  java:       'Call System.out.println() inside the main method.',
  rust:       'Use the println!() macro to output "Hello, World!".',
  cpp:        'Use std::cout to write "Hello, World!" to stdout.',
};

const LANG_ORDER = ALL_LANGUAGE_KEYS;

const FEATURES = [
  "Write real code in your browser — zero setup, zero installs",
  "Tutorials → Interview prep → Verifiable certification, all in one",
  "Instant feedback on every step — know if you're right immediately",
  "One subscription unlocks all 6 languages, all features",
];

interface HeroSectionProps {
  /** Number of topics per language (e.g. from getAllTutorials("go").length) */
  topicCount?: number;
  /** Total lesson (step) count for Go — from getTotalLessonCount("go") */
  lessonCountGo?: number;
  /** Number of practice problems (e.g. from getAllPracticeProblems().length) */
  problemCount?: number;
}

export default function HeroSection({ topicCount = 19, lessonCountGo = 0, problemCount = 11 }: HeroSectionProps) {
  const [lang, setLang] = useState<Lang>("go");
  const { user, loading, profile } = useAuth();
  const isPro = profile?.plan === "pro" || profile?.plan === "yearly";
  const meta = LANG_META[lang];
  const lines = CODE[lang];
  const problemsLabel = problemCount >= 10 ? `${problemCount}+` : String(problemCount);
  const lessonsLabel = lessonCountGo > 0 ? String(lessonCountGo) : String(topicCount);

  return (
    <section className="relative overflow-hidden">
      {/* ── Soft glow orbs ────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/4 h-[700px] w-[700px] -translate-y-1/4 rounded-full bg-indigo-200/40 blur-[160px] dark:bg-indigo-500/15" />
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] translate-x-1/3 rounded-full bg-violet-200/30 blur-[130px] dark:bg-violet-500/10" />
        <div className="absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-200/20 blur-[110px] dark:bg-cyan-500/10" />
      </div>

      {/* ── Subtle dot grid ───────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid-28-light opacity-[0.4] dark:opacity-[0.25]" />
      <div className="pointer-events-none absolute inset-0 hidden bg-dot-grid-28-dark opacity-[0.2] dark:block" />

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-7xl flex-col px-6 lg:px-8">
        <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:py-14">

          {/* ── LEFT: Copy ────────────────────────────────────────────── */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
              Free to start · No credit card · 6 Languages
            </div>

            {/* Headline */}
            <h1 className="mb-5 text-[2.75rem] font-black leading-[1.04] tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem]">
              Learn. Practice.
              <GradientText className="mt-1 block">
                Get certified.
              </GradientText>
            </h1>

            {/* Sub */}
            <p className="mb-8 max-w-[480px] text-base leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-lg">
              The complete path from beginner to job-ready — interactive tutorials,
              LeetCode-style interview prep, and verifiable certificates. All in one place, for all 6 languages.
            </p>

            {/* Feature list */}
            <ul className="mb-10 space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-400">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTAs — adapt to auth state */}
            {!loading && (
              <div className="mb-10 flex flex-wrap gap-3">
                {isPro ? (
                  /* Pro user: go straight to learning / dashboard */
                  <>
                    <Link
                      href="/tutorial/go"
                      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
                    >
                      Continue learning
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    <Link
                      href="/certifications"
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-surface-card px-7 py-3 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                    >
                      My certifications
                    </Link>
                  </>
                ) : user ? (
                  /* Logged in, free plan: nudge upgrade */
                  <>
                    <Link
                      href="/tutorial/go"
                      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
                    >
                      Continue learning
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-surface-card px-7 py-3 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                    >
                      Upgrade to Pro
                    </Link>
                  </>
                ) : (
                  /* Logged out: free start + pricing */
                  <>
                    <Link
                      href="/tutorial/go"
                      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
                    >
                      Start for free
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-surface-card px-7 py-3 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                    >
                      See pricing
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Trust line */}
            <p className="mb-6 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {isPro
                ? "You have full access — all 6 languages, certifications, and interview prep."
                : user
                ? "Upgrade once. Unlock all 6 languages, certifications, and interview prep."
                : "Free forever for the basics. Upgrade to unlock everything."}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 border-t border-zinc-200 pt-8 dark:border-zinc-800">
              {[
                { n: "6",            label: "Languages"       },
                { n: lessonsLabel,   label: "Lessons in Go"   },
                { n: problemsLabel,  label: "Interview Qs"    },
                { n: "6",            label: "Certifications"  },
              ].map(({ n, label }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{n}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: IDE mockup ─────────────────────────────────────── */}
          <div className="relative">
            {/* Floating success badge */}
            <div className="absolute -right-3 -top-5 z-10 flex items-center gap-2 rounded-xl border border-emerald-200 bg-surface-card px-3.5 py-2 text-xs font-semibold text-emerald-600 shadow-lg shadow-zinc-200/60 dark:border-emerald-800 dark:text-emerald-400 dark:shadow-zinc-900/80">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] dark:bg-emerald-900/50">✓</span>
              Step passed! +10 XP
            </div>

            {/* Floating streak badge */}
            <div className="absolute -bottom-4 -left-3 z-10 flex items-center gap-2 rounded-xl border border-amber-200 bg-surface-card px-3.5 py-2 text-xs font-semibold text-amber-600 shadow-lg shadow-zinc-200/60 dark:border-amber-800 dark:text-amber-400 dark:shadow-zinc-900/80">
              <span className="text-base">🔥</span>
              3-day streak
            </div>

            {/* IDE card */}
            <Card className="overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.10)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">

              {/* Window chrome + language tabs */}
              <div className="flex items-center gap-3 border-b border-zinc-100 bg-surface-card px-4 py-3 dark:border-zinc-700">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400/80" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="flex flex-1 gap-0.5 overflow-x-auto">
                  {LANG_ORDER.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l)}
                      aria-current={l === lang ? "true" : undefined}
                      className={`shrink-0 rounded-md px-3 py-1 text-[11px] font-semibold transition-all ${
                        l === lang
                          ? "bg-indigo-600 text-white"
                          : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                      }`}
                    >
                      {LANG_META[l].label}
                    </button>
                  ))}
                </div>
                <span className="shrink-0 rounded bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500">
                  hello.{meta.ext}
                </span>
              </div>

              {/* Step instruction banner */}
              <div className="border-b border-zinc-100 bg-indigo-50/60 px-4 py-3 dark:border-zinc-700 dark:bg-indigo-950/40">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-400">
                    Step 1 / 5
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Getting Started</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400" suppressHydrationWarning>
                  {STEP_TEXT[lang]}
                </p>
              </div>

              {/* Code block */}
              <div className="bg-surface-card p-4 font-mono text-[12.5px] leading-[1.7]" suppressHydrationWarning>
                {lines.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="mr-4 w-4 shrink-0 select-none text-right text-[10px] leading-[1.7] text-zinc-300 dark:text-zinc-600">
                      {i + 1}
                    </span>
                    <span>
                      {line.length === 0 ? (
                        <span className="opacity-0">.</span>
                      ) : (
                        line.map((tok, j) => (
                          <span key={j} className={tok.c ?? D} suppressHydrationWarning>
                            {tok.t}
                          </span>
                        ))
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action bar (decorative demo only) */}
              <div aria-hidden className="flex items-center gap-2 border-t border-zinc-100 bg-surface-card px-4 py-2.5 dark:border-zinc-700">
                <span className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-[11px] font-bold text-white shadow shadow-indigo-600/20">
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Run
                </span>
                <span className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-[11px] font-bold text-emerald-600">
                  ✓ Check
                </span>
                <span className="ml-auto text-[10px] text-zinc-300 dark:text-zinc-500">◉ Format</span>
              </div>

              {/* Output */}
              <div className="border-t border-zinc-100 bg-surface-card px-4 py-3 dark:border-zinc-700">
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-300 dark:text-zinc-500">
                  Output
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-600">Hello, World!</span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[9px]">✓</span>
                    Correct!
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Scroll hint */}
        <a
          href="#how-heading"
          className="flex items-center justify-center gap-2 pb-6 text-zinc-400 transition-colors hover:text-indigo-500 dark:text-zinc-500 dark:hover:text-indigo-400"
        >
          <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-[11px] font-medium tracking-wide">See how it works</span>
        </a>
      </div>
    </section>
  );
}
