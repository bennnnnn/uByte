import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_CODE_LENGTH = 64 * 1024; // 64 KB — same limit as run-code

/**
 * POST /api/format-code
 *
 * Formats user code using the Go playground's gofmt endpoint (Go only).
 * For other languages we return the code unchanged — clients must treat
 * a missing `changed` flag as a no-op.
 *
 * Response shape:
 *   { code: string; changed: boolean }
 */
export const POST = withErrorHandling("POST /api/format-code", async (request: NextRequest) => {
  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`format:${ip}`, 30, 60_000);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const { code, language = "go" } = body;

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }
  if (code.length > MAX_CODE_LENGTH) {
    return NextResponse.json({ error: "Code exceeds maximum length" }, { status: 400 });
  }

  // Go: use the playground's fmt endpoint which calls gofmt
  if (language === "go") {
    try {
      // Same intentional fallback as run-code: official Go Playground fmt endpoint.
      // Override by setting GO_COMPILE_URL to a self-hosted proxy (/_/compile suffix
      // is replaced with /_/fmt automatically).
      const goFmtUrl = process.env.GO_COMPILE_URL
        ? process.env.GO_COMPILE_URL.replace("/_/compile", "/_/fmt")
        : "https://go.dev/_/fmt";

      const params = new URLSearchParams({ body: code, imports: "true" });
      const res = await fetch(goFmtUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
        signal: AbortSignal.timeout(5_000),
      });

      if (!res.ok) {
        // Format failed (e.g. syntax error) — return original code unchanged
        return NextResponse.json({ code, changed: false });
      }

      const data = await res.json() as { Body?: string; Error?: string };
      if (data.Error || !data.Body) {
        return NextResponse.json({ code, changed: false });
      }

      const formatted = data.Body;
      return NextResponse.json({
        code: formatted,
        changed: formatted !== code,
      });
    } catch {
      // Network error or timeout — return unchanged
      return NextResponse.json({ code, changed: false });
    }
  }

  // All other languages: return unchanged (no formatter configured yet)
  return NextResponse.json({ code, changed: false });
});
