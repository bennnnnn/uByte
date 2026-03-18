/**
 * Startup environment variable validation.
 *
 * Called once from src/instrumentation.ts when the Next.js server process
 * initialises. Missing or empty required vars log a clear error and throw,
 * preventing cryptic failures deep inside request handlers.
 *
 * Add new vars here whenever a new env var becomes load-bearing for the
 * application to function correctly.
 */

interface EnvVar {
  key: string;
  /** If true, the server will throw and refuse to start when this var is missing. */
  required: boolean;
  /** Human-readable description shown in the error message. */
  description: string;
}

const ENV_VARS: EnvVar[] = [
  // ── Hard failures — app cannot work without these ───────────────────────────
  { key: "DATABASE_URL",          required: true,  description: "Neon PostgreSQL connection string" },
  { key: "JWT_SECRET",            required: true,  description: "JWT signing secret (min 32 chars)" },

  // ── Billing — needed for paid features ──────────────────────────────────────
  { key: "PADDLE_WEBHOOK_SECRET", required: true,  description: "Paddle webhook HMAC secret" },
  { key: "PADDLE_API_KEY",        required: true,  description: "Paddle server-side API key" },
  { key: "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN",    required: true,  description: "Paddle client token" },
  { key: "NEXT_PUBLIC_PADDLE_PRO_PRICE_ID",    required: true,  description: "Paddle monthly price ID" },
  { key: "NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID", required: true,  description: "Paddle yearly price ID" },

  // ── Auth — Google OAuth ──────────────────────────────────────────────────────
  { key: "GOOGLE_CLIENT_ID",      required: true,  description: "Google OAuth client ID" },
  { key: "GOOGLE_CLIENT_SECRET",  required: true,  description: "Google OAuth client secret" },

  // ── AI — at least one key must be present, warned not required individually ─
  { key: "GOOGLE_GENERATIVE_AI_API_KEY", required: false, description: "Gemini API key (or GEMINI_API_KEY)" },
  { key: "GEMINI_API_KEY",              required: false, description: "Gemini API key alias" },

  // ── Email ────────────────────────────────────────────────────────────────────
  { key: "RESEND_API_KEY",        required: false, description: "Resend email API key (emails silently disabled when missing)" },
];

/** Minimum length for the JWT secret to provide adequate security. */
const JWT_MIN_LENGTH = 32;

export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const { key, required, description } of ENV_VARS) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      if (required) {
        missing.push(`  ✗ ${key.padEnd(36)} — ${description}`);
      } else {
        warnings.push(`  ! ${key.padEnd(36)} — ${description} (optional, feature degraded)`);
      }
    }
  }

  // Warn if no AI key at all — AI features will silently fall back to the heuristic message
  const hasAiKey =
    !!process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    !!process.env.GEMINI_API_KEY?.trim() ||
    !!process.env.OPENAI_API_KEY?.trim();
  if (!hasAiKey) {
    warnings.push(
      "  ! GOOGLE_GENERATIVE_AI_API_KEY / GEMINI_API_KEY / OPENAI_API_KEY — no AI key set; AI hints disabled"
    );
  }

  // Warn if JWT_SECRET is too short
  const jwtSecret = process.env.JWT_SECRET ?? "";
  if (jwtSecret && jwtSecret.length < JWT_MIN_LENGTH) {
    warnings.push(
      `  ! JWT_SECRET is only ${jwtSecret.length} chars — minimum ${JWT_MIN_LENGTH} recommended for security`
    );
  }

  if (warnings.length > 0) {
    console.warn("[uByte] Environment warnings:\n" + warnings.join("\n"));
  }

  if (missing.length > 0) {
    const msg =
      "[uByte] Missing required environment variables — server cannot start:\n" +
      missing.join("\n") +
      "\n\nCopy .env.example to .env.local and fill in the values.";
    console.error(msg);
    throw new Error(msg);
  }

  console.log("[uByte] Environment validated ✓");
}
