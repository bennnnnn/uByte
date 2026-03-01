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

    const body = new URLSearchParams({ version: "2", body: code, withVet: "true" });
    const response = await fetch("https://go.dev/_/compile", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await response.json();
    // Response is already { Errors?: string, Events?: { Message, Kind, Delay }[] }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { Errors: "Failed to compile code. Please try again." },
      { status: 500 }
    );
  }
}
