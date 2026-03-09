"use client";

import { useState, useRef, useMemo, useLayoutEffect } from "react";
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
  const [code, setCodeState] = useState(initialCode);
  const highlightFn = getHighlighter(lang);
  const highlightedHtml = useMemo(() => highlightFn(code), [highlightFn, code]);
  const [errorLines, setErrorLines] = useState<Set<number>>(new Set());
  const [formatting, setFormatting] = useState(false);

  const preRef       = useRef<HTMLPreElement>(null);
  const lineNumRef   = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);

  // When an external setCode call changes the value (draft load, reset, format,
  // language switch), React will rewrite textarea.value via the controlled `value`
  // prop — which the browser treats as a programmatic write and moves the cursor
  // to the end. We save the desired cursor position here and restore it right
  // after React commits the DOM update via useLayoutEffect.
  const savedCursor = useRef<{ start: number; end: number } | null>(null);

  function setCode(newCode: string) {
    const ta = textareaRef.current;
    if (ta && ta.value !== newCode) {
      // External call — ta.value already differs because the user didn't type this.
      // Save the cursor clamped to the new code's length so it stays valid.
      savedCursor.current = {
        start: Math.min(ta.selectionStart ?? 0, newCode.length),
        end:   Math.min(ta.selectionEnd   ?? 0, newCode.length),
      };
    }
    // When called from onChange (user typing), ta.value === newCode already,
    // so we don't touch savedCursor — React detects the value hasn't changed
    // vs what it last wrote and skips the DOM write, preserving the cursor.
    setCodeState(newCode);
  }

  // Restore cursor position synchronously after React commits the DOM update.
  // Only runs when `code` changes, and only acts when we saved a position.
  useLayoutEffect(() => {
    if (savedCursor.current && textareaRef.current) {
      textareaRef.current.selectionStart = savedCursor.current.start;
      textareaRef.current.selectionEnd   = savedCursor.current.end;
      savedCursor.current = null;
    }
  }, [code]);

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
