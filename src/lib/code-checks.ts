import type { CodeCheck } from "@/lib/tutorial-steps/types";

/**
 * TODO comment pattern — matches all common single-line comment styles.
 */
const TODO_LINE_RE = /^\s*(\/\/|#|--|\/\*)\s*TODO\b/;

/** Strip TODO comment lines and collapse whitespace — used for meaningful-change detection. */
export function normCode(code: string): string {
  return code
    .split("\n")
    .filter((line) => !TODO_LINE_RE.test(line))
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns true when the starter had TODO comments and the user's code
 * is functionally identical to the starter after stripping those lines.
 */
export function todoNotCompleted(code: string, starter: string): boolean {
  if (!TODO_LINE_RE.test(starter)) return false;
  return normCode(code) === normCode(starter);
}

const MAX_CHECK_INPUT = 8_000;

export function safeRegexTest(pattern: string, flags: string, input: string): boolean {
  try {
    const safeInput = input.length > MAX_CHECK_INPUT ? input.slice(0, MAX_CHECK_INPUT) : input;
    return new RegExp(pattern, flags).test(safeInput);
  } catch {
    return false;
  }
}

function isPlaceholderRemovalCheck(check: CodeCheck): boolean {
  return check.required === false && check.pattern.trim() === "TODO";
}

/** Validate per-step code rules. Returns the first failing message, or null. */
export function runCodeChecks(code: string, checks: CodeCheck[] | undefined): string | null {
  if (!checks?.length) return null;
  for (const { pattern, flags = "im", required = true, message } of checks) {
    if (isPlaceholderRemovalCheck({ pattern, flags, required, message })) continue;
    const matches = safeRegexTest(pattern, flags, code);
    if (required && !matches) return message;
    if (!required && matches) return message;
  }
  return null;
}

export function checkOutput(output: string, expected: string[]): boolean {
  if (!output.trim()) return false;
  if (expected.length === 0) return true;
  const lower = output.toLowerCase();
  return expected.every((s) => lower.includes(s.toLowerCase()));
}
