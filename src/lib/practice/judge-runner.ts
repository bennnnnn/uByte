import { getPracticeProblemBySlug } from "@/lib/practice/problems";
import { JUDGE0_URL, JUDGE0_LANG_IDS, b64, fromb64, maybeDecodeJudge0Message } from "@/lib/judge0";

function normalizeLine(s: string): string {
  return s
    .trim()
    .replace(/,/g, " ")
    .replace(/^True$/i, "true")
    .replace(/^False$/i, "false")
    .replace(/\s+/g, " ");
}

function extractGoSolution(code: string): string {
  let s = code
    .replace(/^\s*package\s+\w+\s*\n?/m, "")
    .replace(/\s*import\s*\([\s\S]*?\)\s*\n?/m, "")
    .replace(/\s*import\s+"[^"]*"\s*\n?/gm, "");
  const mainIdx = s.search(/\nfunc main\(\)/);
  if (mainIdx >= 0) s = s.slice(0, mainIdx);
  return s.trim();
}

function extractPythonSolution(code: string): string {
  const lines = code.split("\n");
  let end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === 'if __name__ == "__main__":' || (t.startsWith("print(") && !lines[i].startsWith(" ") && !lines[i].startsWith("\t"))) {
      end = i;
      break;
    }
  }
  return lines.slice(0, end).join("\n").trim();
}

function extractJavaScriptSolution(code: string): string {
  const lines = code.split("\n");
  let end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    const isTopLevel = !line.startsWith(" ") && !line.startsWith("\t");
    if (!isTopLevel) continue;
    if (t.startsWith("const ") || t.startsWith("let ") || t.startsWith("var ") || t.startsWith("console.log(")) {
      end = i;
      break;
    }
  }
  return lines.slice(0, end).join("\n").trim();
}

function extractCppSolution(code: string): string {
  let s = code;
  const mainIdx = s.search(/\n\s*int\s+main\s*\(/);
  if (mainIdx >= 0) s = s.slice(0, mainIdx);
  s = s.replace(/^\s*#include[^\n]*\n/gm, "");
  s = s.replace(/^\s*using\s+namespace\s+std\s*;\s*$/gm, "");
  return s.trim();
}

function extractJavaSolution(code: string): string {
  const s = code.replace(/^\s*import\s+.*;\s*$/gm, "").trim();
  const classMatch = s.match(/class\s+Main\s*\{/);
  if (!classMatch || classMatch.index == null) return s;
  const classStart = classMatch.index + classMatch[0].length;
  const rest = s.slice(classStart);
  const mainRel = rest.search(/\bpublic\s+static\s+void\s+main\s*\(/);
  const body = mainRel >= 0 ? rest.slice(0, mainRel) : rest;
  return body.trim().replace(/\}\s*$/, "").trim();
}

function extractRustSolution(code: string): string {
  let s = code;
  const mainIdx = s.search(/\n\s*fn\s+main\s*\(/);
  if (mainIdx >= 0) s = s.slice(0, mainIdx);
  return s.trim();
}

export type JudgeVerdict =
  | "accepted"
  | "wrong_answer"
  | "compile_error"
  | "runtime_error"
  | "tle"
  | "error";

export interface JudgeRunResult {
  verdict: JudgeVerdict;
  message: string;
  output?: string;
  passedCases?: number;
  totalCases?: number;
  /** For WA: index of first failing test (0-based). */
  failedTestIndex?: number;
  failedInput?: string;
  failedExpected?: string;
  failedActual?: string;
  compileOutput?: string;
  runtimeError?: string;
  judge0Token?: string;
  timeMs?: number;
  memoryKb?: number;
}

import { isSupportedLanguage } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";

type Lang = SupportedLanguage;

function isLang(l: string): l is Lang {
  return isSupportedLanguage(l);
}

export async function runJudge(
  problemSlug: string,
  code: string,
  language: string
): Promise<JudgeRunResult> {
  const problem = getPracticeProblemBySlug(problemSlug);
  if (!problem) {
    return { verdict: "error", message: "Problem not found" };
  }
  if (!problem.testCases?.length) {
    return { verdict: "error", message: "No test cases for this problem yet." };
  }
  const lang = isLang(language) ? language : "go";
  const harness =
    lang === "go" ? problem.judgeHarness?.go :
    lang === "python" ? problem.judgeHarness?.python :
    lang === "javascript" ? problem.judgeHarness?.javascript :
    lang === "cpp" ? problem.judgeHarness?.cpp :
    lang === "java" ? problem.judgeHarness?.java :
    problem.judgeHarness?.rust;
  if (!harness) {
    return { verdict: "error", message: `No judge harness for ${lang} on this problem.` };
  }
  if (!JUDGE0_URL) {
    return { verdict: "error", message: "Code execution service not configured." };
  }

  const solution =
    lang === "go" ? extractGoSolution(code) :
    lang === "python" ? extractPythonSolution(code) :
    lang === "javascript" ? extractJavaScriptSolution(code) :
    lang === "cpp" ? extractCppSolution(code) :
    lang === "java" ? extractJavaSolution(code) :
    extractRustSolution(code);
  const judgeCode = harness.replace("{{SOLUTION}}", solution);

  const stdin = problem.testCases.map((tc) => tc.stdin).join("\n");
  const expectedLines = problem.testCases.map((tc) => tc.expectedOutput);
  const totalCases = problem.testCases.length;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: b64(judgeCode),
        language_id: JUDGE0_LANG_IDS[lang],
        stdin: b64(stdin),
        cpu_time_limit: 10,
        memory_limit: 131072,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return { verdict: "error", message: "Judge service unavailable. Please try again." };
    }

    const data = await res.json();
    const statusId = data.status?.id ?? 0;
    const stdout = fromb64(data.stdout).trimEnd();
    const stderr = fromb64(data.stderr).trimEnd();
    const compileOut = fromb64(data.compile_output).trimEnd();
    const internalMsg = maybeDecodeJudge0Message(data.message);

    if (statusId === 6) {
      return {
        verdict: "compile_error",
        message: "Compilation Error",
        output: compileOut || stderr || internalMsg || "Compilation failed.",
        compileOutput: compileOut || stderr || internalMsg || undefined,
      };
    }

    if (statusId === 5) {
      return {
        verdict: "tle",
        message: "Time Limit Exceeded",
        output: "Your code ran too long. Check for infinite loops or inefficient algorithms.",
      };
    }

    if (statusId >= 7 && statusId <= 12) {
      const err = stderr || internalMsg || "Your code crashed during execution.";
      return {
        verdict: "runtime_error",
        message: "Runtime Error",
        output: err,
        runtimeError: err,
      };
    }

    // Status 3 = Accepted (code ran to completion — we do our own line-by-line comparison).
    // Status 4 = Wrong Answer per Judge0 (only set when expected_output is provided, but
    //            handle it defensively in case the Judge0 instance is configured differently).
    // Status 1/2 = In Queue / Processing (wait=true should prevent these, but handle anyway).
    if (statusId === 3 || statusId === 4) {
      const actualLines = stdout.split("\n");
      let passed = 0;
      for (let i = 0; i < expectedLines.length; i++) {
        if (normalizeLine(actualLines[i] ?? "") === normalizeLine(expectedLines[i] ?? "")) passed++;
        else break;
      }
      if (passed === totalCases) {
        return {
          verdict: "accepted",
          message: "Accepted",
          output: stdout,
          passedCases: totalCases,
          totalCases,
        };
      }
      const failIdx = passed;
      const tc = problem.testCases[failIdx];
      return {
        verdict: "wrong_answer",
        message: `Wrong Answer — failed on test case ${passed + 1} of ${totalCases}`,
        output: stdout,
        passedCases: passed,
        totalCases,
        failedTestIndex: failIdx,
        failedInput: tc?.stdin,
        failedExpected: expectedLines[failIdx],
        failedActual: actualLines[failIdx] ?? "",
      };
    }

    // Status 1/2 = still queued/processing (shouldn't happen with wait=true)
    if (statusId === 1 || statusId === 2) {
      return {
        verdict: "error",
        message: "Judge is busy — please try again in a moment.",
      };
    }

    return {
      verdict: "error",
      message: `Judge returned unexpected status ${statusId}: ${data.status?.description ?? "unknown"}. ${stderr || internalMsg || ""}`.trim(),
      output: stderr || internalMsg || stdout,
    };
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return { verdict: "tle", message: "Time Limit Exceeded", output: "Request timed out." };
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
