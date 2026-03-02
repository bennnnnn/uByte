"use client";

import { useState, useRef } from "react";
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
  const [code, setCode] = useState(initialCode);
  const highlightFn = getHighlighter(lang);
  const [errorLines, setErrorLines] = useState<Set<number>>(new Set());
  const [formatting, setFormatting] = useState(false);

  const preRef = useRef<HTMLPreElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleFormat() {
    setFormatting(true);
    try {
      const body = new URLSearchParams({ body: code, imports: "true" });
      const res = await fetch("https://go.dev/_/fmt", {
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
    if (textareaRef.current) {
      if (preRef.current) {
        preRef.current.scrollTop = textareaRef.current.scrollTop;
        preRef.current.scrollLeft = textareaRef.current.scrollLeft;
      }
      if (lineNumRef.current) {
        lineNumRef.current.scrollTop = textareaRef.current.scrollTop;
      }
      if (highlightRef.current) {
        highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    }
  }

  return {
    code,
    setCode,
    errorLines,
    setErrorLines,
    formatting,
    highlightGo: highlightFn,
    preRef,
    lineNumRef,
    highlightRef,
    textareaRef,
    handleFormat,
    syncScroll,
  };
}
