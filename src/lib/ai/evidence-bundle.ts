import type { SubmissionRow } from "@/lib/db/submissions";
import type { PracticeProblem } from "@/lib/practice/types";

const MAX_SUMMARY = 1200;
const MAX_ERROR = 2000;
const MAX_INPUT = 500;
const MAX_EXPECTED = 500;
const MAX_ACTUAL = 500;

/**
 * Build a compact evidence bundle for AI: problem summary (<=1200 chars), language, code, verdict,
 * one failing test for WA, compiler/runtime error truncated. Never include reference solutions or
 * all/hidden tests.
 */
export function buildEvidenceBundle(submission: SubmissionRow, problem: PracticeProblem): string {
  const parts: string[] = [];

  const summary = [
    problem.title,
    problem.description,
    ...problem.examples.slice(0, 2).map((e) => "Input: " + e.input + "\nOutput: " + e.output),
  ].join("\n\n");
  const truncatedSummary = summary.length > MAX_SUMMARY ? summary.slice(0, MAX_SUMMARY) + "…" : summary;
  parts.push("## Problem summary\n" + truncatedSummary);

  parts.push("\n## Language\n" + submission.language);

  const code = submission.code.replace(/\r\n/g, "\n").trim().replace(/\n{3,}/g, "\n\n");
  parts.push("\n## User code\n```\n" + code + "\n```");

  parts.push("\n## Verdict\n" + submission.verdict);

  if (submission.compile_output) {
    const err = submission.compile_output.length > MAX_ERROR
      ? submission.compile_output.slice(0, MAX_ERROR) + "…"
      : submission.compile_output;
    parts.push("\n## Compiler output\n" + err);
  }
  if (submission.runtime_error) {
    const err = submission.runtime_error.length > MAX_ERROR
      ? submission.runtime_error.slice(0, MAX_ERROR) + "…"
      : submission.runtime_error;
    parts.push("\n## Runtime error\n" + err);
  }

  if (submission.verdict === "wrong_answer" && submission.failed_input != null) {
    const input = (submission.failed_input ?? "").length > MAX_INPUT
      ? (submission.failed_input ?? "").slice(0, MAX_INPUT) + "…"
      : (submission.failed_input ?? "");
    const expected = (submission.failed_expected ?? "").length > MAX_EXPECTED
      ? (submission.failed_expected ?? "").slice(0, MAX_EXPECTED) + "…"
      : (submission.failed_expected ?? "");
    const actual = (submission.failed_actual ?? "").length > MAX_ACTUAL
      ? (submission.failed_actual ?? "").slice(0, MAX_ACTUAL) + "…"
      : (submission.failed_actual ?? "");
    parts.push("\n## One failing test\nInput: " + input + "\nExpected: " + expected + "\nGot: " + actual);
  }

  return parts.join("\n");
}

/** Build failure signature for cache key: WA = test index + expected + got; CE/RE = first line; TLE = TLE. */
export function buildFailureSignature(submission: SubmissionRow): string {
  switch (submission.verdict) {
    case "wrong_answer":
      return [
        submission.failed_test_index ?? -1,
        (submission.failed_expected ?? "").slice(0, 200),
        (submission.failed_actual ?? "").slice(0, 200),
      ].join("|");
    case "compile_error":
      return (submission.compile_output ?? "").split("\n")[0]?.slice(0, 300) ?? "ce";
    case "runtime_error":
      return (submission.runtime_error ?? submission.runtime_output ?? "").split("\n")[0]?.slice(0, 300) ?? "re";
    case "tle":
      return "TLE";
    default:
      return submission.verdict;
  }
}
