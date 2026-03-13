/**
 * GET  /api/interview-experiences — public list of approved experiences
 * POST /api/interview-experiences — submit a new experience
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getApprovedExperiences,
  countApprovedExperiences,
  submitExperience,
  type Difficulty,
  type Outcome,
} from "@/lib/db/interview-experiences";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth";

const PAGE_SIZE = 20;

export const GET = withErrorHandling("GET /api/interview-experiences", async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const company    = searchParams.get("company") ?? undefined;
  const difficulty = searchParams.get("difficulty") as Difficulty | undefined;
  const outcome    = searchParams.get("outcome") as Outcome | undefined;
  const page       = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  const [experiences, total] = await Promise.all([
    getApprovedExperiences({ company, difficulty, outcome, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    countApprovedExperiences({ company, difficulty, outcome }),
  ]);

  return NextResponse.json({ experiences, total, page, pageSize: PAGE_SIZE });
});

export const POST = withErrorHandling("POST /api/interview-experiences", async (req: NextRequest) => {
  const ip = getClientIp(req.headers);
  const { limited } = await checkRateLimit(`interview-submit:${ip}`, 5, 24 * 60 * 60 * 1000);
  if (limited) {
    return NextResponse.json({ error: "Too many submissions. Please try again tomorrow." }, { status: 429 });
  }

  const user = await getCurrentUser();

  const body = await req.json() as {
    company?: string;
    role?: string;
    difficulty?: string;
    outcome?: string;
    rounds?: string;
    tips?: string;
    anonymous?: boolean;
  };

  const { company, role, difficulty, outcome, rounds, tips, anonymous = true } = body;

  if (!company || !role || !difficulty || !outcome || !rounds) {
    return NextResponse.json({ error: "company, role, difficulty, outcome and rounds are required." }, { status: 400 });
  }
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return NextResponse.json({ error: "Invalid difficulty." }, { status: 400 });
  }
  if (!["offer", "rejection", "ongoing", "ghosted"].includes(outcome)) {
    return NextResponse.json({ error: "Invalid outcome." }, { status: 400 });
  }
  if (company.length > 120 || role.length > 120) {
    return NextResponse.json({ error: "Company/role too long." }, { status: 400 });
  }
  if (rounds.length > 8000) {
    return NextResponse.json({ error: "Rounds description too long." }, { status: 400 });
  }
  if (tips && tips.length > 2000) {
    return NextResponse.json({ error: "Tips too long." }, { status: 400 });
  }

  const id = await submitExperience({
    user_id: user?.userId ?? null,
    company: company.trim(),
    role: role.trim(),
    difficulty: difficulty as Difficulty,
    outcome: outcome as Outcome,
    rounds: rounds.trim(),
    tips: tips?.trim() || undefined,
    anonymous,
  });

  return NextResponse.json({ ok: true, id });
});
