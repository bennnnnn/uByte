import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const { limited, retryAfter } = await checkRateLimit(`run:${ip}`, 10, 60_000);
    if (limited) {
      return NextResponse.json(
        { Errors: "Too many requests. Please wait before running code again." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { Errors: "No code provided" },
        { status: 400 }
      );
    }

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "go",
        version: "1.16.2",
        files: [{ name: "main.go", content: code }],
      }),
    });

    const data = await response.json();

    // Piston API-level error (e.g. runtime not found)
    if (data.message) {
      return NextResponse.json({ Errors: data.message });
    }

    // Compile failure — use exit code, not presence of stderr
    if (data.compile && data.compile.code !== 0) {
      return NextResponse.json({ Errors: data.compile.stderr || data.compile.stdout || "Compilation failed" });
    }

    // Runtime output
    const stdout: string = data.run?.stdout ?? "";
    const runStderr: string = data.run?.stderr ?? "";
    const runCode: number = data.run?.code ?? 0;

    if (runCode !== 0 && runStderr) {
      return NextResponse.json({ Errors: runStderr });
    }
    if (stdout) {
      return NextResponse.json({ Events: [{ Message: stdout }] });
    }
    if (runStderr) {
      return NextResponse.json({ Events: [{ Message: runStderr }] });
    }
    return NextResponse.json({ Events: [] });
  } catch {
    return NextResponse.json(
      { Errors: "Failed to compile code. Please try again." },
      { status: 500 }
    );
  }
}
