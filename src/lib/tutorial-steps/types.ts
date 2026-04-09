/**
 * Optional per-step code validation rules.
 * Each rule checks the submitted source code (not the output).
 *
 * - `pattern`  — regex string tested against the code
 * - `flags`    — regex flags (default "im" = case-insensitive, multiline)
 * - `required` — true (default): pattern MUST match. false: pattern must NOT match.
 * - `message`  — shown to the user when the rule fails
 */
export interface CodeCheck {
  pattern: string;
  flags?: string;
  required?: boolean;
  message: string;
}

export interface TutorialStep {
  title: string;
  instruction: string;
  /** Shown in the green success banner when the step passes. Falls back to the generic message. */
  successMessage?: string;
  hint?: string;
  starter: string;
  /**
   * When true and this is not the first step (index > 0), clicking **Next step** after a pass
   * keeps the learner’s current editor code instead of swapping in `starter`.
   * `starter` is still used for **Reset**, jumping via step dots, and cold resume without a draft.
   * Use this for cumulative “mini project” lessons where each step builds on the last.
   */
  carryForward?: boolean;
  expectedOutput: string[];
  /**
   * Optional code-level validation rules applied before accepting a "passed" result.
   * Runs in addition to (and before) the TODO-change detection.
   */
  codeChecks?: CodeCheck[];
}
