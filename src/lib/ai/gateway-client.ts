/**
 * AI client — uses @google/genai (official Google SDK) for Google models,
 * and @ai-sdk/openai for OpenAI models.
 *
 * Required env var (pick one — both accepted):
 *   GOOGLE_GENERATIVE_AI_API_KEY  — standard name used by many integrations
 *   GEMINI_API_KEY                — name used in Google AI Studio docs
 *
 * Optional (for OpenAI models):
 *   OPENAI_API_KEY
 */

import { GoogleGenAI } from "@google/genai";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const HINTS_MODEL       = "gemini-2.5-flash";
export const CODE_REVIEW_MODEL = "gemini-2.5-flash";
export const CHAT_MODEL        = "gemini-2.5-flash";

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
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const isGoogleModel = opts.model.startsWith("gemini") || opts.model.startsWith("google/");

  if (isGoogleModel && googleKey) {
    return callGoogleDirect(opts, googleKey);
  }

  if (openaiKey) {
    return callOpenAIDirect(opts, openaiKey);
  }

  throw new Error(
    "No AI key configured. Set GOOGLE_GENERATIVE_AI_API_KEY in Vercel env vars (free key at aistudio.google.com)."
  );
}

async function callGoogleDirect(opts: GatewayOptions, apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  const systemMsg = opts.messages.find((m) => m.role === "system");
  const userMsgs  = opts.messages.filter((m) => m.role !== "system");

  const contents = userMsgs.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await ai.models.generateContent({
    model: opts.model,
    contents,
    config: {
      systemInstruction: systemMsg?.content,
      temperature: opts.temperature ?? 0.3,
      maxOutputTokens: opts.maxTokens ?? 512,
    },
  });

  return (response.text ?? "").trim();
}

async function callOpenAIDirect(opts: GatewayOptions, apiKey: string): Promise<string> {
  const openai = createOpenAI({ apiKey });
  const sdkModel = openai(opts.model);

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
