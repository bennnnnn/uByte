"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { PracticeProblem, Difficulty } from "@/lib/practice/types";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getStarterForLanguage, getAllPracticeProblems } from "@/lib/practice/problems";
import { LANGUAGES } from "@/lib/languages/registry";
import { useCodeEditor } from "@/hooks/useCodeEditor";
import ProblemSidebar from "@/components/practice/ProblemSidebar";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  hard:   "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

const LANG_ORDER: SupportedLanguage[] = ["go", "python", "cpp", "javascript", "java", "rust"];

interface Props {
  problem: PracticeProblem;
  initialLang: SupportedLanguage;
}

export function PracticeIDE({ problem, initialLang }: Props) {
  const allProblems = getAllPracticeProblems();
  const [lang, setLang] = useState<SupportedLanguage>(initialLang);
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [outputIsError, setOutputIsError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [descOpen, setDescOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<"desc" | "code">("desc");

  const editor = useCodeEditor(
    getStarterForLanguage(problem, initialLang),
    lang
  );

  // When language changes, load the starter for the new language
  const prevLangRef = useRef(lang);
  useEffect(() => {
    if (lang !== prevLangRef.current) {
      editor.setCode(getStarterForLanguage(problem, lang));
      setOutput(null);
      prevLangRef.current = lang;
    }
  }, [lang, problem, editor]);

  // Record page view
  useEffect(() => {
    fetch("/api/practice-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: problem.slug }),
      credentials: "same-origin",
    }).catch(() => {});
  }, [problem.slug]);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput(null);
    setOutputIsError(false);
    try {
      const res = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editor.code, language: lang }),
      });
      const data = await res.json();

      if (res.status === 501) {
        setOutput("This language is not yet supported for code execution.");
        setOutputIsError(true);
        return;
      }
      if (res.status === 429) {
        setOutput("Too many requests. Please wait a moment before running again.");
        setOutputIsError(true);
        return;
      }
      if (res.status === 504) {
        setOutput("Request timed out. Try simpler or faster code.");
        setOutputIsError(true);
        return;
      }
      if (!res.ok) {
        setOutput(data?.Errors ?? data?.error ?? "Run failed.");
        setOutputIsError(true);
        return;
      }

      const out: string[] = [];
      if (data.CompileErrors) { out.push("Compile error:\n" + data.CompileErrors); setOutputIsError(true); }
      if (data.Errors)        { out.push(data.Errors); setOutputIsError(true); }
      if (data.Events) {
        for (const e of data.Events) {
          if (e.Message) out.push(e.Message);
        }
      }
      setOutput(out.length ? out.join("\n") : "(no output)");
    } catch {
      setOutput("Network error. Please try again.");
      setOutputIsError(true);
    } finally {
      setRunning(false);
    }
  }, [editor.code, lang]);

  const lineCount = editor.code.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Sidebar toggle */}
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          title="Toggle problem list"
          className="hidden rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 md:block"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Breadcrumb */}
        <nav className="flex min-w-0 items-center gap-1.5 text-sm" aria-label="breadcrumb">
          <a href="/practice" className="shrink-0 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
            Practice
          </a>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <a
            href={`/practice/${lang}`}
            className="shrink-0 capitalize text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            {LANGUAGES[lang]?.name ?? lang}
          </a>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
            {problem.title}
          </span>
          <span className={`ml-1 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_STYLES[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Language selector */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as SupportedLanguage)}
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {LANG_ORDER.map((l) => (
              <option key={l} value={l}>
                {LANGUAGES[l]?.name ?? l}
              </option>
            ))}
          </select>

          {/* Run */}
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            {running ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Running…
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Run
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile tabs ─────────────────────────────────────────────────── */}
      <div className="flex shrink-0 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
        {(["desc", "code"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mobileTab === tab
                ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {tab === "desc" ? "Description" : "Code"}
          </button>
        ))}
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        {/* Problem sidebar (desktop) */}
        {sidebarOpen && (
          <aside className="hidden w-60 shrink-0 md:flex">
            <ProblemSidebar problems={allProblems} activeSlug={problem.slug} lang={lang} />
          </aside>
        )}

        {/* Description panel (desktop + mobile desc tab) */}
        <div
          className={`flex flex-col overflow-hidden border-r border-zinc-200 dark:border-zinc-800 ${
            mobileTab === "desc" ? "flex" : "hidden"
          } md:flex md:w-[38%] md:min-w-[280px]`}
        >
          {/* Description header */}
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Description
            </span>
            <button
              type="button"
              onClick={() => setDescOpen((v) => !v)}
              className="hidden rounded p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 md:block"
              title={descOpen ? "Collapse" : "Expand"}
            >
              <svg className={`h-4 w-4 transition-transform ${descOpen ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Description body */}
          <div className="flex-1 overflow-y-auto bg-white p-5 dark:bg-zinc-900">
            <h1 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {problem.title}
            </h1>
            <span className={`mb-4 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_STYLES[problem.difficulty]}`}>
              {problem.difficulty}
            </span>

            <p className="mb-5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {problem.description}
            </p>

            {problem.examples.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Examples
                </h3>
                {problem.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <p className="mb-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Example {i + 1}
                    </p>
                    <div className="space-y-1 font-mono text-xs">
                      <div>
                        <span className="text-zinc-400">Input:  </span>
                        <span className="text-zinc-800 dark:text-zinc-200">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400">Output: </span>
                        <span className="text-zinc-800 dark:text-zinc-200">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div className="mt-1.5 text-zinc-500 dark:text-zinc-400">
                          <span className="not-italic">{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation: prev / next problem */}
            <div className="mt-6 flex gap-2">
              {(() => {
                const idx = allProblems.findIndex((p) => p.slug === problem.slug);
                const prev = allProblems[idx - 1];
                const next = allProblems[idx + 1];
                return (
                  <>
                    {prev && (
                      <a
                        href={`/practice/${lang}/${prev.slug}`}
                        className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-center text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
                      >
                        ← Prev
                      </a>
                    )}
                    {next && (
                      <a
                        href={`/practice/${lang}/${next.slug}`}
                        className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-center text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
                      >
                        Next →
                      </a>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Code editor + output (desktop + mobile code tab) */}
        <div
          className={`min-h-0 flex-1 flex-col overflow-hidden ${
            mobileTab === "code" ? "flex" : "hidden"
          } md:flex`}
        >
          {/* Editor */}
          <div className="relative flex min-h-0 flex-1 overflow-hidden bg-zinc-950 font-mono text-sm">
            {/* Line numbers */}
            <div
              ref={editor.lineNumRef}
              className="hidden select-none overflow-hidden border-r border-zinc-800 bg-zinc-950 px-3 pt-4 text-right text-xs leading-relaxed text-zinc-600 sm:block"
              style={{ minWidth: "3rem" }}
              aria-hidden
            >
              {lineNumbers.map((n) => (
                <div key={n} className="leading-[1.625rem]">
                  {n}
                </div>
              ))}
            </div>

            {/* Highlighted code */}
            <pre
              ref={editor.preRef}
              className="pointer-events-none absolute bottom-0 left-0 right-0 top-0 overflow-hidden p-4 sm:left-12"
              aria-hidden
            >
              <div
                ref={editor.highlightRef}
                className="min-h-full whitespace-pre leading-[1.625rem] text-zinc-100"
                dangerouslySetInnerHTML={{
                  __html: editor.highlightGo(editor.code),
                }}
              />
            </pre>

            {/* Editable textarea overlay */}
            <textarea
              ref={editor.textareaRef}
              value={editor.code}
              onChange={(e) => editor.setCode(e.target.value)}
              onScroll={editor.syncScroll}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              className="absolute bottom-0 left-0 right-0 top-0 resize-none bg-transparent p-4 leading-[1.625rem] text-transparent caret-white focus:outline-none sm:left-12"
              style={{ caretColor: "white" }}
              aria-label="Code editor"
            />
          </div>

          {/* Output panel */}
          <div className="shrink-0 border-t border-zinc-700 bg-zinc-950">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                {outputIsError ? "Error" : "Output"}
              </span>
              {output !== null && (
                <button
                  type="button"
                  onClick={() => { setOutput(null); setOutputIsError(false); }}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="max-h-40 overflow-y-auto px-4 pb-4">
              {output === null ? (
                <p className="text-xs text-zinc-600">
                  Click Run to execute your code.
                </p>
              ) : (
                <pre
                  className={`whitespace-pre-wrap text-xs leading-relaxed ${
                    outputIsError
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                >
                  {output}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
