import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import { getSubmissionById } from "@/lib/db/submissions";
import { getPracticeProblemBySlug } from "@/lib/practice/problems";
import { callGateway, CHAT_MODEL } from "@/lib/ai/gateway-client";
import {
  canMakeAiCall,
  incrementTodayAiUsage,
  isInCooldown,
  setLastAiCallAt,
  AI_COOLDOWN_SECONDS,
} from "@/lib/db/ai-usage";
import { withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { MAX_USER_MESSAGE_LENGTH, MAX_SESSION_TURNS } from "@/lib/ai/chat-constants";

/** POST /api/ai-chat — interactive follow-up chat scoped to a single submission. */
export const POST = withErrorHandling("POST /api/ai-chat", async (request: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to use AI chat" }, { status: 401 });
  }

  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  const ip = getClientIp(request.headers);
  const { limited, retryAfter } = await checkRateLimit(`ai-chat:${ip}:${user.userId}`, 30, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const body = await request.json();
  const submissionId = body?.submission_id != null ? Number(body.submission_id) : NaN;
  const userMessage: string = typeof body?.message === "string" ? body.message.trim() : "";
  const history: { role: "user" | "assistant"; content: string }[] = Array.isArray(body?.history)
    ? body.history
    : [];

  if (!Number.isInteger(submissionId) || submissionId < 1) {
    return NextResponse.json({ error: "submission_id required" }, { status: 400 });
  }
  if (!userMessage) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }
  if (userMessage.length > MAX_USER_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message too long (max ${MAX_USER_MESSAGE_LENGTH} characters)` },
      { status: 400 },
    );
  }
  if (history.length > MAX_SESSION_TURNS * 2) {
    return NextResponse.json({ error: "session_limit" }, { status: 400 });
  }

  const submission = await getSubmissionById(submissionId);
  if (!submission || submission.user_id !== user.userId) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const problem = getPracticeProblemBySlug(submission.problem_id);
  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  const dbUser = await getUserById(user.userId);
  if (!hasPaidAccess(dbUser?.plan)) {
    return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
  }

  const { allowed, used, limit } = await canMakeAiCall(user.userId);
  if (!allowed) {
    return NextResponse.json(
      { error: `Daily AI limit reached (${used}/${limit}). Try again tomorrow.` },
      { status: 429 },
    );
  }

  if (await isInCooldown(user.userId)) {
    return NextResponse.json(
      { error: `Please wait ${AI_COOLDOWN_SECONDS} seconds between messages.` },
      { status: 429 },
    );
  }

  const systemPrompt = `You are a focused coding tutor helping a student with ONE problem: "${problem.title}".

STRICT RULES:
1. Only answer questions about this specific problem, the student's code, or directly related concepts (time complexity, data structures used, similar patterns).
2. If the question is off-topic, reply only: "I can only help with this problem."
3. Every reply MUST be 1–3 sentences. Never longer. Be direct.
4. If you show code, use one short snippet only (≤5 lines).

Problem: ${problem.title} (${problem.difficulty} — ${problem.category})
${problem.description.slice(0, 400)}

Student's ${submission.language} code:
\`\`\`
${submission.code.slice(0, 600)}
\`\`\`
Verdict: ${submission.verdict}`;

  // Only send the last 6 turns to the AI to keep token usage low
  const trimmedHistory = history.slice(-(MAX_SESSION_TURNS / 2) * 2);

  const reply = await callGateway({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...trimmedHistory,
      { role: "user", content: userMessage },
    ],
    maxTokens: 180,
    temperature: 0.3,
  });

  await incrementTodayAiUsage(user.userId);
  await setLastAiCallAt(user.userId);

  return NextResponse.json({ reply });
});
