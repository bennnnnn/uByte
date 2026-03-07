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
  hint?: string;
  starter: string;
  expectedOutput: string[];
  /**
   * Optional code-level validation rules applied before accepting a "passed" result.
   * Runs in addition to (and before) the TODO-change detection.
   */
  codeChecks?: CodeCheck[];
}
