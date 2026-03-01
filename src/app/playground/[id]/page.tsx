"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { highlightGo } from "@/lib/highlight-go";
import ThemeToggle from "@/components/ThemeToggle";

export default function SharedPlaygroundPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const preRef = useRef<HTMLPreElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/playground?id=${params.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Snippet not found");
        const data = await res.json();
        setCode(data.code);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  function syncScroll() {
    if (textareaRef.current) {
      if (preRef.current) {
        preRef.current.scrollTop = textareaRef.current.scrollTop;
        preRef.current.scrollLeft = textareaRef.current.scrollLeft;
      }
      if (lineNumRef.current) {
        lineNumRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.slice(0, start) + "    " + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 4; });
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleRun();
    }
  }

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput(null);
    try {
      const res = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.Errors) {
        setOutput(data.Errors as string);
      } else {
        const out = ((data.Events ?? []) as { Kind: string; Message: string }[])
          .filter((e) => e.Kind === "stdout")
          .map((e) => e.Message)
          .join("");
        setOutput(out || "(no output)");
      }
    } catch {
      setOutput("Could not reach the Go compiler. Please try again.");
    } finally {
      setRunning(false);
    }
  }, [code]);

  const openInPlayground = () => {
    // Transfer to the main playground with this code
    localStorage.setItem("playground-code", code);
    router.push("/playground");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">{error}</p>
        <Link href="/playground" className="text-sm text-indigo-600 hover:text-indigo-700">Open Playground</Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
            <span className="text-base">🐹</span>
            <span className="hidden sm:inline">uByte</span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Shared Snippet</span>
          <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
            shared
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openInPlayground}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Edit in Playground
          </button>
          <ThemeToggle className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800" />
        </div>
      </header>

      {/* Editor + output */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden bg-zinc-950 font-mono text-sm leading-6">
          <div ref={lineNumRef} aria-hidden className="shrink-0 select-none overflow-hidden border-r border-zinc-800 bg-zinc-900 px-3 py-4 text-right text-zinc-600">
            {code.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
          </div>
          <div className="relative flex-1 overflow-hidden">
            <pre ref={preRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre py-4 pl-4 pr-8 text-zinc-100" dangerouslySetInnerHTML={{ __html: highlightGo(code) + "\n" }} />
            <textarea ref={textareaRef} value={code} onChange={(e) => setCode(e.target.value)} onScroll={syncScroll} onKeyDown={handleKeyDown} spellCheck={false} autoCorrect="off" autoCapitalize="off" aria-label="Go code editor" className="absolute inset-0 resize-none overflow-auto whitespace-pre bg-transparent py-4 pl-4 pr-8 text-transparent caret-white outline-none selection:bg-indigo-900/50" />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
          <button onClick={handleRun} disabled={running} title="Run (Ctrl+Enter)" className="flex items-center gap-1.5 rounded-md bg-indigo-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-50">
            {running ? "Running…" : "▶ Run"}
          </button>
          <span className="ml-auto hidden text-xs text-zinc-400 dark:text-zinc-600 lg:block">
            Ctrl+Enter = Run
          </span>
        </div>

        <div className="h-48 shrink-0 overflow-y-auto bg-zinc-50 p-4 font-mono text-sm dark:bg-zinc-950">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Output</p>
          {output === null ? (
            <p className="text-xs text-zinc-400 dark:text-zinc-600">Click Run or press Ctrl+Enter.</p>
          ) : (
            <pre className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">{output}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
