/**
 * Vercel AI Gateway client — single entry point for all AI calls.
 *
 * Uses Vercel AI SDK v6. When AI_GATEWAY_API_KEY is set in the environment,
 * the SDK automatically routes "provider/model" strings through the gateway.
 * No manual provider setup needed — just set the env var and use the model string.
 *
 * Required env var (Vercel project → Settings → Environment Variables):
 *   AI_GATEWAY_API_KEY  — from vercel.com/[team]/~/ai-gateway/api-keys
 *
 * Verified model names from https://vercel.com/ai-gateway/models:
 *   HINTS_MODEL        google/gemini-2.5-flash-lite   0.3s · $0.10/$0.40 per M tokens
 *   CODE_REVIEW_MODEL  openai/gpt-4o-mini             0.5s · $0.15/$0.60 per M tokens
 *   CHAT_MODEL         google/gemini-2.5-flash        0.4s · $0.30/$2.50 per M tokens
 */

import { generateText } from "ai";

/** Fast, cheap model for tutorial hints — verified in gateway catalog. */
export const HINTS_MODEL       = "google/gemini-2.5-flash-lite";

/** Code-specialised model for post-solve code reviews. */
export const CODE_REVIEW_MODEL = "openai/gpt-4o-mini";

/** Balanced conversational model for interview simulator / tutorial chat. */
export const CHAT_MODEL        = "google/gemini-2.5-flash";

const DEFAULT_TIMEOUT_MS = 15_000;

export interface GatewayMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GatewayOptions {
  model: string;
  messages: GatewayMessage[];
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

/**
 * Call the Vercel AI Gateway and return the assistant text.
 * The AI SDK v6 reads AI_GATEWAY_API_KEY from the environment automatically
 * and routes "provider/model" strings to the right provider.
 * Throws on API error or timeout — callers should catch and return a graceful fallback.
 */
export async function callGateway(opts: GatewayOptions): Promise<string> {
  const systemMsg = opts.messages.find((m) => m.role === "system");
  const conversationMsgs = opts.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const abortController = new AbortController();
  const timeout = setTimeout(
    () => abortController.abort(),
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  try {
    const hasKey = !!(process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_AI_GATEWAY_TOKEN);
    console.log(`[AI gateway] model=${opts.model} key_present=${hasKey}`);

    // AI SDK v6: passing a "provider/model" string works automatically
    // when AI_GATEWAY_API_KEY is set — no createOpenAI() wrapper needed.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { text } = await generateText({
      model: opts.model as any,
      system: systemMsg?.content,
      messages: conversationMsgs,
      maxOutputTokens: opts.maxTokens ?? 512,
      temperature: opts.temperature ?? 0.3,
      abortSignal: abortController.signal,
    });
    return text.trim();
  } finally {
    clearTimeout(timeout);
  }
}
