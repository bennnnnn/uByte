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

/**
 * Returns a `handleKeyDown` function for the code-editor textarea.
 *
 * Behaviours:
 * - Tab             → insert 4 spaces (no focus trap)
 * - Ctrl/Cmd+Enter  → run
 * - Ctrl/Cmd+Shift+Enter → check (tutorial only; falls back to run if omitted)
 */
export function useEditorKeyDown({ editor, onRun, onCheck }: EditorKeyDownOptions) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = editor.textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = ta.value.slice(0, start) + "    " + ta.value.slice(end);
      editor.setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (e.shiftKey && onCheck) {
        onCheck();
      } else {
        onRun();
      }
    }
  }

  return handleKeyDown;
}
