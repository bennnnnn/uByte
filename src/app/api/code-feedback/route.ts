import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getSteps } from "@/lib/tutorial-steps";
import { getCachedFeedback, setCachedFeedback } from "@/lib/db/ai-feedback-cache";
import { isSupportedLanguage } from "@/lib/languages/registry";

const GROK_URL = "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = "grok-4";

function normalizeCodeForCache(code: string): string {
  return String(code)
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 1000);
}

function feedbackCacheKey(
  lang: string,
  tutorialSlug: string,
  stepIndex: number,
  code: string,
  hasError: boolean
): string {
  const normalized = normalizeCodeForCache(code);
  const payload = `${lang}|${tutorialSlug}|${stepIndex}|${hasError ? "err" : "out"}|${normalized}`;
  return createHash("sha256").update(payload).digest("hex");
}

// POST /api/code-feedback
// { code, output, error, tutorialSlug, stepIndex, lang? }
export const POST = withErrorHandling("POST /api/code-feedback", async (req: NextRequest) => {
  const ip = getClientIp(req.headers);
  const { limited, retryAfter } = await checkRateLimit(`code-feedback:${ip}`, 30, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before requesting more feedback." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const body = await req.json();
  const { code, output, error, tutorialSlug, stepIndex, lang = "go" } = body;
  const language = typeof lang === "string" && isSupportedLanguage(lang) ? lang : "go";
  const stepIdx = parseInt(String(stepIndex), 10);

  const steps = getSteps(language, String(tutorialSlug));
  const step = steps[stepIdx];
  if (!step) {
    return NextResponse.json({ feedback: null });
  }

  const hasError = Boolean(error);
  const cacheKey = feedbackCacheKey(language, String(tutorialSlug), stepIdx, String(code), hasError);
  const cached = await getCachedFeedback(cacheKey);
  if (cached) {
    return NextResponse.json({ feedback: cached });
  }

  const context = error
    ? `Compiler error:\n${String(error).slice(0, 400)}`
    : `Their output: "${String(output).slice(0, 200)}"`;

  const expected =
    step.expectedOutput.length > 0
      ? `Expected output to contain: ${step.expectedOutput.slice(0, 3).join(", ")}`
      : "The program should produce some output.";

  const isWrongOutput = !error;

  const safeCode = String(code).slice(0, 1200).replace(/`{3}/g, "` ` `");

  const prompt = `A student is learning Go. They're working on: "${step.title}"

Task: ${step.instruction.slice(0, 300)}
${expected}

Their code:
\`\`\`go
${safeCode}
\`\`\`

${context}

${isWrongOutput
  ? "Their code ran but produced the WRONG output — it does NOT match what's expected. Give ONE short sentence telling them specifically what's missing or wrong (max 20 words). Be direct but friendly. Don't say 'you're on the right track'. Don't reveal the full answer — just point at what needs to change."
  : "Give ONE short sentence of feedback (max 20 words). Be warm and specific. Don't reveal the full answer — nudge them in the right direction."}
No prefix like "Feedback:" — just the sentence.`;

  try {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) throw new Error("XAI_API_KEY not set");
    const res = await fetch(GROK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 80,
        stream: false,
        temperature: 0.3,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const feedback = (data.choices?.[0]?.message?.content ?? "").trim();
    if (feedback) await setCachedFeedback(cacheKey, feedback);
    return NextResponse.json({ feedback: feedback || null });
  } catch {
    return NextResponse.json({ feedback: null });
  }
});
