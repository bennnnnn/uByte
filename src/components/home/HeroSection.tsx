"use client";

import { useState } from "react";
import Link from "next/link";

type LangKey = "go" | "python" | "javascript" | "java" | "rust" | "cpp";

interface CodeSnippet {
  label: string;
  lines: Array<{ text: string; color?: string }>;
  output: string;
}

const SNIPPETS: Record<LangKey, CodeSnippet> = {
  go: {
    label: "Go",
    lines: [
      { text: 'package main', color: "#a78bfa" },
      { text: '' },
      { text: 'import "fmt"', color: "#34d399" },
      { text: '' },
      { text: 'func main() {', color: "#60a5fa" },
      { text: '  fmt.Println("Hello, uByte!")', color: "#e2e8f0" },
      { text: '}', color: "#60a5fa" },
    ],
    output: "Hello, uByte!",
  },
  python: {
    label: "Python",
    lines: [
      { text: '# Python is simple and readable', color: "#6b7280" },
      { text: '' },
      { text: 'name = "uByte"', color: "#e2e8f0" },
      { text: '' },
      { text: 'def greet(name):', color: "#60a5fa" },
      { text: '    return f"Hello, {name}!"', color: "#e2e8f0" },
      { text: '' },
      { text: 'print(greet(name))', color: "#34d399" },
    ],
    output: "Hello, uByte!",
  },
  javascript: {
    label: "JS",
    lines: [
      { text: '// Modern JavaScript', color: "#6b7280" },
      { text: '' },
      { text: 'const greet = (name) => {', color: "#60a5fa" },
      { text: '  return `Hello, ${name}!`', color: "#fbbf24" },
      { text: '};', color: "#60a5fa" },
      { text: '' },
      { text: 'console.log(greet("uByte"))', color: "#34d399" },
    ],
    output: "Hello, uByte!",
  },
  java: {
    label: "Java",
    lines: [
      { text: 'public class Main {', color: "#60a5fa" },
      { text: '  public static void', color: "#a78bfa" },
      { text: '      main(String[] args) {', color: "#e2e8f0" },
      { text: '' },
      { text: '    System.out.println(', color: "#34d399" },
      { text: '      "Hello, uByte!"', color: "#fbbf24" },
      { text: '    );', color: "#e2e8f0" },
      { text: '  }', color: "#60a5fa" },
      { text: '}', color: "#60a5fa" },
    ],
    output: "Hello, uByte!",
  },
  rust: {
    label: "Rust",
    lines: [
      { text: '// Memory-safe & fast', color: "#6b7280" },
      { text: '' },
      { text: 'fn main() {', color: "#60a5fa" },
      { text: '    let name = "uByte";', color: "#e2e8f0" },
      { text: '' },
      { text: '    println!("Hello, {}!", name);', color: "#34d399" },
      { text: '}', color: "#60a5fa" },
    ],
    output: "Hello, uByte!",
  },
  cpp: {
    label: "C++",
    lines: [
      { text: '#include <iostream>', color: "#34d399" },
      { text: '' },
      { text: 'int main() {', color: "#60a5fa" },
      { text: '    std::cout <<', color: "#a78bfa" },
      { text: '        "Hello, uByte!"', color: "#fbbf24" },
      { text: '        << std::endl;', color: "#e2e8f0" },
      { text: '    return 0;', color: "#e2e8f0" },
      { text: '}', color: "#60a5fa" },
    ],
    output: "Hello, uByte!",
  },
};

const LANG_ORDER: LangKey[] = ["go", "python", "javascript", "java", "rust", "cpp"];

const TAB_COLORS: Record<LangKey, string> = {
  go:         "data-[active=true]:bg-cyan-500",
  python:     "data-[active=true]:bg-blue-500",
  javascript: "data-[active=true]:bg-yellow-400 data-[active=true]:text-zinc-900",
  java:       "data-[active=true]:bg-orange-500",
  rust:       "data-[active=true]:bg-red-500",
  cpp:        "data-[active=true]:bg-violet-500",
};

export default function HeroSection() {
  const [activeLang, setActiveLang] = useState<LangKey>("go");
  const snippet = SNIPPETS[activeLang];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-indigo-950 to-zinc-900 px-6 py-12 sm:px-10 sm:py-16">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative grid gap-10 lg:grid-cols-2 lg:gap-8 lg:items-center">
        {/* Left: copy + CTAs */}
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            FREE &amp; INTERACTIVE · 6 LANGUAGES
          </div>

          <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Write real code.{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Learn faster.
            </span>
          </h1>

          <p className="mb-8 max-w-md text-base leading-relaxed text-zinc-400">
            Interactive tutorials in Go, Python, C++, JavaScript, Java, and Rust.
            No setup, no install — just open and start coding.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/go"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40"
            >
              Start learning →
            </Link>
            <Link
              href="/practice"
              className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition-all hover:border-zinc-500 hover:bg-zinc-700"
            >
              Interview practice
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500">
            <span><strong className="text-zinc-300">6</strong> languages</span>
            <span><strong className="text-zinc-300">19</strong> topics each</span>
            <span><strong className="text-zinc-300">11+</strong> practice problems</span>
          </div>
        </div>

        {/* Right: interactive code preview */}
        <div className="mx-auto w-full max-w-sm lg:max-w-none">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
            {/* Window chrome */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-xs text-zinc-500">hello.{activeLang === "cpp" ? "cpp" : activeLang === "java" ? "java" : activeLang === "rust" ? "rs" : activeLang === "javascript" ? "js" : activeLang === "python" ? "py" : "go"}</span>
              <div className="w-14" />
            </div>

            {/* Language tabs */}
            <div className="flex items-center gap-0.5 overflow-x-auto border-b border-white/10 bg-zinc-950/60 px-2 py-1.5 scrollbar-none">
              {LANG_ORDER.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  data-active={lang === activeLang}
                  onClick={() => setActiveLang(lang)}
                  className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${TAB_COLORS[lang]} data-[active=false]:text-zinc-500 data-[active=false]:hover:text-zinc-300 data-[active=true]:text-white`}
                >
                  {SNIPPETS[lang].label}
                </button>
              ))}
            </div>

            {/* Code */}
            <div className="min-h-[180px] p-4 font-mono text-xs leading-relaxed">
              {snippet.lines.map((line, i) => (
                <div key={`${activeLang}-${i}`}>
                  {line.text ? (
                    <span style={{ color: line.color ?? "#e2e8f0" }}>
                      {line.text}
                    </span>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </div>
              ))}
            </div>

            {/* Output */}
            <div className="flex items-center gap-3 border-t border-white/10 bg-zinc-950/80 px-4 py-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                ▶
              </span>
              <span className="font-mono text-xs text-emerald-400">
                {snippet.output}
              </span>
            </div>
          </div>

          {/* Label below card */}
          <p className="mt-3 text-center text-xs text-zinc-600">
            Click a language tab to see the same code in a different language
          </p>
        </div>
      </div>
    </section>
  );
}
