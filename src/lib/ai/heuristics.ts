import type { SubmissionRow } from "@/lib/db/submissions";

export interface HeuristicResponse {
  friendly_one_liner: string;
  root_cause: string;
  evidence: string[];
  hint: string;
  next_step: string;
  minimal_patch?: string;
  confidence: number;
}

/** Common CE patterns per language -> friendly message (no AI). */
const CE_PATTERNS: { pattern: RegExp; message: string }[] = [
  { pattern: /undefined:|is not defined|cannot find/i, message: "You're using a name that isn't defined. Check spelling and that the variable or function is declared in scope." },
  { pattern: /syntax error|unexpected token|invalid syntax/i, message: "Syntax error: check brackets, parentheses, and commas. Often caused by a missing or extra character." },
  { pattern: /type error|wrong number of arguments|takes \d+ positional/i, message: "Type or argument mismatch: the function or operator expects different types or number of arguments." },
  { pattern: /indentation|indent/i, message: "Indentation error: in Python, use consistent spaces (no tabs mixed with spaces)." },
  { pattern: /cannot assign|assignment to constant/i, message: "You're trying to reassign a constant or immutable value." },
  { pattern: /missing return|not all code paths return/i, message: "Not all code paths return a value. Ensure every path returns in a function that should return something." },
  { pattern: /expected ';'|expected `;/i, message: "Missing semicolon or bracket. Check the line indicated by the compiler." },
  { pattern: /undeclared identifier|unknown type/i, message: "Undeclared name or type. Declare the variable or import the type before use." },
];

function getCeHeuristic(compileOutput: string): HeuristicResponse | null {
  const firstLine = compileOutput.split("\n")[0] ?? "";
  for (const { pattern, message } of CE_PATTERNS) {
    if (pattern.test(compileOutput)) {
      return {
        friendly_one_liner: message,
        root_cause: firstLine.slice(0, 200),
        evidence: [firstLine.slice(0, 300)],
        hint: message + " Look at the first line of the compiler output for the exact location.",
        next_step: "Fix the reported line and resubmit.",
        confidence: 0.85,
      };
    }
  }
  return null;
}

/** TLE: suggest complexity (no AI). */
function getTleHeuristic(): HeuristicResponse {
  return {
    friendly_one_liner: "Your code ran too long. The constraint likely requires a more efficient algorithm (e.g. O(n log n) instead of O(n²)).",
    root_cause: "Time limit exceeded",
    evidence: ["TLE on judge"],
    hint: "Check for nested loops over the full input, or consider sorting/hashing to avoid brute force.",
    next_step: "Try a more efficient approach and resubmit.",
    confidence: 0.75,
  };
}

/** WA: simple patterns like off-by-one, integer division (no AI). */
function getWaHeuristic(
  failedExpected: string | null,
  failedActual: string | null
): HeuristicResponse | null {
  const e = (failedExpected ?? "").trim();
  const a = (failedActual ?? "").trim();
  if (!e || !a) return null;

  const numE = parseFloat(e);
  const numA = parseFloat(a);
  if (!Number.isNaN(numE) && !Number.isNaN(numA)) {
    if (Math.abs(numE - numA) === 1) {
      return {
        friendly_one_liner: "Off-by-one: your output is 1 away from expected. Check loop bounds or indexing (0-based vs 1-based).",
        root_cause: "Possible off-by-one error",
        evidence: [`Expected: ${e}`, `Got: ${a}`],
        hint: "Check your loop start/end (e.g. < vs <=) and array indices.",
        next_step: "Adjust the index or loop bound and resubmit.",
        confidence: 0.7,
      };
    }
    if (numA !== 0 && Math.abs(numE - numA) > 1 && Number.isInteger(numE) !== Number.isInteger(numA)) {
      return {
        friendly_one_liner: "Integer division may have truncated. In many languages, 3/2 is 1, not 1.5. Use float division or avoid dividing when you need exact values.",
        root_cause: "Possible integer division",
        evidence: [`Expected: ${e}`, `Got: ${a}`],
        hint: "Use float division (e.g. / in Python, or cast in other languages) if you need a non-integer result.",
        next_step: "Fix the division and resubmit.",
        confidence: 0.6,
      };
    }
  }

  if ((e.toLowerCase() === "true" && a.toLowerCase() === "false") || (e.toLowerCase() === "false" && a.toLowerCase() === "true")) {
    return {
      friendly_one_liner: "Your output is a boolean that doesn't match. Check the condition that produces true/false.",
      root_cause: "Boolean mismatch",
      evidence: [`Expected: ${e}`, `Got: ${a}`],
      hint: "Double-check the logic that decides when to return or print true vs false.",
      next_step: "Fix the condition and resubmit.",
      confidence: 0.7,
    };
  }

  return null;
}

/** Run heuristics first; return structured response if applicable, else null (call AI). */
export function runHeuristics(submission: SubmissionRow): HeuristicResponse | null {
  switch (submission.verdict) {
    case "compile_error":
      if (submission.compile_output) return getCeHeuristic(submission.compile_output);
      return null;
    case "tle":
      return getTleHeuristic();
    case "wrong_answer":
      return getWaHeuristic(submission.failed_expected, submission.failed_actual) ?? null;
    default:
      return null;
  }
}
