import { NextResponse } from "next/server";
import { withErrorHandling, publicMutationRoute, parseJsonBody } from "@/lib/api-utils";
import { runCodeBodySchema } from "@/lib/api-schemas";
import { isSupportedLanguage } from "@/lib/languages/registry";
import { JUDGE0_URL, JUDGE0_LANG_IDS, b64, normaliseJudge0RunOutput, prepareCodeForJudge } from "@/lib/judge0";
import { SQL_PREAMBLE } from "@/lib/sql-schema";

const TIMEOUT_MS = 20_000;

export const POST = withErrorHandling(
  "POST /api/run-code",
  publicMutationRoute({ rateLimitKey: "run", rateLimitMax: 15 }, async (request) => {
    const parsed = await parseJsonBody(request, runCodeBodySchema);
    if (parsed.error) {
      return NextResponse.json({ Errors: "Invalid request" }, { status: 400 });
    }
    const { code, language = "go" } = parsed.data;
    const lang = isSupportedLanguage(language) ? language : "go";

    let runCode = lang === "sql" ? SQL_PREAMBLE + code : code;
    if (lang === "csharp" && !/\bstatic\s+(void|int)\s+Main\s*\(/.test(code)) {
      runCode =
        runCode +
        code +
        '\nclass __Runner__ { static void Main() {' +
        ' System.Console.WriteLine("Solution class loaded. Click Submit to run against all test cases."); } }';
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      if (lang === "go") {
        const urlParams = new URLSearchParams({ version: "2", body: code, withVet: "true" });
        const goCompileUrl = process.env.GO_COMPILE_URL || "https://go.dev/_/compile";
        const res = await fetch(goCompileUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: urlParams.toString(),
          signal: controller.signal,
        });
        return NextResponse.json(await res.json());
      }

      if (!JUDGE0_URL) {
        return NextResponse.json(
          { Errors: "Code execution is not configured yet. The server is being set up — check back soon!" },
          { status: 503 },
        );
      }

      const langId = JUDGE0_LANG_IDS[lang];
      if (!langId) {
        return NextResponse.json({ Errors: "Unsupported language for code execution" }, { status: 400 });
      }

      const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: b64(prepareCodeForJudge(runCode, lang)),
          language_id: langId,
          stdin: b64(""),
          cpu_time_limit: 10,
          memory_limit: 131072,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        console.error("Judge0 error:", res.status, await res.text().catch(() => ""));
        return NextResponse.json(
          { Errors: "Code execution service unavailable. Please try again in a moment." },
          { status: 502 },
        );
      }

      return NextResponse.json(normaliseJudge0RunOutput(await res.json()));
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return NextResponse.json(
          { Errors: "Request timed out. Your code may be taking too long to run." },
          { status: 504 },
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }),
);
