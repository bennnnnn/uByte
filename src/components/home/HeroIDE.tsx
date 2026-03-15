"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";

type Lang = SupportedLanguage;

const LANG_META: Record<Lang, { label: string; ext: string }> = {
  go:         { label: "Go",     ext: "go"   },
  python:     { label: "Python", ext: "py"   },
  javascript: { label: "JS",     ext: "js"   },
  java:       { label: "Java",   ext: "java" },
  rust:       { label: "Rust",   ext: "rs"   },
  cpp:        { label: "C++",    ext: "cpp"  },
  csharp:     { label: "C#",     ext: "cs"   },
};

const K = "text-violet-700 dark:text-violet-400";
const S = "text-emerald-600 dark:text-emerald-400";
const F = "text-blue-600 dark:text-blue-400";
const C = "text-zinc-400 dark:text-zinc-500";
const P = "text-cyan-600 dark:text-cyan-400";
const D = "text-slate-800 dark:text-zinc-200";
const N = "text-orange-600 dark:text-orange-400";

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
  csharp: [
    [{ t: "// greeting.cs", c: C }],
    [],
    [{ t: "using ", c: K }, { t: "System", c: P }, { t: ";", c: D }],
    [],
    [{ t: "class ", c: K }, { t: "Program", c: F }, { t: " {", c: D }],
    [{ t: "  static void ", c: K }, { t: "Main", c: F }, { t: "() {", c: D }],
    [{ t: "    Console", c: P }, { t: ".", c: D }, { t: "WriteLine", c: F }, { t: '("Hello, World!");', c: S }],
    [{ t: "  }", c: D }],
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
  csharp:     'Use Console.WriteLine() inside the Main method.',
};

export default function HeroIDE() {
  const [lang, setLang] = useState<Lang>("go");
  const meta = LANG_META[lang];
  const lines = CODE[lang];

  return (
    <div className="relative pb-6 sm:pb-8">
      {/* Floating success badge */}
      <div className="absolute right-2 top-0 z-10 flex -translate-y-1/2 items-center gap-2 rounded-xl border border-emerald-200 bg-surface-card px-3.5 py-2 text-xs font-semibold text-emerald-700 shadow-lg shadow-zinc-200/60 dark:border-emerald-800 dark:text-emerald-400 dark:shadow-zinc-900/80 sm:-right-3 sm:-top-5 sm:translate-y-0">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">✓</span>
        Step passed! +10 XP
      </div>

      {/* Floating streak badge */}
      <div className="absolute bottom-0 left-2 z-10 flex translate-y-1/2 items-center gap-2 rounded-xl border border-amber-200 bg-surface-card px-3.5 py-2 text-xs font-semibold text-amber-700 shadow-lg shadow-zinc-200/60 dark:border-amber-800 dark:text-amber-400 dark:shadow-zinc-900/80 sm:-bottom-4 sm:-left-3 sm:translate-y-0">
        <span className="text-base">🔥</span>
        3-day streak
      </div>

      <Card className="overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.10)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        {/* Window chrome + language tabs */}
        <div className="flex items-center gap-3 border-b border-zinc-100 bg-surface-card px-4 py-3 dark:border-zinc-700">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex flex-1 gap-0.5 overflow-x-auto">
            {ALL_LANGUAGE_KEYS.map((l) => (
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
          <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            {STEP_TEXT[lang]}
          </p>
        </div>

        {/* Code block */}
        <div className="bg-surface-card p-4 font-mono text-[12.5px] leading-[1.7]">
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
                    <span key={j} className={tok.c ?? D}>
                      {tok.t}
                    </span>
                  ))
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Action bar */}
        <div aria-hidden className="flex items-center gap-2 border-t border-zinc-100 bg-surface-card px-4 py-2.5 dark:border-zinc-700">
          <span className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-[11px] font-bold text-white shadow shadow-indigo-600/20">
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Run
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-[11px] font-bold text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
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
            <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">Hello, World!</span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[9px] dark:bg-emerald-900/50">✓</span>
              Correct!
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
