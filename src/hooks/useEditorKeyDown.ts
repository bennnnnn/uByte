"use client";

import type { CodeEditorState } from "@/hooks/useCodeEditor";

interface EditorKeyDownOptions {
  editor: CodeEditorState;
  /** Called on Ctrl/Cmd+Enter (without Shift). Typically "Run". */
  onRun: () => void;
  /**
   * Called on Ctrl/Cmd+Shift+Enter.
   * Tutorial uses this for "Check"; practice IDE omits it (same as onRun).
   */
  onCheck?: () => void;
}

const INDENT = "    "; // 4 spaces
const OPEN_CHARS  = new Set(["{", "(", "[", ":"]);
const CLOSE_CHARS = new Set(["}", ")", "]"]);

/**
 * Returns a `handleKeyDown` function for the code-editor textarea.
 *
 * Behaviours:
 * - Tab                   → insert 4 spaces (no focus trap)
 * - Shift+Tab             → remove up to 4 spaces of leading indent on current line
 * - Enter                 → smart indent: match current line indentation + one extra
 *                           level if the line ends with { ( [ :
 *                           If cursor sits between a matching open/close bracket pair,
 *                           split them onto three lines with the cursor in the middle.
 * - Ctrl/Cmd+Enter        → run
 * - Ctrl/Cmd+Shift+Enter  → check (tutorial only; falls back to run if omitted)
 */
export function useEditorKeyDown({ editor, onRun, onCheck }: EditorKeyDownOptions) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const ta = editor.textareaRef.current;
    if (!ta) return;

    // ── Tab / Shift+Tab ──────────────────────────────────────────────────────
    if (e.key === "Tab") {
      e.preventDefault();
      const start = ta.selectionStart;
      const end   = ta.selectionEnd;

      if (e.shiftKey) {
        // Outdent: remove up to 4 leading spaces on the current line
        const lineStart = ta.value.lastIndexOf("\n", start - 1) + 1;
        const line = ta.value.slice(lineStart);
        const spaces = line.match(/^ {1,4}/)?.[0].length ?? 0;
        if (spaces > 0) {
          const next =
            ta.value.slice(0, lineStart) +
            ta.value.slice(lineStart + spaces);
          editor.setCode(next);
          requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = Math.max(lineStart, start - spaces);
          });
        }
      } else {
        // Indent: insert 4 spaces at cursor (replace selection if any)
        const next = ta.value.slice(0, start) + INDENT + ta.value.slice(end);
        editor.setCode(next);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 4;
        });
      }
      return;
    }

    // ── Ctrl/Cmd+Enter ───────────────────────────────────────────────────────
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (e.shiftKey && onCheck) onCheck();
      else onRun();
      return;
    }

    // ── Smart Enter ──────────────────────────────────────────────────────────
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const pos   = ta.selectionStart;
      const value = ta.value;

      // Current line content (from its start up to the cursor)
      const lineStart  = value.lastIndexOf("\n", pos - 1) + 1;
      const lineToPos  = value.slice(lineStart, pos);

      // Leading whitespace on the current line
      const baseIndent = lineToPos.match(/^(\s*)/)?.[1] ?? "";

      // Last non-space character before cursor on this line
      const lastChar = lineToPos.trimEnd().slice(-1);

      // Character immediately after cursor
      const nextChar = value[pos] ?? "";

      if (OPEN_CHARS.has(lastChar) && CLOSE_CHARS.has(nextChar)) {
        // Cursor is between e.g. { and } — split into three lines:
        //   <current line>
        //       <cursor here>
        //   <closing bracket, same indent as opening>
        const innerIndent = baseIndent + INDENT;
        const insertion   = "\n" + innerIndent + "\n" + baseIndent;
        const next        = value.slice(0, pos) + insertion + value.slice(pos);
        editor.setCode(next);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = pos + innerIndent.length + 1;
        });
      } else {
        // Plain newline: carry current indent + one extra level if block opens
        const extraIndent = OPEN_CHARS.has(lastChar) ? INDENT : "";
        const insertion   = "\n" + baseIndent + extraIndent;
        const next        = value.slice(0, pos) + insertion + value.slice(pos);
        editor.setCode(next);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = pos + insertion.length;
        });
      }
    }
  }

  return handleKeyDown;
}
