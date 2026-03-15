/**
 * Vercel AI Gateway client — single entry point for all AI calls.
 *
 * Uses @ai-sdk/openai with the Vercel AI Gateway's OpenAI-compatible endpoint.
 * The gateway routes "provider/model" names to the right provider automatically.
 * See: https://vercel.com/docs/ai-gateway/sdks-and-apis/openai-chat-completions
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
import { createOpenAI } from "@ai-sdk/openai";

/** Fast, cheap model for tutorial hints — verified in gateway catalog. */
export const HINTS_MODEL       = "google/gemini-2.5-flash-lite";

/** Code-specialised model for post-solve code reviews. */
export const CODE_REVIEW_MODEL = "openai/gpt-4o-mini";

/** Balanced conversational model for interview simulator / tutorial chat. */
export const CHAT_MODEL        = "google/gemini-2.5-flash";

const GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1";
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
 * Call the Vercel AI Gateway using its OpenAI-compatible endpoint.
 * The gateway accepts any "provider/model" string and routes to the right provider.
 * Throws on API error or timeout — callers should catch and return a graceful fallback.
 */
export async function callGateway(opts: GatewayOptions): Promise<string> {
  const apiKey =
    process.env.AI_GATEWAY_API_KEY ??
    process.env.VERCEL_AI_GATEWAY_TOKEN;

  if (!apiKey) {
    throw new Error(
      "AI_GATEWAY_API_KEY is not set. Add it in Vercel project settings " +
      "(obtain from vercel.com/[team]/~/ai-gateway/api-keys)."
    );
  }

  console.log(`[AI gateway] calling model=${opts.model}`);

  // Use @ai-sdk/openai pointed at the Vercel AI Gateway's OpenAI-compatible URL.
  // The gateway handles routing "google/..." and "openai/..." model names.
  const gateway = createOpenAI({
    baseURL: GATEWAY_BASE_URL,
    apiKey,
  });

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
    const { text } = await generateText({
      model: gateway(opts.model),
      system: systemMsg?.content,
      messages: conversationMsgs,
      maxOutputTokens: opts.maxTokens ?? 512,
      temperature: opts.temperature ?? 0.3,
      abortSignal: abortController.signal,
    });
    console.log(`[AI gateway] success model=${opts.model} chars=${text.length}`);
    return text.trim();
  } finally {
    clearTimeout(timeout);
  }
}
