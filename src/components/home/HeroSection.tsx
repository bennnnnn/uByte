"use client";

import { useState } from "react";
import Link from "next/link";

type Lang = "go" | "python" | "javascript" | "java" | "rust" | "cpp";

const LANG_META: Record<Lang, { label: string; ext: string }> = {
  go:         { label: "Go",     ext: "go"   },
  python:     { label: "Python", ext: "py"   },
  javascript: { label: "JS",     ext: "js"   },
  java:       { label: "Java",   ext: "java" },
  rust:       { label: "Rust",   ext: "rs"   },
  cpp:        { label: "C++",    ext: "cpp"  },
};

// Token colors
const K = "#c084fc"; // keyword
const S = "#86efac"; // string
const F = "#60a5fa"; // function
const C = "#6b7280"; // comment
const P = "#67e8f9"; // package / module
const D = "#e2e8f0"; // default
const N = "#fb923c"; // number

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

const LANG_ORDER: Lang[] = ["go", "python", "javascript", "java", "rust", "cpp"];

const FEATURES = [
  "Write real code in your browser — zero setup",
  "Instant pass/fail feedback on every step",
  "Same concepts taught across all 6 languages",
  "Built-in LeetCode-style interview practice",
];

export default function HeroSection() {
  const [lang, setLang] = useState<Lang>("go");
  const meta = LANG_META[lang];
  const lines = CODE[lang];

  return (
    <section className="relative overflow-hidden bg-[#060612]">
      {/* ── Ambient glow orbs ─────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/4 h-[700px] w-[700px] -translate-y-1/4 rounded-full bg-indigo-700/20 blur-[160px]" />
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] translate-x-1/3 rounded-full bg-violet-700/15 blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-700/10 blur-[110px]" />
      </div>

      {/* ── Grid overlay ──────────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#818cf8 1px, transparent 1px), linear-gradient(90deg, #818cf8 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-7xl flex-col px-6 lg:px-8">
        <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:py-0">

          {/* ── LEFT: Copy ────────────────────────────────────────────── */}
          <div>
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
              Free · No signup · 6 Languages
            </div>

            {/* Headline */}
            <h1 className="mb-5 text-[2.75rem] font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem]">
              Learn to code.
              <span className="mt-1 block bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
                In every language.
              </span>
            </h1>

            {/* Sub */}
            <p className="mb-8 max-w-[480px] text-base leading-relaxed text-zinc-400 sm:text-lg">
              Interactive tutorials in Go, Python, JavaScript, Java, Rust, and C++.
              Write real code in your browser, get instant feedback, and ace technical interviews.
            </p>

            {/* Feature list */}
            <ul className="mb-10 space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-zinc-400">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-400">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="mb-10 flex flex-wrap gap-3">
              <Link
                href="/go"
                className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/50"
              >
                Start for free
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/practice"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-zinc-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
              >
                Interview practice
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 border-t border-white/[0.07] pt-8">
              {[
                { n: "6",   label: "Languages"  },
                { n: "19",  label: "Topics each" },
                { n: "11+", label: "Problems"    },
                { n: "100%",label: "Free"        },
              ].map(({ n, label }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-white">{n}</p>
                  <p className="text-xs text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: IDE mockup ─────────────────────────────────────── */}
          <div className="relative">
            {/* Floating success badge */}
            <div className="absolute -right-3 -top-5 z-10 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-[#060612]/90 px-3.5 py-2 text-xs font-semibold text-emerald-400 shadow-xl shadow-black/40 backdrop-blur-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[11px]">✓</span>
              Step passed! +10 XP
            </div>

            {/* Floating streak badge */}
            <div className="absolute -bottom-4 -left-3 z-10 flex items-center gap-2 rounded-xl border border-amber-500/25 bg-[#060612]/90 px-3.5 py-2 text-xs font-semibold text-amber-400 shadow-xl shadow-black/40 backdrop-blur-sm">
              <span className="text-base">🔥</span>
              3-day streak
            </div>

            {/* IDE card */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c18] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">

              {/* Window chrome + language tabs */}
              <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#0a0a15] px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500/70" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
                </div>
                <div className="flex flex-1 gap-0.5 overflow-x-auto">
                  {LANG_ORDER.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l)}
                      className={`shrink-0 rounded-md px-3 py-1 text-[11px] font-semibold transition-all ${
                        l === lang
                          ? "bg-indigo-600 text-white"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {LANG_META[l].label}
                    </button>
                  ))}
                </div>
                <span className="shrink-0 rounded bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] text-zinc-600">
                  hello.{meta.ext}
                </span>
              </div>

              {/* Step instruction banner */}
              <div className="border-b border-white/[0.06] bg-indigo-950/25 px-4 py-3">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-indigo-400">
                    Step 1 / 5
                  </span>
                  <span className="text-[10px] text-zinc-600">Getting Started</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400" suppressHydrationWarning>
                  {STEP_TEXT[lang]}
                </p>
              </div>

              {/* Code block */}
              <div className="p-4 font-mono text-[12.5px] leading-[1.7]" suppressHydrationWarning>
                {lines.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="mr-4 w-4 shrink-0 select-none text-right text-[10px] leading-[1.7] text-zinc-700">
                      {i + 1}
                    </span>
                    <span>
                      {line.length === 0 ? (
                        <span className="opacity-0">.</span>
                      ) : (
                        line.map((tok, j) => (
                          <span key={j} style={{ color: tok.c ?? D }} suppressHydrationWarning>
                            {tok.t}
                          </span>
                        ))
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-2 border-t border-white/[0.06] bg-[#0a0a15] px-4 py-2.5">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-[11px] font-bold text-white shadow shadow-indigo-600/30 transition-colors hover:bg-indigo-500"
                >
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Run
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20"
                >
                  ✓ Check
                </button>
                <span className="ml-auto text-[10px] text-zinc-700">◉ Format</span>
              </div>

              {/* Output */}
              <div className="border-t border-white/[0.06] bg-black/40 px-4 py-3">
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-700">
                  Output
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-400">Hello, World!</span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[9px]">✓</span>
                    Correct!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="flex items-center justify-center gap-2 pb-6 text-zinc-700">
          <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-[11px] tracking-wide">Scroll to explore</span>
        </div>
      </div>
    </section>
  );
}
