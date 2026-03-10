"use client";

import type { ReactNode } from "react";
import type { SupportedLanguage } from "@/lib/languages/types";
import { LANGUAGES } from "@/lib/languages/registry";

const SHARE_ICON = (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

interface EditorToolbarProps {
  /** Current language value */
  lang: SupportedLanguage;
  onLangChange: (lang: SupportedLanguage) => void;
  /** Ordered list of languages to show in the selector */
  langOptions: SupportedLanguage[];
  /** Whether a format operation is in progress */
  formatting: boolean;
  onFormat: () => void;
  shareCopied: boolean;
  onShare: () => void;
  /** Action buttons (Run / Check or Submit / Reset) rendered between lang select and format */
  children?: ReactNode;
  /** Extra content after the lang selector, before children (e.g. "Loading…" spinner) */
  extraLeft?: ReactNode;
  /** When true renders a compact mobile bottom bar instead of the desktop toolbar */
  mobile?: boolean;
}

/**
 * Shared toolbar used by the tutorial IDE and the practice IDE.
 * Renders the language selector, action buttons (via children), format, and share.
 */
export function EditorToolbar({
  lang,
  onLangChange,
  langOptions,
  formatting,
  onFormat,
  shareCopied,
  onShare,
  children,
  extraLeft,
  mobile = false,
}: EditorToolbarProps) {
  if (mobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[54] flex items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-3 py-2 md:hidden dark:border-zinc-800 dark:bg-zinc-900">
        <select
          value={lang}
          onChange={(e) => onLangChange(e.target.value as SupportedLanguage)}
          aria-label="Code language"
          className="w-24 shrink-0 rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
        >
          {langOptions.map((l) => (
            <option key={l} value={l}>{LANGUAGES[l]?.name ?? l}</option>
          ))}
        </select>
        {children}
        <button
          type="button"
          onClick={onShare}
          aria-label="Share code"
          title="Share code"
          className={`flex shrink-0 items-center justify-center rounded-md border px-3 py-2 text-sm transition-all ${
            shareCopied
              ? "border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
              : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
          }`}
        >
          {shareCopied ? "✓" : SHARE_ICON}
        </button>
      </div>
    );
  }

  return (
    <div className="hidden shrink-0 items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900 md:flex">
      <select
        value={lang}
        onChange={(e) => onLangChange(e.target.value as SupportedLanguage)}
        aria-label="Code language"
        title="Code language"
        className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
      >
        {langOptions.map((l) => (
          <option key={l} value={l}>{LANGUAGES[l]?.name ?? l}</option>
        ))}
      </select>
      {extraLeft}
      {children}
      <button
        type="button"
        onClick={onFormat}
        disabled={formatting}
        title="Auto-format code"
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-800 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
      >
        {formatting ? "…" : "⌥ Format"}
      </button>
      <button
        type="button"
        onClick={onShare}
        title="Share your code — copies a link to clipboard"
        className={`ml-auto flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-all ${
          shareCopied
            ? "border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
            : "border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
        }`}
      >
        {shareCopied ? <>✓ Link copied!</> : <>{SHARE_ICON} Share</>}
      </button>
    </div>
  );
}
