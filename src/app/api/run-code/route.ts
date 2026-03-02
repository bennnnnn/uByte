import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-utils";
import { isSupportedLanguage } from "@/lib/languages/registry";

const MAX_CODE_LENGTH = 64 * 1024; // 64 KB
const TIMEOUT_MS = 20_000;

// Set JUDGE0_URL in your .env.local / Vercel env vars:
//   JUDGE0_URL=http://YOUR_SERVER_IP:2358
const JUDGE0_URL = process.env.JUDGE0_URL;

// Judge0 CE language IDs
// Full list: GET {JUDGE0_URL}/languages
const JUDGE0_LANG_ID: Record<string, number> = {
  python:     71, // Python 3.8.1
  javascript: 63, // Node.js 12.14.0
  java:       62, // Java OpenJDK 13.0.1
  rust:       73, // Rust 1.40.0
  cpp:        54, // C++ GCC 9.2.0
};

function b64(s: string): string {
  return Buffer.from(s).toString("base64");
}

function fromb64(s: string | null | undefined): string {
  if (!s) return "";
  return Buffer.from(s, "base64").toString("utf-8");
}

function maybeDecodeJudge0Message(message: string | null | undefined): string {
  if (!message) return "";
  const m = String(message).trim();
  const looksB64 = /^[A-Za-z0-9+/=\r\n]+$/.test(m) && m.length >= 8;
  if (!looksB64) return m;
  try {
    const decoded = Buffer.from(m.replace(/\s+/g, ""), "base64").toString("utf-8").trim();
    if (!decoded) return m;
    const printable = decoded.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
    if (printable.length / decoded.length < 0.85) return m;
    return decoded;
  } catch {
    return m;
  }
}

/**
 * Normalise a Judge0 response into the shape the frontend expects:
 *   { CompileErrors?, Errors?, Events?: { Message, Kind }[] }
 */
function normaliseJudge0(data: {
  stdout?:         string | null;
  stderr?:         string | null;
  compile_output?: string | null;
  status?:         { id: number; description: string };
  message?:        string | null;
}) {
  // Internal Judge0 error
  if (data.message) {
    return { Errors: maybeDecodeJudge0Message(data.message) };
  }

  const stdout     = fromb64(data.stdout).trimEnd();
  const stderr     = fromb64(data.stderr).trimEnd();
  const compileOut = fromb64(data.compile_output).trimEnd();
  const statusId   = data.status?.id ?? 3;

  // Compilation error (status 6)
  if (statusId === 6) {
    return { CompileErrors: compileOut || stderr || "Compilation failed." };
  }

  // Time limit exceeded (status 5)
  if (statusId === 5) {
    return { Errors: "Time limit exceeded. Your code ran too long — check for infinite loops." };
  }

  // Runtime errors (status 7–12)
  if (statusId >= 7 && statusId <= 12) {
    return { Errors: stderr || `Runtime error (${data.status?.description ?? "unknown"}).` };
  }

  // Accepted / ran — return stdout (+ any stderr warnings)
  const output = [stdout, stderr].filter(Boolean).join("\n");
  return {
    Events: output ? [{ Message: output, Kind: "stdout" }] : [],
  };
}

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // ── Go: go.dev playground (best error messages + vet) ────────────────────
    if (lang === "go") {
      const urlParams = new URLSearchParams({ version: "2", body: code, withVet: "true" });
      const res = await fetch("https://go.dev/_/compile", {
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

    const langId = JUDGE0_LANG_ID[lang];
    const res = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code:     b64(code),
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
    return NextResponse.json(normaliseJudge0(data));

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
