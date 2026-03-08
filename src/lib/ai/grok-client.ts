/**
 * Shared Grok (X.AI) API client.
 * All AI-powered features use this single entry point instead of duplicating
 * the fetch + timeout + error-handling logic.
 */

const GROK_URL = process.env.XAI_API_URL || "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = "grok-4";
const DEFAULT_TIMEOUT_MS = 15_000;

export interface GrokMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GrokOptions {
  messages: GrokMessage[];
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

/**
 * Call the Grok API and return the assistant's text content.
 * Throws on API error or timeout.
 */
export async function callGrokApi(opts: GrokOptions): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("XAI_API_KEY is not set");

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  try {
    const res = await fetch(GROK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: opts.messages,
        max_tokens: opts.maxTokens ?? 512,
        stream: false,
        temperature: opts.temperature ?? 0.3,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Grok API ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    return (data.choices?.[0]?.message?.content ?? "").trim();
  } finally {
    clearTimeout(timeout);
  }
}
