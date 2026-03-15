/**
 * AI code review client — full structured review of submitted code.
 * Different from tutorial-hint / ai-feedback (which give hints for failing steps).
 * This is for a comprehensive post-solve or on-demand review.
 *
 * Routes through Vercel AI Gateway → openai/gpt-5.1-codex-mini (1.1s, $0.25/$2.00/M).
 * Code-specialized model gives better complexity analysis and style feedback.
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
}

const SCHEMA_DESC = `Respond with ONLY a single JSON object (no markdown, no explanation) with these exact keys:
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
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.OPENAI_API_KEY) {
    return {
      summary: "AI code review is not configured. Set VERCEL_AI_GATEWAY_TOKEN in Vercel project settings.",
      time_complexity: "Unknown",
      space_complexity: "Unknown",
      strengths: [],
      improvements: ["Set VERCEL_AI_GATEWAY_TOKEN to enable AI code review."],
      code_style: "N/A",
      score: 0,
    };
  }

  const nameInstruction = userName
    ? `The developer's name is ${userName}. Address them by first name once in the summary.`
    : "Address the developer in a professional, encouraging tone.";

  const context = problemTitle ? `Problem: "${problemTitle}"\n` : "";
  const verdictCtx = verdict ? `Verdict: ${verdict}\n` : "";

  const system = `You are an expert code reviewer and senior software engineer. ${nameInstruction} ${SCHEMA_DESC} Be specific, actionable, and encouraging. Do NOT reveal test cases or full working solutions.`;
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
