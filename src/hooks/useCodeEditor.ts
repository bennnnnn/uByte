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
  // `code` state is used ONLY for syntax highlighting.
  // The textarea's live value lives in the DOM (uncontrolled) so that
  // React never resets the cursor position on re-renders.
  const [code, setCodeState] = useState(initialCode);
  const highlightFn = getHighlighter(lang);
  const highlightedHtml = useMemo(() => highlightFn(code), [highlightFn, code]);
  const [errorLines, setErrorLines] = useState<Set<number>>(new Set());
  const [formatting, setFormatting] = useState(false);

  const preRef = useRef<HTMLPreElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Update the editor code.
   *
   * When called from onChange (user typing), `textareaRef.current.value`
   * already has the new value — we only need to sync the React state for
   * syntax highlighting, which causes no cursor jump because the textarea
   * is uncontrolled (uses `defaultValue`).
   *
   * When called externally (draft load, reset, format, language switch),
   * we write directly to the DOM with cursor clamping so the position is
   * preserved (or clamped to the end of the shorter code).
   */
  function setCode(newCode: string) {
    const ta = textareaRef.current;
    if (ta && ta.value !== newCode) {
      // Save cursor before touching the DOM value
      const selStart = ta.selectionStart ?? 0;
      const selEnd   = ta.selectionEnd   ?? 0;
      ta.value = newCode;
      // Clamp so the cursor stays valid if the new code is shorter
      ta.selectionStart = Math.min(selStart, newCode.length);
      ta.selectionEnd   = Math.min(selEnd,   newCode.length);
    }
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
    if (preRef.current)       preRef.current.scrollTop  = ta.scrollTop;
    if (preRef.current)       preRef.current.scrollLeft = ta.scrollLeft;
    if (lineNumRef.current)   lineNumRef.current.scrollTop  = ta.scrollTop;
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
