"use client";

import type { CodeEditorState } from "@/hooks/useCodeEditor";

interface CodeEditorProps {
  editor: CodeEditorState;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  /** Mobile font size override (tutorial only). */
  fontSize?: number;
}

/**
 * The raw code editor surface — line numbers, syntax-highlight overlay, and
 * the transparent textarea. Both the tutorial IDE and the practice IDE use
 * this component so the editing experience is identical in both places.
 */
export function CodeEditor({ editor, onKeyDown, fontSize }: CodeEditorProps) {
  return (
    <div
      className="flex flex-1 overflow-hidden bg-zinc-950"
      style={fontSize ? { fontSize } : undefined}
    >
      {/* Line numbers */}
      <div
        ref={editor.lineNumRef}
        aria-hidden
        className="shrink-0 select-none overflow-hidden border-r border-zinc-800 bg-zinc-900 px-3 py-4 font-mono text-sm leading-6 text-right text-zinc-600"
      >
        {editor.code.split("\n").map((_, i) => (
          <div key={i} className={editor.errorLines.has(i + 1) ? "text-red-400" : ""}>
            {editor.errorLines.has(i + 1) ? "▶" : i + 1}
          </div>
        ))}
      </div>

      {/* Editor surface */}
      <div className="relative flex-1 overflow-hidden">
        {/* Error line highlights */}
        <div ref={editor.highlightRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...editor.errorLines].map((ln) => (
            <div key={ln} className="absolute left-0 right-0 bg-red-500/10" style={{ top: 16 + (ln - 1) * 24, height: 24 }} />
          ))}
        </div>

        {/*
          Content is managed imperatively via setCode() — never by React reconciliation.
          font-mono text-sm leading-6 are set EXPLICITLY on both elements (not via
          inheritance) so the browser UA stylesheet cannot swap <pre> to a different
          system monospace font, which would shift character widths and break
          click-to-position.
        */}
        <pre
          ref={editor.preRef}
          aria-hidden
          suppressHydrationWarning
          className="pointer-events-none absolute inset-0 m-0 overflow-auto whitespace-pre py-4 pl-4 pr-8 font-mono text-sm leading-6 text-zinc-100"
        />
        <textarea
          ref={editor.textareaRef}
          defaultValue={editor.code}
          onChange={(e) => editor.setCode(e.target.value)}
          onScroll={editor.syncScroll}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          aria-label="Code editor"
          suppressHydrationWarning
          className="absolute inset-0 m-0 resize-none overflow-auto whitespace-pre bg-transparent py-4 pl-4 pr-8 font-mono text-sm leading-6 text-transparent caret-white outline-none selection:bg-indigo-900/50"
        />
      </div>
    </div>
  );
}
