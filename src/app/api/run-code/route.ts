import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-utils";
import { isSupportedLanguage } from "@/lib/languages/registry";
import { JUDGE0_URL, JUDGE0_LANG_IDS, b64, normaliseJudge0RunOutput, prepareCodeForJudge } from "@/lib/judge0";

const MAX_CODE_LENGTH = 64 * 1024; // 64 KB
const TIMEOUT_MS = 20_000;

export const POST = withErrorHandling("POST /api/run-code", async (request: NextRequest) => {
  const ip = getClientIp(request.headers);
  const { limited, retryAfter } = await checkRateLimit(`run:${ip}`, 15, 60_000);
  if (limited) {
    return NextResponse.json(
      { Errors: "Too many requests. Please wait before running code again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const body = await request.json();
  const { code, language = "go" } = body;

  if (!code || typeof code !== "string") {
    return NextResponse.json({ Errors: "No code provided" }, { status: 400 });
  }
  if (code.length > MAX_CODE_LENGTH) {
    return NextResponse.json({ Errors: "Code exceeds maximum length" }, { status: 400 });
  }

  const lang = typeof language === "string" && isSupportedLanguage(language) ? language : "go";

  // C# practice starters use `public class Solution` with no Main().
  // Inject a stub entry point so clicking Run produces a message instead of CS5001.
  let runCode = code;
  if (lang === "csharp" && !/\bstatic\s+(void|int)\s+Main\s*\(/.test(code)) {
    runCode =
      code +
      '\nclass __Runner__ { static void Main() {' +
      ' System.Console.WriteLine("Solution class loaded. Click Submit to run against all test cases."); } }';
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // ── Go: go.dev playground (best error messages + vet) ────────────────────
    if (lang === "go") {
      const urlParams = new URLSearchParams({ version: "2", body: code, withVet: "true" });
      const goCompileUrl = process.env.GO_COMPILE_URL || "https://go.dev/_/compile";
      const res = await fetch(goCompileUrl, {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:    urlParams.toString(),
        signal:  controller.signal,
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    // ── All other languages: Judge0 CE ────────────────────────────────────────
    if (!JUDGE0_URL) {
      return NextResponse.json(
        { Errors: "Code execution is not configured yet. The server is being set up — check back soon!" },
        { status: 503 }
      );
    }

    const langId = JUDGE0_LANG_IDS[lang];
    if (!langId) {
      return NextResponse.json({ Errors: "Unsupported language for code execution" }, { status: 400 });
    }
    const res = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code:     b64(prepareCodeForJudge(runCode, lang)),
          language_id:     langId,
          stdin:           b64(""),
          cpu_time_limit:  10,    // seconds
          memory_limit:    131072, // 128 MB in KB
        }),
        signal: controller.signal,
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Judge0 error:", res.status, errText);
      return NextResponse.json(
        { Errors: "Code execution service unavailable. Please try again in a moment." },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(normaliseJudge0RunOutput(data));

  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return NextResponse.json(
        { Errors: "Request timed out. Your code may be taking too long to run." },
        { status: 504 }
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
});
