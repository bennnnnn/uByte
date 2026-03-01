"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { highlightGo } from "@/lib/highlight-go";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthProvider";
import Avatar from "@/components/Avatar";

const STARTER = `package main

import "fmt"

func main() {
\tfmt.Println("Hello, Playground!")
}
`;

const STORAGE_KEY = "playground-code";

export default function PlaygroundPage() {
  const { user, profile } = useAuth();

  const [code, setCode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) ?? STARTER;
    }
    return STARTER;
  });
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const preRef = useRef<HTMLPreElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist code to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, code);
  }, [code]);

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
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
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

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  function handleReset() {
    setCode(STARTER);
    setOutput(null);
    setShareUrl(null);
  }

  async function handleShare() {
    setSharing(true);
    setShareUrl(null);
    try {
      const res = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.url) {
        setShareUrl(data.url);
        await navigator.clipboard.writeText(data.url).catch(() => {});
      }
    } catch { /* ignore */ } finally {
      setSharing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">

      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            <span className="text-base">🐹</span>
            <span className="hidden sm:inline">uByte</span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Playground</span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" />
          {user && (
            <Link href="/profile" title="Your profile" className="flex items-center justify-center rounded-full transition-opacity hover:opacity-80">
              <Avatar avatarKey={profile?.avatar ?? "gopher"} size="sm" />
            </Link>
          )}
        </div>
      </header>

      {/* Editor + output */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Code editor — always dark */}
        <div className="flex flex-1 overflow-hidden bg-zinc-950 font-mono text-sm leading-6">
          {/* Line numbers */}
          <div
            ref={lineNumRef}
            aria-hidden
            className="shrink-0 select-none overflow-hidden border-r border-zinc-800 bg-zinc-900 px-3 py-4 text-right text-zinc-600"
          >
            {code.split("\n").map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          {/* Editor */}
          <div className="relative flex-1 overflow-hidden">
            <pre
              ref={preRef}
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre py-4 pl-4 pr-8 text-zinc-100"
              dangerouslySetInnerHTML={{ __html: highlightGo(code) + "\n" }}
            />
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={syncScroll}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              aria-label="Go code editor"
              className="absolute inset-0 resize-none overflow-auto whitespace-pre bg-transparent py-4 pl-4 pr-8 text-transparent caret-white outline-none selection:bg-cyan-900/50"
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex shrink-0 items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
          <button
            onClick={handleRun}
            disabled={running}
            title="Run code (Ctrl+Enter)"
            className="flex items-center gap-1.5 rounded-md bg-cyan-700 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-cyan-800 disabled:opacity-50"
          >
            {running ? "Running…" : "▶ Run"}
          </button>
          <button
            onClick={handleReset}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
          >
            Reset
          </button>
          <button
            onClick={handleCopy}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleShare}
            disabled={sharing}
            title="Share a link to this snippet"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-cyan-400 hover:text-cyan-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-cyan-700 dark:hover:text-cyan-400"
          >
            {sharing ? "Sharing…" : "Share"}
          </button>
          {shareUrl && (
            <span className="max-w-xs truncate text-xs text-cyan-600 dark:text-cyan-400" title={shareUrl}>
              Copied: {shareUrl}
            </span>
          )}
          <span className="ml-auto hidden text-xs text-zinc-400 dark:text-zinc-600 lg:block">
            Tab = indent · Ctrl+Enter = Run · Code is saved automatically
          </span>
        </div>

        {/* Output */}
        <div className="h-48 shrink-0 overflow-y-auto bg-zinc-50 p-4 font-mono text-sm dark:bg-zinc-950">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Output
          </p>
          {output === null ? (
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              Click Run or press Ctrl+Enter to execute your code.
            </p>
          ) : (
            <pre className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">{output}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
