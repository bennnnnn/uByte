"use client";

import { useState, useRef, useMemo, useEffect } from "react";
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
  highlightGo: (code: string) => string;
  highlightedHtml: string;
  preRef: React.RefObject<HTMLPreElement | null>;
  lineNumRef: React.RefObject<HTMLDivElement | null>;
  highlightRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  syncScroll: () => void;
}

export function useCodeEditor(
  initialCode: string,
  lang: SupportedLanguage = "go"
): CodeEditorState {
  const highlightFn = getHighlighter(lang);
  // highlightedHtml is only used for the server-rendered initial value of the
  // <pre> (via suppressHydrationWarning). All client-side updates happen
  // imperatively through setCode so React never rewrites the pre on re-renders.
  const highlightedHtml = useMemo(() => highlightFn(initialCode), []);  // eslint-disable-line

  // React state: consumed by line numbers, API call bodies, and callbacks.
  // NOT used to drive the <pre> content after mount — that is imperative only.
  const [code, setCodeState] = useState(initialCode);
  const [errorLines, setErrorLines] = useState<Set<number>>(new Set());

  const preRef       = useRef<HTMLPreElement>(null);
  const lineNumRef   = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);

  // Always keep a ref so setCode (called inside closures) uses the latest highlighter
  const highlightFnRef = useRef(highlightFn);
  highlightFnRef.current = highlightFn;

  // On mount: paint the <pre> with the correct initial content.
  // After this, all updates go through setCode().
  useEffect(() => {
    if (preRef.current) {
      preRef.current.innerHTML = highlightFnRef.current(initialCode) + "\n";
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function setCode(newCode: string) {
    // ── 1. Update <pre> imperatively (instant, no React involvement) ─────
    // React never reconciles the pre's innerHTML after mount, so this is the
    // only writer — no stale-render overwrite, no race with the timer.
    if (preRef.current) {
      preRef.current.innerHTML = highlightFnRef.current(newCode) + "\n";
    }

    // ── 2. Update <textarea> only for external calls ──────────────────────
    // When called from onChange the browser already has the new value
    // (ta.value === newCode), so we skip this block — cursor is never touched.
    // For external calls (draft load, reset, format, language switch) we write
    // directly and clamp the cursor so it stays in a valid position.
    const ta = textareaRef.current;
    if (ta && ta.value !== newCode) {
      const selStart = Math.min(ta.selectionStart ?? 0, newCode.length);
      const selEnd   = Math.min(ta.selectionEnd   ?? 0, newCode.length);
      ta.value = newCode;
      ta.selectionStart = selStart;
      ta.selectionEnd   = selEnd;
    }

    // ── 3. Keep React state in sync (for line numbers, API bodies, etc.) ─
    setCodeState(newCode);
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
    highlightGo: highlightFn,
    highlightedHtml,
    preRef,
    lineNumRef,
    highlightRef,
    textareaRef,
    syncScroll,
  };
}
