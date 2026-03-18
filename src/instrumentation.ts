/**
 * Next.js instrumentation hook — runs once when the server process starts.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * We use it to validate required environment variables early so any missing
 * config is surfaced at boot time, not buried in a request-time stack trace.
 */
export async function register() {
  // Only validate on the Node.js runtime (not Edge).
  // The Edge runtime runs validateEnv calls inline per-request — no need to
  // duplicate here, and the edge env may legitimately differ.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("./lib/validate-env");
    validateEnv();
  }
}
