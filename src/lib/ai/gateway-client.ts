/**
 * AI client — routes through Vercel AI Gateway if AI_GATEWAY_API_KEY is set,
 * otherwise falls back to Google directly via GOOGLE_GENERATIVE_AI_API_KEY.
 *
 * Recommended setup (simplest — free Google AI Studio key):
 *   GOOGLE_GENERATIVE_AI_API_KEY  — from aistudio.google.com (free tier)
 *
 * Optional (for Vercel AI Gateway observability):
 *   AI_GATEWAY_API_KEY  — from vercel.com/[team]/~/ai-gateway/api-keys
 *
 * Verified model names:
 *   HINTS_MODEL        gemini-2.5-flash-lite   fast & cheap for short hints
 *   CODE_REVIEW_MODEL  gpt-4o-mini             strong code understanding
 *   CHAT_MODEL         gemini-2.5-flash        balanced for multi-turn chat
 */

import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

export const HINTS_MODEL       = "gemini-2.5-flash-lite";
export const CODE_REVIEW_MODEL = "gpt-4o-mini";
export const CHAT_MODEL        = "gemini-2.5-flash";

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

export async function callGateway(opts: GatewayOptions): Promise<string> {
  const gatewayKey  = process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_AI_GATEWAY_TOKEN;
  const googleKey   = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openaiKey   = process.env.OPENAI_API_KEY;

  const isGoogleModel = opts.model.startsWith("gemini");
  const isOpenAIModel = opts.model.startsWith("gpt-") || opts.model.startsWith("o1") || opts.model.startsWith("o3");

  let sdkModel: ReturnType<ReturnType<typeof createGoogleGenerativeAI | typeof createOpenAI>>;

  if (gatewayKey) {
    // Route everything through Vercel AI Gateway (OpenAI-compatible endpoint)
    const gateway = createOpenAI({ baseURL: GATEWAY_BASE_URL, apiKey: gatewayKey });
    // Gateway requires provider-prefixed model names
    const prefixedModel = isGoogleModel
      ? `google/${opts.model}`
      : isOpenAIModel
      ? `openai/${opts.model}`
      : opts.model;
    sdkModel = gateway(prefixedModel);
    console.log(`[AI] via gateway model=${prefixedModel}`);
  } else if (isGoogleModel && googleKey) {
    // Direct Google — free tier, no gateway needed
    const google = createGoogleGenerativeAI({ apiKey: googleKey });
    sdkModel = google(opts.model);
    console.log(`[AI] via Google direct model=${opts.model}`);
  } else if (isOpenAIModel && openaiKey) {
    const openai = createOpenAI({ apiKey: openaiKey });
    sdkModel = openai(opts.model);
    console.log(`[AI] via OpenAI direct model=${opts.model}`);
  } else {
    throw new Error(
      `No API key found. Set GOOGLE_GENERATIVE_AI_API_KEY (free at aistudio.google.com) ` +
      `or AI_GATEWAY_API_KEY in Vercel environment variables.`
    );
  }

  const systemMsg = opts.messages.find((m) => m.role === "system");
  const conversationMsgs = opts.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const { text } = await generateText({
      model: sdkModel,
      system: systemMsg?.content,
      messages: conversationMsgs,
      maxOutputTokens: opts.maxTokens ?? 512,
      temperature: opts.temperature ?? 0.3,
      abortSignal: abortController.signal,
    });
    console.log(`[AI] success chars=${text.length}`);
    return text.trim();
  } finally {
    clearTimeout(timeout);
  }
}
