"use client";

import { useState, useRef, useMemo } from "react";
import { getHighlighter } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";

export function parseErrorLines(errorText: string): Set<number> {
  const lines = new Set<number>();
  const re = /\.go:(\d+):\d+:/g;
  let m;
  while ((m = re.exec(errorText)) !== null) lines.add(parseInt(m[1], 10));
  return lines;
}

export interface CodeEditorState {
  code: string;
  setCode: (code: string) => void;
  errorLines: Set<number>;
  setErrorLines: (lines: Set<number>) => void;
  formatting: boolean;
  highlightGo: (code: string) => string;
  highlightedHtml: string;
  preRef: React.RefObject<HTMLPreElement | null>;
  lineNumRef: React.RefObject<HTMLDivElement | null>;
  highlightRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleFormat: () => Promise<void>;
  syncScroll: () => void;
}

export function useCodeEditor(
  initialCode: string,
  lang: SupportedLanguage = "go"
): CodeEditorState {
  // `code` state is consumed by: API calls, line numbers, and as the initial
  // value for dangerouslySetInnerHTML. The <pre> and <textarea> are kept in
  // sync via imperative DOM writes so React re-renders (e.g. timer every 100ms)
  // never touch the textarea or reset the cursor.
  const [code, setCodeState] = useState(initialCode);
  const highlightFn = getHighlighter(lang);
  // Memoised HTML is used only for the initial dangerouslySetInnerHTML mount;
  // subsequent updates are imperative so there is no stale-render lag.
  const highlightedHtml = useMemo(() => highlightFn(code), [highlightFn, code]);
  const [errorLines, setErrorLines] = useState<Set<number>>(new Set());
  const [formatting, setFormatting] = useState(false);

  const preRef       = useRef<HTMLPreElement>(null);
  const lineNumRef   = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);

  // Keep a ref so the imperative update always uses the latest highlighter
  // without recreating setCode.
  const highlightFnRef = useRef(highlightFn);
  highlightFnRef.current = highlightFn;

  function setCode(newCode: string) {
    // ── 1. Update <pre> imperatively ────────────────────────────────────────
    // This keeps the visible syntax-highlighted layer pixel-perfect in sync
    // with the textarea immediately — no waiting for React to reconcile.
    if (preRef.current) {
      preRef.current.innerHTML = highlightFnRef.current(newCode) + "\n";
    }

    // ── 2. Update <textarea> for external calls only ─────────────────────
    // When called from onChange the browser already updated ta.value, so
    // ta.value === newCode and we skip this block — cursor is untouched.
    // For external calls (draft load, reset, format, language switch),
    // ta.value !== newCode so we write it and clamp the cursor to stay valid.
    const ta = textareaRef.current;
    if (ta && ta.value !== newCode) {
      const selStart = Math.min(ta.selectionStart ?? 0, newCode.length);
      const selEnd   = Math.min(ta.selectionEnd   ?? 0, newCode.length);
      ta.value = newCode;
      ta.selectionStart = selStart;
      ta.selectionEnd   = selEnd;
    }

    // ── 3. Update React state ────────────────────────────────────────────
    // Consumed by: line numbers, API call bodies, and the initial render of
    // the <pre> via dangerouslySetInnerHTML (subsequent updates are imperative).
    setCodeState(newCode);
  }

  async function handleFormat() {
    if (lang !== "go") return;
    setFormatting(true);
    try {
      const body = new URLSearchParams({ body: code, imports: "true" });
      const goFmtUrl = process.env.NEXT_PUBLIC_GO_FMT_URL || "https://go.dev/_/fmt";
      const res = await fetch(goFmtUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      const data = await res.json();
      if (data.Body && !data.Error) setCode(data.Body);
    } catch { /* ignore */ } finally {
      setFormatting(false);
    }
  }

  function syncScroll() {
    const ta = textareaRef.current;
    if (!ta) return;
    if (preRef.current)       { preRef.current.scrollTop  = ta.scrollTop; preRef.current.scrollLeft = ta.scrollLeft; }
    if (lineNumRef.current)   lineNumRef.current.scrollTop   = ta.scrollTop;
    if (highlightRef.current) highlightRef.current.scrollTop = ta.scrollTop;
  }

  return {
    code,
    setCode,
    errorLines,
    setErrorLines,
    formatting,
    highlightGo: highlightFn,
    highlightedHtml,
    preRef,
    lineNumRef,
    highlightRef,
    textareaRef,
    handleFormat,
    syncScroll,
  };
}
