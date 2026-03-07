"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { highlightGo } from "@/lib/highlight-go";
import { useAuth } from "./AuthProvider";
import { apiFetch } from "@/lib/api-client";

interface CodePlaygroundProps {
  code: string;
  title?: string;
}

// Stable short hash of initial code — used as editor key when no title is set
function codeHash(str: string): string {
  let h = 0;
  for (let i = 0; i < Math.min(str.length, 200); i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

export default function CodePlayground({ code: initialCode, title }: CodePlaygroundProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // slug: "variables" from "/tutorial/go/variables" or legacy "/go/variables"
  const pathParts = pathname.split("/").filter(Boolean);
  const isTutorialPath = pathParts[0] === "tutorial" && pathParts.length >= 3;
  const pathLang = isTutorialPath ? pathParts[1] : pathParts[0];
  const lang = pathLang === "golang" ? "go" : pathLang || "go";
  const slug = isTutorialPath ? pathParts[2] ?? "" : pathname.replace(/^\/(?:go|golang|python|cpp|javascript|java|rust)\//, "");
  // Stable identifier for this editor on the page
  const editorKey = title ?? codeHash(initialCode);
  // localStorage key
  const storageKey = `pg:${pathname}:${editorKey}`;

  const [code, setCode] = useState<string>(() => {
    if (typeof window === "undefined") return initialCode;
    return localStorage.getItem(storageKey) ?? initialCode;
  });

  // On mount: load from DB if user is logged in (DB is source of truth for cross-device)
  useEffect(() => {
    if (!user) return;
    fetch(`/api/code-drafts?slug=${encodeURIComponent(slug)}&key=${encodeURIComponent(editorKey)}&lang=${encodeURIComponent(lang)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.code != null && data.code !== initialCode) {
          setCode(data.code);
          localStorage.setItem(storageKey, data.code);
        }
      })
      .catch(() => {});
  // run once when the user session is established
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Keep localStorage in sync on every change
  useEffect(() => {
    if (code === initialCode) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, code);
    }
  }, [code, storageKey, initialCode]);

  // Debounced DB save for logged-in users — 1 s after last keystroke
  const apiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!user || code === initialCode) return;
    if (apiTimer.current) clearTimeout(apiTimer.current);
    apiTimer.current = setTimeout(() => {
      apiFetch("/api/code-drafts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, key: editorKey, code, lang }),
      }).catch(() => {});
    }, 1000);
    return () => { if (apiTimer.current) clearTimeout(apiTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, user?.id]);

  // Delete DB draft and clear localStorage when resetting to starter code
  const handleReset = useCallback(() => {
    setCode(initialCode);
    localStorage.removeItem(storageKey);
    if (user) {
      apiFetch("/api/code-drafts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, key: editorKey, lang }),
      }).catch(() => {});
    }
  }, [user, slug, editorKey, storageKey, initialCode, lang]);

  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isModified = code !== initialCode;
  const highlighted = useMemo(() => highlightGo(code), [code]);

  const handleRun = async () => {
    setIsRunning(true);
    setShowOutput(true);
    setOutput(null);

    try {
      const res = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (data.Errors) {
        setOutput(`Error:\n${data.Errors}`);
      } else if (data.Events && data.Events.length > 0) {
        setOutput(data.Events.map((e: { Message: string }) => e.Message).join(""));
      } else {
        setOutput("(no output)");
      }
    } catch {
      setOutput("Failed to connect to Go Playground. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (non-secure context) — silently ignore
    }
  };

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-800 px-4 py-2 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          {title && (
            <span className="ml-2 text-xs font-medium text-zinc-400">
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Bookmark button */}
          {user && (
            <button
              onClick={async () => {
                try {
                  const res = await apiFetch("/api/bookmarks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tutorialSlug: slug, snippet: code, note: title || "", lang }),
                  });
                  if (res.ok) {
                    setBookmarked(true);
                    setTimeout(() => setBookmarked(false), 2000);
                  }
                } catch { /* ignore */ }
              }}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
              title="Bookmark this code"
            >
              <svg className="h-3.5 w-3.5" fill={bookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {bookmarked ? "Saved!" : "Bookmark"}
            </button>
          )}
          {/* Reset button — only shows when code is modified */}
          {isModified && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
              title="Reset to original"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          )}
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
            title="Copy code"
          >
            {copied ? (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            title="Run code"
          >
            {isRunning ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Running...
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editable Code with Syntax Highlighting */}
      <div className="relative min-h-[120px]">
        {/* Highlighted layer (behind) */}
        <pre
          className="absolute inset-0 overflow-auto bg-zinc-900 p-4 font-mono text-sm leading-relaxed text-zinc-100 pointer-events-none"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: highlighted + "\n" }}
        />
        {/* Editable textarea (on top, transparent text) */}
        <textarea
          ref={textareaRef}
          aria-label="Code editor"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const start = e.currentTarget.selectionStart;
              const end = e.currentTarget.selectionEnd;
              const newCode = code.substring(0, start) + "    " + code.substring(end);
              setCode(newCode);
              requestAnimationFrame(() => {
                if (textareaRef.current) {
                  textareaRef.current.selectionStart = start + 4;
                  textareaRef.current.selectionEnd = start + 4;
                }
              });
            }
          }}
          spellCheck={false}
          className="relative block w-full resize-none overflow-auto bg-transparent p-4 font-mono text-sm leading-relaxed text-transparent caret-white outline-none min-h-[120px]"
          style={{ height: `${Math.max(120, (code.split("\n").length + 1) * 22)}px` }}
        />
      </div>

      {/* Output */}
      {showOutput && (
        <div className="border-t border-zinc-700 bg-zinc-950">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-medium text-zinc-500">Output</span>
            <button
              onClick={() => setShowOutput(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Hide
            </button>
          </div>
          <div className="px-4 pb-4">
            {output === null ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Waiting for output...
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-green-400">
                {output}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
