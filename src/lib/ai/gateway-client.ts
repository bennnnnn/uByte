/**
 * Vercel AI Gateway client — single entry point for all AI calls.
 *
 * The gateway is OpenAI-compatible and accepts ANY provider model in the
 * format "provider/model-name". Authentication uses a Vercel API token.
 *
 * Required env var (Vercel project → Settings → Environment Variables):
 *   VERCEL_AI_GATEWAY_TOKEN  — a Vercel API token (vercel.com/account/tokens)
 *
 * For local development, set one of these as a fallback:
 *   GOOGLE_GENERATIVE_AI_API_KEY  — Google AI Studio key (for Gemini models)
 *   OPENAI_API_KEY                — OpenAI key (for GPT models)
 *
 * Verified model names in the Vercel AI Gateway:
 *   HINTS_MODEL        google/gemini-2.0-flash-lite   fast & cheap for short hints
 *   CODE_REVIEW_MODEL  openai/gpt-4o-mini             strong code understanding
 *   CHAT_MODEL         google/gemini-2.0-flash        balanced for multi-turn chat
 */

import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

/** Fast, cheap model for tutorial hints. */
export const HINTS_MODEL       = "google/gemini-2.0-flash-lite";

/** Code-specialised model for post-solve code reviews. */
export const CODE_REVIEW_MODEL = "openai/gpt-4o-mini";

/** Balanced conversational model for interview simulator / tutorial chat. */
export const CHAT_MODEL        = "google/gemini-2.0-flash";

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
 * Routes through the gateway when VERCEL_AI_GATEWAY_TOKEN is set,
 * otherwise falls back to provider-specific API keys for local dev.
 * Throws on API error or timeout — callers should catch and return a graceful fallback.
 */
export async function callGateway(opts: GatewayOptions): Promise<string> {
  const gatewayToken = process.env.VERCEL_AI_GATEWAY_TOKEN ?? process.env.VERCEL_TOKEN;

  // Determine which SDK provider to use.
  // Through the gateway ALL models go via the single OpenAI-compatible endpoint.
  // For local dev without gateway, route to the appropriate direct provider.
  let sdkModel: ReturnType<ReturnType<typeof createOpenAI>>;

  if (gatewayToken) {
    // Gateway: use OpenAI-compatible client for all models (gateway handles routing)
    const gateway = createOpenAI({
      baseURL: GATEWAY_BASE_URL,
      apiKey: gatewayToken,
    });
    sdkModel = gateway(opts.model);
  } else {
    // Local dev fallback: pick provider based on model prefix
    const isGoogle = opts.model.startsWith("google/");
    if (isGoogle) {
      const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!googleKey) throw new Error("Set VERCEL_AI_GATEWAY_TOKEN or GOOGLE_GENERATIVE_AI_API_KEY.");
      const google = createGoogleGenerativeAI({ apiKey: googleKey });
      // Strip the "google/" prefix for the direct Google provider
      sdkModel = google(opts.model.replace(/^google\//, "")) as ReturnType<ReturnType<typeof createOpenAI>>;
    } else {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) throw new Error("Set VERCEL_AI_GATEWAY_TOKEN or OPENAI_API_KEY.");
      const openai = createOpenAI({ apiKey: openaiKey });
      sdkModel = openai(opts.model.replace(/^openai\//, ""));
    }
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
    return text.trim();
  } finally {
    clearTimeout(timeout);
  }
}
