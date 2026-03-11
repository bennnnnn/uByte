/**
 * AI feedback client — tutorial hints and inline step feedback.
 * Routes through Vercel AI Gateway → google/gemini-2.5-flash-lite (0.3s, $0.10/M).
 * Falls back to Grok via XAI_API_KEY if VERCEL_AI_GATEWAY_TOKEN is absent.
 */

import { callGateway, HINTS_MODEL } from "./gateway-client";

export interface AiFeedbackSchema {
  friendly_one_liner: string;
  root_cause: string;
  evidence: string[];
  hint: string;
  next_step: string;
  minimal_patch?: string;
  confidence: number;
}

const SCHEMA_DESC = `Respond with ONLY a single JSON object (no markdown, no explanation) with these exact keys:
- friendly_one_liner: string, max 160 chars, one sentence for the user
- root_cause: string, brief technical cause
- evidence: array of strings (1-3 items from the submission)
- hint: string, helpful hint for the current hint level
- next_step: string, what to try next
- minimal_patch: string (optional), only a small code snippet if needed, never full solution
- confidence: number between 0 and 1

Do NOT output full working solution. Do NOT reveal hidden tests. Prefer hints and minimal patch.`;

export async function callAiFeedback(
  evidenceBundle: string,
  hintLevel: number,
  verdict: string,
  userName?: string,
): Promise<AiFeedbackSchema> {
  const hasCredentials = process.env.VERCEL_AI_GATEWAY_TOKEN ?? process.env.VERCEL_TOKEN ?? process.env.XAI_API_KEY;
  if (!hasCredentials) {
    const greeting = userName ? `Hey ${userName}!` : "Hey!";
    return {
      friendly_one_liner: `${greeting} AI feedback is not configured — set VERCEL_AI_GATEWAY_TOKEN in Vercel project settings.`,
      root_cause: "no_ai_config",
      evidence: [],
      hint: "Review the compiler or runtime output above and try a small fix.",
      next_step: "Fix the reported issue and resubmit.",
      confidence: 0,
    };
  }
  return callFeedbackGateway(evidenceBundle, hintLevel, verdict, userName);
}

async function callFeedbackGateway(
  evidenceBundle: string,
  hintLevel: number,
  verdict: string,
  userName?: string,
): Promise<AiFeedbackSchema> {
  const levelPrompt =
    hintLevel === 1 ? "Give a short, gentle hint (1-2 sentences). Do not give code yet." :
    hintLevel === 2 ? "Explain the root cause and suggest a direction. You may give a minimal code snippet." :
    hintLevel === 3 ? "Suggest a concrete fix (minimal_patch) if applicable. No full solution." :
    "Teach the concept briefly; keep hint and next_step actionable. No full solution.";

  const nameInstruction = userName
    ? `The learner's name is ${userName}. Address them by first name naturally in friendly_one_liner (e.g. "Nice try, ${userName}!" or "${userName}, your logic is close —"). Do not repeat the name more than once.`
    : "Address the learner in a friendly, encouraging tone.";

  const system = `You are a friendly coding tutor. ${nameInstruction} ${SCHEMA_DESC} ${levelPrompt} Respond with ONLY a single JSON object.`;
  const user = `Verdict: ${verdict}\n\n${evidenceBundle}\n\nReturn ONLY valid JSON.`;

  const text = await callGateway({
    model: HINTS_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    maxTokens: 1024,
    temperature: 0.3,
  });

  return await parseAiResponse(text, () => callFeedbackGateway(evidenceBundle + "\n\nReturn ONLY valid JSON.", hintLevel, verdict, userName));
}

async function parseAiResponse(
  text: string,
  retry: () => Promise<AiFeedbackSchema>
): Promise<AiFeedbackSchema> {
  const trimmed = text.trim().replace(/^```json?\s*/i, "").replace(/\s*```\s*$/, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return retry().catch((): AiFeedbackSchema => ({
      friendly_one_liner: "Could not parse AI response. Try again or use the judge output above.",
      root_cause: "parse_error",
      evidence: [],
      hint: "Review the compiler or runtime output.",
      next_step: "Fix and resubmit.",
      confidence: 0,
    }));
  }

  const o = parsed as Record<string, unknown>;
  return {
    friendly_one_liner: typeof o.friendly_one_liner === "string" ? o.friendly_one_liner.slice(0, 160) : "Something went wrong.",
    root_cause: typeof o.root_cause === "string" ? o.root_cause : "",
    evidence: Array.isArray(o.evidence) ? o.evidence.filter((x): x is string => typeof x === "string") : [],
    hint: typeof o.hint === "string" ? o.hint : "",
    next_step: typeof o.next_step === "string" ? o.next_step : "",
    minimal_patch: typeof o.minimal_patch === "string" ? o.minimal_patch : undefined,
    confidence: typeof o.confidence === "number" && o.confidence >= 0 && o.confidence <= 1 ? o.confidence : 0.5,
  };
}
