import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const GO_FMT_URL = process.env.NEXT_PUBLIC_GO_FMT_URL || "https://go.dev/_/fmt";

/** Normalize any code: trim trailing whitespace per line, unify line endings, collapse 3+ blank lines to 2. */
function basicNormalize(code: string): string {
  return code
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function formatGo(code: string): Promise<string> {
  const body = new URLSearchParams({ body: code, imports: "true" });
  const res = await fetch(GO_FMT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) return code;
  const data = await res.json();
  return data.Body && !data.Error ? data.Body : code;
}

async function formatJavaScript(code: string): Promise<string> {
  // Dynamic import keeps prettier out of the client bundle
  const prettier = await import("prettier");
  const babelPlugin = await import("prettier/plugins/babel");
  const estreePlugin = await import("prettier/plugins/estree");
  try {
    return await prettier.format(code, {
      parser: "babel",
      plugins: [babelPlugin.default, estreePlugin.default],
      printWidth: 100,
      tabWidth: 2,
      singleQuote: false,
      trailingComma: "es5",
      semi: true,
    });
  } catch {
    return basicNormalize(code);
  }
}

/**
 * POST /api/format-code
 * Body: { code: string; language: string }
 * Returns: { code: string; changed: boolean }
 *
 * - go         → go.dev/_/fmt (gofmt + goimports)
 * - javascript → prettier/babel
 * - python, rust, java, cpp → basic whitespace normalization only
 *   (real formatters require a full runtime — use Judge0 exec environment instead)
 */
export const POST = withErrorHandling("POST /api/format-code", async (request: NextRequest) => {
  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`fmt:${ip}`, 30, 60_000);
  if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const { code, language } = body ?? {};

  if (typeof code !== "string" || !code.trim()) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }

  let formatted = code;

  switch (language) {
    case "go":
      formatted = await formatGo(code);
      break;
    case "javascript":
      formatted = await formatJavaScript(code);
      break;
    default:
      // Python, Rust, Java, C++ — normalize whitespace only; full formatting
      // requires server-side runtimes not available in this environment.
      formatted = basicNormalize(code);
  }

  return NextResponse.json({ code: formatted, changed: formatted !== code });
});
