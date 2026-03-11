import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const GO_FMT_URL   = process.env.NEXT_PUBLIC_GO_FMT_URL || "https://go.dev/_/fmt";
const RUST_FMT_URL = "https://play.rust-lang.org/format";

/** Trim trailing whitespace, unify line endings, collapse 3+ blank lines to 2. */
function basicNormalize(code: string): string {
  return code
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** gofmt + goimports via the official Go playground endpoint. */
async function formatGo(code: string): Promise<string> {
  const body = new URLSearchParams({ body: code, imports: "true" });
  const res = await fetch(GO_FMT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) return code;
  const data = await res.json() as { Body?: string; Error?: string };
  return data.Body && !data.Error ? data.Body : code;
}

/**
 * rustfmt via the official Rust Playground endpoint.
 * Same pattern as Go — free, no extra dependencies.
 */
async function formatRust(code: string): Promise<string> {
  const res = await fetch(RUST_FMT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, edition: "2021" }),
  });
  if (!res.ok) return code;
  const data = await res.json() as { success?: boolean; code?: string };
  return data.success && data.code ? data.code : code;
}

/** Prettier babel parser — JS/TS. Dynamic import stays server-side. */
async function formatJavaScript(code: string): Promise<string> {
  const prettier     = await import("prettier");
  const babelPlugin  = await import("prettier/plugins/babel");
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

/** prettier-plugin-java — server-side only, never bundled client-side. */
async function formatJava(code: string): Promise<string> {
  const prettier   = await import("prettier");
  const javaPlugin = await import("prettier-plugin-java");
  try {
    return await prettier.format(code, {
      parser: "java",
      plugins: [javaPlugin.default],
      printWidth: 100,
      tabWidth: 4,
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
 * Language coverage:
 *   go         → gofmt + goimports   (go.dev/_/fmt — official)
 *   rust       → rustfmt             (play.rust-lang.org/format — official)
 *   javascript → prettier/babel
 *   java       → prettier-plugin-java
 *   python, cpp, csharp → basic whitespace normalization
 *     (no reliable free formatter API for these languages)
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
    case "rust":
      formatted = await formatRust(code);
      break;
    case "javascript":
      formatted = await formatJavaScript(code);
      break;
    case "java":
      formatted = await formatJava(code);
      break;
    default:
      // Python, C++, C# — normalize whitespace only.
      // No reliable free formatter API exists for these languages.
      formatted = basicNormalize(code);
  }

  return NextResponse.json({ code: formatted, changed: formatted !== code });
});
