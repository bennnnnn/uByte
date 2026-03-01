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
        version: "*",
        files: [{ name: "main.go", content: code }],
      }),
    });

    const data = await response.json();

    // Map Piston response to the shape CodePlayground.tsx expects
    const compileErr: string = data.compile?.stderr ?? "";
    const runErr: string = data.run?.stderr ?? "";
    const stdout: string = data.run?.stdout ?? "";
    const stderr = compileErr || runErr;

    if (stderr) {
      return NextResponse.json({ Errors: stderr });
    }
    if (stdout) {
      return NextResponse.json({ Events: [{ Message: stdout }] });
    }
    return NextResponse.json({ Events: [] });
  } catch {
    return NextResponse.json(
      { Errors: "Failed to compile code. Please try again." },
      { status: 500 }
    );
  }
}
