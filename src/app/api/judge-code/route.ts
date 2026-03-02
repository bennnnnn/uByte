import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getPracticeProblemBySlug } from "@/lib/practice/problems";

const JUDGE0_URL = process.env.JUDGE0_URL;
const JUDGE0_LANG: Record<string, number> = {
  go:     60, // Go 1.13.5
  python: 71, // Python 3.8.1
  javascript: 63, // Node.js 12.14.0
  cpp: 54, // C++ GCC 9.2.0
  java: 62, // Java OpenJDK 13.0.1
  rust: 73, // Rust 1.40.0
};

function b64(s: string): string {
  return Buffer.from(s).toString("base64");
}
function fromb64(s: string | null | undefined): string {
  return s ? Buffer.from(s, "base64").toString("utf-8") : "";
}

function maybeDecodeJudge0Message(message: string | null | undefined): string {
  if (!message) return "";
  const m = String(message).trim();
  // Judge0 sometimes base64-encodes `message` even when it is plain text.
  const looksB64 = /^[A-Za-z0-9+/=\r\n]+$/.test(m) && m.length >= 8;
  if (!looksB64) return m;
  try {
    const decoded = Buffer.from(m.replace(/\s+/g, ""), "base64").toString("utf-8").trim();
    // Heuristic: decoded text should contain mostly printable chars.
    if (!decoded) return m;
    const printable = decoded.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
    if (printable.length / decoded.length < 0.85) return m;
    return decoded;
  } catch {
    return m;
  }
}

/** Normalize a line for comparison (Python "[0, 1]" and Go "[0 1]" both match "[0 1]"; True/False -> true/false). */
function normalizeLine(s: string): string {
  return s
    .trim()
    .replace(/,/g, " ")
    .replace(/^True$/i, "true")
    .replace(/^False$/i, "false")
    .replace(/\s+/g, " ");
}

/** Extract Go solution: drop package main, imports, and func main() and everything after. */
function extractGoSolution(code: string): string {
  let s = code
    .replace(/^\s*package\s+\w+\s*\n?/m, "")
    .replace(/\s*import\s*\([\s\S]*?\)\s*\n?/m, "")
    .replace(/\s*import\s+"[^"]*"\s*\n?/gm, "");
  const mainIdx = s.search(/\nfunc main\(\)/);
  if (mainIdx >= 0) s = s.slice(0, mainIdx);
  return s.trim();
}

/** Extract Python solution: keep everything before "if __name__" or top-level print(. */
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

/** Extract JavaScript solution: remove top-level demo code (const/let/var and console.log). */
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
  let s = code.replace(/^\s*import\s+.*;\s*$/gm, "").trim();
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

export interface JudgeResult {
  verdict: JudgeVerdict;
  message: string;
  output?: string;
  expected?: string;
  passedCases?: number;
  totalCases?: number;
}

export const POST = withErrorHandling("POST /api/judge-code", async (request: NextRequest) => {
  const ip = getClientIp(request.headers);
  const { limited, retryAfter } = await checkRateLimit(`judge:${ip}`, 10, 60_000);
  if (limited) {
    return NextResponse.json(
      { verdict: "error" as const, message: "Too many submissions. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const body = await request.json();
  const { slug, code, language } = body ?? {};

  if (!slug || !code || !language) {
    return NextResponse.json(
      { verdict: "error" as const, message: "slug, code, and language required" },
      { status: 400 }
    );
  }

  const problem = getPracticeProblemBySlug(slug);
  if (!problem) {
    return NextResponse.json({ verdict: "error" as const, message: "Problem not found" }, { status: 404 });
  }

  if (!problem.testCases?.length) {
    return NextResponse.json(
      { verdict: "error" as const, message: "No test cases for this problem yet." },
      { status: 404 }
    );
  }

  const lang =
    (language === "go" ||
      language === "python" ||
      language === "javascript" ||
      language === "cpp" ||
      language === "java" ||
      language === "rust") ? language : null;
  if (!lang) {
    return NextResponse.json(
      { verdict: "error" as const, message: "Judge is available for Go, Python, JavaScript, C++, Java, and Rust only right now." },
      { status: 501 }
    );
  }

  const harness =
    lang === "go" ? problem.judgeHarness?.go :
    lang === "python" ? problem.judgeHarness?.python :
    lang === "javascript" ? problem.judgeHarness?.javascript :
    lang === "cpp" ? problem.judgeHarness?.cpp :
    lang === "java" ? problem.judgeHarness?.java :
    problem.judgeHarness?.rust;
  if (!harness) {
    return NextResponse.json(
      { verdict: "error" as const, message: `No judge harness for ${lang} on this problem.` },
      { status: 404 }
    );
  }

  if (!JUDGE0_URL) {
    return NextResponse.json(
      { verdict: "error" as const, message: "Code execution service not configured." },
      { status: 503 }
    );
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
        source_code:     b64(judgeCode),
        language_id:     JUDGE0_LANG[lang],
        stdin:           b64(stdin),
        cpu_time_limit:  10,
        memory_limit:    131072,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return NextResponse.json(
        { verdict: "error" as const, message: "Judge service unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const statusId = data.status?.id ?? 0;
    const stdout = fromb64(data.stdout).trimEnd();
    const stderr = fromb64(data.stderr).trimEnd();
    const compileOut = fromb64(data.compile_output).trimEnd();
    const internalMsg = maybeDecodeJudge0Message(data.message);

    if (statusId === 6) {
      return NextResponse.json<JudgeResult>({
        verdict: "compile_error",
        message: "Compilation Error",
        output:  compileOut || stderr || internalMsg || "Compilation failed.",
      });
    }

    if (statusId === 5) {
      return NextResponse.json<JudgeResult>({
        verdict: "tle",
        message: "Time Limit Exceeded",
        output:  "Your code ran too long. Check for infinite loops or inefficient algorithms.",
      });
    }

    if (statusId >= 7 && statusId <= 12) {
      return NextResponse.json<JudgeResult>({
        verdict: "runtime_error",
        message: "Runtime Error",
        output:  stderr || internalMsg || "Your code crashed during execution.",
      });
    }

    if (statusId === 3) {
      const actualLines = stdout.split("\n");
      let passed = 0;
      for (let i = 0; i < expectedLines.length; i++) {
        if (normalizeLine(actualLines[i] ?? "") === normalizeLine(expectedLines[i] ?? "")) passed++;
        else break;
      }
      if (passed === totalCases) {
        return NextResponse.json<JudgeResult>({
          verdict:     "accepted",
          message:     "Accepted",
          output:      stdout,
          passedCases: totalCases,
          totalCases,
        });
      }
      return NextResponse.json<JudgeResult>({
        verdict:     "wrong_answer",
        message:     `Wrong Answer — failed on test case ${passed + 1} of ${totalCases}`,
        output:      stdout,
        passedCases: passed,
        totalCases,
      });
    }

    return NextResponse.json<JudgeResult>({
      verdict: "error",
      message: data.status?.description ?? "Unknown error",
      output:  stderr || internalMsg || stdout,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return NextResponse.json<JudgeResult>(
        { verdict: "tle", message: "Time Limit Exceeded", output: "Request timed out." },
        { status: 504 }
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
});
