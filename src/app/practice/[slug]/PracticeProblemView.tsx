"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { PracticeProblem } from "@/lib/practice/types";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getStarterForLanguage } from "@/lib/practice/problems";
import { LANGUAGES } from "@/lib/languages/registry";

const LANG_ORDER: SupportedLanguage[] = ["go", "python", "cpp", "javascript", "java", "rust"];

export function PracticeProblemView({ problem }: { problem: PracticeProblem }) {
  const [lang, setLang] = useState<SupportedLanguage>("go");

  useEffect(() => {
    fetch("/api/practice-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: problem.slug }),
      credentials: "same-origin",
    }).catch(() => {});
  }, [problem.slug]);
  const [code, setCode] = useState(() => getStarterForLanguage(problem, "go"));
  const [output, setOutput] = useState<string>("");
  const [running, setRunning] = useState(false);

  const handleLangChange = useCallback(
    (newLang: SupportedLanguage) => {
      setLang(newLang);
      setCode(getStarterForLanguage(problem, newLang));
      setOutput("");
    },
    [problem]
  );

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput("");
    try {
      const res = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: lang }),
      });
      const data = await res.json();

      if (res.status === 501) {
        setOutput("Only Go is supported for running code right now. Python and C++ coming soon.");
        return;
      }
      if (res.status === 429) {
        setOutput("Too many requests. Please wait a moment before running again.");
        return;
      }
      if (res.status === 504) {
        setOutput("Request timed out. Try simpler or faster code.");
        return;
      }
      if (!res.ok) {
        setOutput(data?.Errors ?? data?.error ?? "Run failed.");
        return;
      }

      const out: string[] = [];
      if (data.CompileErrors) out.push("Compile error:\n" + data.CompileErrors);
      if (data.Errors) out.push(data.Errors);
      if (data.Events) {
        for (const e of data.Events) {
          if (e.Message) out.push(e.Message);
        }
      }
      setOutput(out.length ? out.join("\n") : "(no output)");
    } catch (e) {
      setOutput("Network error. Please try again.");
    } finally {
      setRunning(false);
    }
  }, [code, lang]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/practice"
          className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          ← Practice
        </Link>
        <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
          {problem.difficulty}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {problem.title}
        </h1>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {problem.description}
        </p>
      </div>

      {problem.examples.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Examples
          </h3>
          <ul className="space-y-3">
            {problem.examples.map((ex, i) => (
              <li
                key={i}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Input
                </p>
                <p className="mt-0.5 font-mono text-sm text-zinc-800 dark:text-zinc-200">
                  {ex.input}
                </p>
                <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Output
                </p>
                <p className="mt-0.5 font-mono text-sm text-zinc-800 dark:text-zinc-200">
                  {ex.output}
                </p>
                {ex.explanation && (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {ex.explanation}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
          <div className="flex gap-1">
            {LANG_ORDER.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => handleLangChange(l)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  lang === l
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {LANGUAGES[l]?.name ?? l}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {running ? "Running…" : "Run"}
          </button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="h-64 w-full resize-y border-0 bg-transparent p-4 font-mono text-sm leading-relaxed text-zinc-900 focus:outline-none focus:ring-0 dark:text-zinc-100"
          placeholder="Write your code..."
        />
      </div>

      {output && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Output
          </h3>
          <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-800 dark:text-zinc-200">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
