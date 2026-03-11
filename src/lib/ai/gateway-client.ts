/**
 * Vercel AI Gateway client — single entry point for all AI calls.
 *
 * The gateway is OpenAI-compatible (same request/response shape) and routes
 * to any provider, giving us:
 *   • Model switching without code changes (just change the constant below)
 *   • Semantic caching in the Vercel dashboard (same prompt = free repeat)
 *   • Analytics (latency, cost, token usage) in the Vercel project UI
 *   • Built-in fallback if a provider is down
 *
 * Required env var (set in Vercel project → Settings → Environment Variables):
 *   VERCEL_AI_GATEWAY_TOKEN  — a Vercel API token (vercel.com/account/tokens)
 *
 * Model choices by feature:
 *   HINTS_MODEL        google/gemini-2.5-flash-lite  0.3s · $0.10/$0.40 per M tokens
 *   CODE_REVIEW_MODEL  openai/gpt-5.1-codex-mini     1.1s · $0.25/$2.00 per M tokens
 *   CHAT_MODEL         google/gemini-2.5-flash        0.4s · $0.30/$2.50 per M tokens
 */

const GATEWAY_URL = "https://ai.vercel.dev/v1/chat/completions";

/**
 * 0.3s latency, 213 tps, $0.10/$0.40 per million tokens.
 * Purpose-built commercial model — proven strong instruction following and
 * reliable structured JSON output. 1M token context window.
 * Cheaper than gpt-oss-120b and better tested for strict schema compliance.
 */
export const HINTS_MODEL        = "google/gemini-2.5-flash-lite";

/**
 * Code-specialized model for full post-solve code reviews.
 * 1.1s latency, 136 tps, $0.25/$2.00 per million tokens.
 * Worth the extra latency for complexity analysis and style feedback quality.
 */
export const CODE_REVIEW_MODEL  = "openai/gpt-5.1-codex-mini";

/**
 * Conversational model for the interview simulator and tutorial chat.
 * 0.4s latency, $0.30/$2.50 per million tokens.
 * Slightly stronger than flash-lite for multi-turn context and follow-up questions.
 */
export const CHAT_MODEL         = "google/gemini-2.5-flash";

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
 * Call the Vercel AI Gateway and return the assistant's text content.
 * Throws on API error or timeout — callers should catch and return a graceful fallback.
 */
export async function callGateway(opts: GatewayOptions): Promise<string> {
  // VERCEL_TOKEN is automatically available on Vercel deployments and also works
  // with the AI Gateway, so accept it as a fallback to simplify initial setup.
  const token = process.env.VERCEL_AI_GATEWAY_TOKEN ?? process.env.VERCEL_TOKEN;
  if (!token) {
    throw new Error(
      "No AI Gateway token found. Set VERCEL_AI_GATEWAY_TOKEN in Vercel project settings " +
      "(vercel.com/account/tokens)."
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  try {
    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: opts.model,
        messages: opts.messages,
        max_tokens: opts.maxTokens ?? 512,
        temperature: opts.temperature ?? 0.3,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI Gateway ${res.status} (${opts.model}): ${errText.slice(0, 200)}`);
    }

    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return (data.choices?.[0]?.message?.content ?? "").trim();
  } finally {
    clearTimeout(timeout);
  }
}
