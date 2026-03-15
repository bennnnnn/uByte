/**
 * Vercel AI Gateway client — single entry point for all AI calls.
 *
 * Uses Vercel AI SDK v6 with the AI Gateway. The SDK accepts model strings in
 * the format "provider/model-name" and automatically routes them through the
 * gateway when AI_GATEWAY_API_KEY is present.
 *
 * Required env var (Vercel project → Settings → Environment Variables):
 *   AI_GATEWAY_API_KEY  — obtained from vercel.com/[team]/~/ai-gateway/api-keys
 *                         (NOT a regular Vercel API token — a dedicated gateway key)
 *
 * Verified model names from https://vercel.com/ai-gateway/models:
 *   HINTS_MODEL        google/gemini-2.5-flash-lite   0.3s · $0.10/$0.40 per M tokens
 *   CODE_REVIEW_MODEL  openai/gpt-4o-mini             0.5s · $0.15/$0.60 per M tokens
 *   CHAT_MODEL         google/gemini-2.5-flash        0.4s · $0.30/$2.50 per M tokens
 */

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

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
 * Call the Vercel AI Gateway and return the assistant text.
 * Throws on API error or timeout — callers should catch and return a graceful fallback.
 */
export async function callGateway(opts: GatewayOptions): Promise<string> {
  const gatewayKey =
    process.env.AI_GATEWAY_API_KEY ??
    // Legacy env var names — kept for backwards compatibility during migration
    process.env.VERCEL_AI_GATEWAY_TOKEN ??
    process.env.VERCEL_TOKEN;

  if (!gatewayKey) {
    throw new Error(
      "No AI Gateway key found. Set AI_GATEWAY_API_KEY in Vercel project settings " +
      "(obtain from vercel.com/[team]/~/ai-gateway/api-keys)."
    );
  }

  const systemMsg = opts.messages.find((m) => m.role === "system");
  const conversationMsgs = opts.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  // Route all models through the Vercel AI Gateway OpenAI-compatible endpoint.
  // The gateway handles provider routing based on the "provider/model" prefix.
  const gateway = createOpenAI({
    baseURL: GATEWAY_BASE_URL,
    apiKey: gatewayKey,
  });

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
    return text.trim();
  } finally {
    clearTimeout(timeout);
  }
}
