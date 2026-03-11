/**
 * Vercel AI Gateway client — drop-in replacement for grok-client.ts.
 *
 * The gateway is OpenAI-compatible (same request/response shape) but routes
 * to any provider via a single endpoint. This gives us:
 *   • Model switching without code changes (just change the model string)
 *   • Semantic caching in the Vercel dashboard (same prompt = free repeat)
 *   • Analytics (latency, cost, token usage) in the Vercel project UI
 *   • Automatic fallback if a provider is down
 *
 * Required env var:
 *   VERCEL_AI_GATEWAY_TOKEN  — Vercel API token with AI Gateway access
 *   (Generate at vercel.com/account/tokens, or it's available automatically
 *    as VERCEL_TOKEN on Vercel deployments)
 *
 * Model choices:
 *   HINTS_MODEL       google/gemini-2.5-flash-lite   0.3s · $0.10/$0.40 per M tokens
 *   CODE_REVIEW_MODEL openai/gpt-5.1-codex-mini      1.1s · $0.25/$2.00 per M tokens
 *
 * Fallback:
 *   If VERCEL_AI_GATEWAY_TOKEN is not set, calls fall through to Grok via XAI_API_KEY
 *   (see callGrokApi below) so local development continues to work unchanged.
 */

const GATEWAY_URL = "https://ai.vercel.dev/v1/chat/completions";

/**
 * 0.1s latency, 466 tps, $0.25/$0.69 per million tokens.
 * 120B open-source model — fast enough for real-time hints, large enough
 * to reliably follow the structured JSON schema every time.
 */
export const HINTS_MODEL        = "openai/gpt-oss-120b";

/**
 * Code-specialized model for full post-solve code reviews.
 * 1.1s latency, 136 tps, $0.25/$2.00 per million tokens.
 * Worth the extra latency for complexity analysis and style feedback quality.
 */
export const CODE_REVIEW_MODEL  = "openai/gpt-5.1-codex-mini";

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
 *
 * Falls back to the legacy Grok client if VERCEL_AI_GATEWAY_TOKEN is not set
 * (useful for local development where the token may not be configured).
 */
export async function callGateway(opts: GatewayOptions): Promise<string> {
  const token = process.env.VERCEL_AI_GATEWAY_TOKEN ?? process.env.VERCEL_TOKEN;

  // Graceful fallback to Grok for local dev / missing token
  if (!token) {
    return callGrokFallback(opts);
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

// ─── Legacy Grok fallback (used when VERCEL_AI_GATEWAY_TOKEN is absent) ─────

const GROK_URL   = process.env.XAI_API_URL ?? "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = "grok-4";

async function callGrokFallback(opts: GatewayOptions): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Neither VERCEL_AI_GATEWAY_TOKEN nor XAI_API_KEY is set. " +
      "Set VERCEL_AI_GATEWAY_TOKEN in Vercel project settings."
    );
  }

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
      throw new Error(`Grok fallback ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return (data.choices?.[0]?.message?.content ?? "").trim();
  } finally {
    clearTimeout(timeout);
  }
}
