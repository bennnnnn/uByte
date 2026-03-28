/**
 * AI code review + interview debrief client.
 * Code review: holistic quality analysis for normal practice.
 * Interview debrief: HackerRank-style grading scoped to interview simulation.
 */
import { callGateway, CODE_REVIEW_MODEL } from "./gateway-client";

export interface CodeReviewSchema {
  summary: string;
  time_complexity: string;
  space_complexity: string;
  strengths: string[];
  improvements: string[];
  code_style: string;
  score: number; // 1-10
  // Interview-only fields (undefined for normal code review)
  hire_recommendation?: "strong_hire" | "hire" | "borderline" | "no_hire";
  time_management?: string;
  correctness_assessment?: string;
  interview_tips?: string[];
}

// ─── Normal code review ────────────────────────────────────────────────────

const CODE_REVIEW_SCHEMA = `Respond with ONLY a single JSON object (no markdown, no explanation) with these exact keys:
- summary: string (2-3 sentences, overall quality assessment)
- time_complexity: string (e.g. "O(n log n)" with brief explanation)
- space_complexity: string (e.g. "O(n)" with brief explanation)
- strengths: array of strings (2-4 things done well)
- improvements: array of strings (2-4 concrete suggestions to improve)
- code_style: string (1-2 sentences about naming, readability, idioms)
- score: integer 1-10 (holistic quality score, 7+ is good, 5-6 is acceptable, <5 needs work)`;

export async function callCodeReview(
  code: string,
  lang: string,
  problemTitle?: string,
  verdict?: string,
  userName?: string,
): Promise<CodeReviewSchema> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return {
      summary: "AI code review is not configured.",
      time_complexity: "Unknown",
      space_complexity: "Unknown",
      strengths: [],
      improvements: ["Set GOOGLE_GENERATIVE_AI_API_KEY in Vercel env vars to enable AI code review."],
      code_style: "N/A",
      score: 0,
    };
  }

  const safeName = userName ? userName.replace(/[^a-zA-Z\s'-]/g, "").trim().slice(0, 30) : undefined;
  const nameInstruction = safeName
    ? `The developer's name is ${safeName}. Address them by first name once in the summary.`
    : "Address the developer in a professional, encouraging tone.";

  const context = problemTitle ? `Problem: "${problemTitle}"\n` : "";
  const verdictCtx = verdict ? `Verdict: ${verdict}\n` : "";

  const system = `You are an expert code reviewer and senior software engineer. ${nameInstruction} ${CODE_REVIEW_SCHEMA} Be specific, actionable, and encouraging. Do NOT reveal test cases or full working solutions.`;
  const userMsg = `${context}${verdictCtx}Language: ${lang}\n\nCode:\n\`\`\`${lang}\n${code.trim()}\n\`\`\`\n\nReturn ONLY valid JSON.`;

  const text = await callGateway({
    model: CODE_REVIEW_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMsg },
    ],
    maxTokens: 1200,
    temperature: 0.3,
  });

  return parseCodeReview(text, () => callCodeReview(code, lang, problemTitle, verdict, userName));
}

// ─── Interview debrief ─────────────────────────────────────────────────────

export interface InterviewContext {
  timeTakenSeconds: number;
  timeAllowedSeconds: number;
  verdict: string;
  passedCases: number;
  totalCases: number;
}

const INTERVIEW_DEBRIEF_SCHEMA = `Respond with ONLY a single JSON object (no markdown, no explanation) with these exact keys:
- summary: string (2-3 sentences, honest overall interview performance assessment)
- hire_recommendation: one of exactly: "strong_hire", "hire", "borderline", "no_hire"
- score: integer 1-10 (overall interview performance; 8-10 strong hire, 6-7 hire, 4-5 borderline, 1-3 no hire)
- time_complexity: string (e.g. "O(n)" with brief explanation)
- space_complexity: string (e.g. "O(n)" with brief explanation)
- time_management: string (1-2 sentences specifically about how time was used — if they finished very quickly but got the wrong answer, tell them to use the full time to test and trace; if they ran out of time, suggest pacing strategies)
- correctness_assessment: string (1-2 sentences about correctness — test cases passed/failed, compile/runtime errors)
- strengths: array of strings (2-3 things done well in the interview context)
- improvements: array of strings (2-4 concrete improvements specifically for an interview setting)
- interview_tips: array of strings (2-3 practical tips for real interviews, e.g. "explain your approach before coding", "always test with edge cases")
- code_style: string (1 sentence about naming, readability, interview-friendliness)`;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} seconds`;
  if (s === 0) return `${m} minute${m !== 1 ? "s" : ""}`;
  return `${m} minute${m !== 1 ? "s" : ""} ${s} second${s !== 1 ? "s" : ""}`;
}

export async function callInterviewDebrief(
  code: string,
  lang: string,
  problemTitle: string,
  problemDifficulty: string,
  ctx: InterviewContext,
  userName?: string,
): Promise<CodeReviewSchema> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return {
      summary: "AI interview debrief is not configured.",
      time_complexity: "Unknown",
      space_complexity: "Unknown",
      strengths: [],
      improvements: ["Set GOOGLE_GENERATIVE_AI_API_KEY in Vercel env vars to enable AI interview debrief."],
      code_style: "N/A",
      score: 0,
    };
  }

  const safeName = userName ? userName.replace(/[^a-zA-Z\s'-]/g, "").trim().slice(0, 30) : undefined;
  const nameInstruction = safeName
    ? `The candidate's name is ${safeName}. Address them by first name in the summary.`
    : "Address the candidate in a direct, professional tone.";

  const timeTakenLabel = formatDuration(ctx.timeTakenSeconds);
  const timeAllowedLabel = formatDuration(ctx.timeAllowedSeconds);
  const timeUsedPct = ctx.timeAllowedSeconds > 0
    ? Math.round((ctx.timeTakenSeconds / ctx.timeAllowedSeconds) * 100)
    : 100;
  const timeRemaining = Math.max(0, ctx.timeAllowedSeconds - ctx.timeTakenSeconds);
  const timeRemainingLabel = formatDuration(timeRemaining);

  const verdictLabel =
    ctx.verdict === "accepted" ? "All test cases passed (Accepted)"
    : ctx.verdict === "wrong_answer" ? `Wrong Answer (${ctx.passedCases}/${ctx.totalCases} test cases passed)`
    : ctx.verdict === "compile_error" ? "Compile Error (code did not compile)"
    : ctx.verdict === "runtime_error" ? "Runtime Error (code crashed)"
    : ctx.verdict === "tle" ? "Time Limit Exceeded (too slow)"
    : ctx.verdict;

  const system = `You are a senior software engineering interviewer at a top tech company. You are grading a mock coding interview. ${nameInstruction} Your assessment must be honest, specific, and actionable — like a real HackerRank or Google interview scorecard. ${INTERVIEW_DEBRIEF_SCHEMA}`;

  const userMsg = [
    `Problem: "${problemTitle}" (${problemDifficulty})`,
    `Language: ${lang}`,
    ``,
    `Interview session:`,
    `- Time allowed: ${timeAllowedLabel}`,
    `- Time used: ${timeTakenLabel} (${timeUsedPct}% of allowed time)`,
    `- Time remaining when submitted: ${timeRemainingLabel}`,
    `- Result: ${verdictLabel}`,
    ``,
    `Candidate's code:`,
    `\`\`\`${lang}`,
    code.trim(),
    `\`\`\``,
    ``,
    `Grade this interview attempt honestly. If the candidate submitted quickly but got a wrong answer, they should be advised to use the full time to trace through edge cases. If they got it right very fast, acknowledge the speed. Return ONLY valid JSON.`,
  ].join("\n");

  const text = await callGateway({
    model: CODE_REVIEW_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMsg },
    ],
    maxTokens: 1400,
    temperature: 0.3,
  });

  return parseInterviewDebrief(text, () =>
    callInterviewDebrief(code, lang, problemTitle, problemDifficulty, ctx, userName)
  );
}

// ─── Parsers ───────────────────────────────────────────────────────────────

async function parseCodeReview(
  text: string,
  retry: () => Promise<CodeReviewSchema>,
): Promise<CodeReviewSchema> {
  const trimmed = text.trim().replace(/^```json?\s*/i, "").replace(/\s*```\s*$/, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return retry().catch((): CodeReviewSchema => ({
      summary: "Could not parse AI response. Try again.",
      time_complexity: "Unknown",
      space_complexity: "Unknown",
      strengths: [],
      improvements: [],
      code_style: "",
      score: 0,
    }));
  }
  const o = parsed as Record<string, unknown>;
  return {
    summary: typeof o.summary === "string" ? o.summary : "",
    time_complexity: typeof o.time_complexity === "string" ? o.time_complexity : "Unknown",
    space_complexity: typeof o.space_complexity === "string" ? o.space_complexity : "Unknown",
    strengths: Array.isArray(o.strengths) ? o.strengths.filter((x): x is string => typeof x === "string") : [],
    improvements: Array.isArray(o.improvements) ? o.improvements.filter((x): x is string => typeof x === "string") : [],
    code_style: typeof o.code_style === "string" ? o.code_style : "",
    score: typeof o.score === "number" && o.score >= 1 && o.score <= 10 ? Math.round(o.score) : 5,
  };
}

async function parseInterviewDebrief(
  text: string,
  retry: () => Promise<CodeReviewSchema>,
): Promise<CodeReviewSchema> {
  const trimmed = text.trim().replace(/^```json?\s*/i, "").replace(/\s*```\s*$/, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return retry().catch((): CodeReviewSchema => ({
      summary: "Could not parse AI response. Try again.",
      time_complexity: "Unknown",
      space_complexity: "Unknown",
      strengths: [],
      improvements: [],
      code_style: "",
      score: 0,
    }));
  }
  const o = parsed as Record<string, unknown>;
  const validRec = ["strong_hire", "hire", "borderline", "no_hire"];
  return {
    summary: typeof o.summary === "string" ? o.summary : "",
    hire_recommendation: validRec.includes(o.hire_recommendation as string)
      ? (o.hire_recommendation as CodeReviewSchema["hire_recommendation"])
      : "borderline",
    score: typeof o.score === "number" && o.score >= 1 && o.score <= 10 ? Math.round(o.score) : 5,
    time_complexity: typeof o.time_complexity === "string" ? o.time_complexity : "Unknown",
    space_complexity: typeof o.space_complexity === "string" ? o.space_complexity : "Unknown",
    time_management: typeof o.time_management === "string" ? o.time_management : undefined,
    correctness_assessment: typeof o.correctness_assessment === "string" ? o.correctness_assessment : undefined,
    strengths: Array.isArray(o.strengths) ? o.strengths.filter((x): x is string => typeof x === "string") : [],
    improvements: Array.isArray(o.improvements) ? o.improvements.filter((x): x is string => typeof x === "string") : [],
    interview_tips: Array.isArray(o.interview_tips) ? o.interview_tips.filter((x): x is string => typeof x === "string") : [],
    code_style: typeof o.code_style === "string" ? o.code_style : "",
  };
}
