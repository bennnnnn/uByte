import { NextResponse } from "next/server";
import { getUserById } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-utils";

const startTime = Date.now();

export const GET = withErrorHandling("GET /api/health", async () => {
  let dbOk = false;
  try {
    // Lightweight check: look up a non-existent user (returns undefined — no throw = DB up)
    await getUserById(0);
    dbOk = true;
  } catch {
    dbOk = false;
  }

  return NextResponse.json(
    {
      status: dbOk ? "ok" : "degraded",
      db: dbOk ? "ok" : "error",
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: process.env.npm_package_version ?? "0.1.0",
    },
    { status: dbOk ? 200 : 503 }
  );
});
