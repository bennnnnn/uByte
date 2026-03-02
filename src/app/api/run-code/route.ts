import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-utils";
import { isSupportedLanguage } from "@/lib/languages/registry";

const MAX_CODE_LENGTH = 64 * 1024; // 64KB
const TIMEOUT_MS = 15_000;

export const POST = withErrorHandling("POST /api/run-code", async (request: NextRequest) => {
  const ip = getClientIp(request.headers);
  const { limited, retryAfter } = await checkRateLimit(`run:${ip}`, 10, 60_000);
  if (limited) {
    return NextResponse.json(
      { Errors: "Too many requests. Please wait before running code again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const body = await request.json();
  const { code, language = "go" } = body;

  if (!code || typeof code !== "string") {
    return NextResponse.json(
      { Errors: "No code provided" },
      { status: 400 }
    );
  }

  if (code.length > MAX_CODE_LENGTH) {
    return NextResponse.json(
      { Errors: "Code exceeds maximum length" },
      { status: 400 }
    );
  }

  const lang = typeof language === "string" && isSupportedLanguage(language) ? language : "go";

  if (lang !== "go") {
    return NextResponse.json(
      { Errors: "Only Go is supported for now. Python and C++ coming soon." },
      { status: 501 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const urlParams = new URLSearchParams({ version: "2", body: code, withVet: "true" });
    const response = await fetch("https://go.dev/_/compile", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: urlParams.toString(),
      signal: controller.signal,
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return NextResponse.json(
        { Errors: "Request timed out. Try simpler code." },
        { status: 504 }
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
});
