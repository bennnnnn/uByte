/**
 * Tests for billing-critical pure functions.
 * verifyPaddleSignature lives inside the route module, so we test equivalent
 * logic here via the Web Crypto API that the route uses.
 */
import { describe, it, expect } from "vitest";

// ── helpers (same logic as verifyPaddleSignature in the route) ──────────────

async function signPayload(secret: string, ts: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${ts}:${body}`)
  );
  return Buffer.from(mac).toString("hex");
}

async function buildSigHeader(secret: string, ts: string, body: string): Promise<string> {
  const h1 = await signPayload(secret, ts, body);
  return `ts=${ts};h1=${h1}`;
}

/**
 * Mirrors the verifyPaddleSignature logic without the timestamp tolerance check
 * so we can write deterministic tests.
 */
async function verifySignaturePure(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  if (!secret) return false;
  const parts: Record<string, string> = {};
  for (const part of sigHeader.split(";")) {
    const [k, v] = part.split("=", 2);
    if (k && v) parts[k] = v;
  }
  const { ts, h1 } = parts;
  if (!ts || !h1) return false;

  const expected = await signPayload(secret, ts, payload);
  if (expected.length !== h1.length) return false;

  const a = Buffer.from(expected, "utf-8");
  const b = Buffer.from(h1, "utf-8");
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ── tests ────────────────────────────────────────────────────────────────────

describe("Paddle HMAC signature verification", () => {
  const SECRET = "test-webhook-secret";
  const BODY = JSON.stringify({ event_type: "subscription.activated" });
  const TS = "1700000000";

  it("accepts a valid signature", async () => {
    const header = await buildSigHeader(SECRET, TS, BODY);
    expect(await verifySignaturePure(BODY, header, SECRET)).toBe(true);
  });

  it("rejects a tampered body", async () => {
    const header = await buildSigHeader(SECRET, TS, BODY);
    const tampered = BODY + "x";
    expect(await verifySignaturePure(tampered, header, SECRET)).toBe(false);
  });

  it("rejects a wrong secret", async () => {
    const header = await buildSigHeader(SECRET, TS, BODY);
    expect(await verifySignaturePure(BODY, header, "wrong-secret")).toBe(false);
  });

  it("rejects when h1 is missing", async () => {
    expect(await verifySignaturePure(BODY, `ts=${TS}`, SECRET)).toBe(false);
  });

  it("rejects when ts is missing", async () => {
    const h1 = await signPayload(SECRET, TS, BODY);
    expect(await verifySignaturePure(BODY, `h1=${h1}`, SECRET)).toBe(false);
  });

  it("rejects empty secret", async () => {
    const header = await buildSigHeader(SECRET, TS, BODY);
    expect(await verifySignaturePure(BODY, header, "")).toBe(false);
  });

  it("rejects completely invalid header", async () => {
    expect(await verifySignaturePure(BODY, "not-a-valid-header", SECRET)).toBe(false);
  });
});

describe("planFromSubscription mapping", () => {
  // These rules mirror the webhook handler logic.
  function planFromStatus(
    status: string,
    priceId: string,
    yearlyPriceId: string
  ): string {
    if (status === "active") {
      return priceId === yearlyPriceId ? "yearly" : "monthly";
    }
    if (status === "trialing") {
      return priceId === yearlyPriceId ? "trial_yearly" : "trial";
    }
    if (status === "past_due") {
      return priceId === yearlyPriceId ? "yearly" : "monthly";
    }
    if (status === "canceled" || status === "paused") {
      return "canceling";
    }
    return "free";
  }

  const YEARLY_ID = "pri_yearly_test";
  const MONTHLY_ID = "pri_monthly_test";

  it("maps active yearly to yearly", () => {
    expect(planFromStatus("active", YEARLY_ID, YEARLY_ID)).toBe("yearly");
  });
  it("maps active monthly to monthly", () => {
    expect(planFromStatus("active", MONTHLY_ID, YEARLY_ID)).toBe("monthly");
  });
  it("maps trialing yearly to trial_yearly", () => {
    expect(planFromStatus("trialing", YEARLY_ID, YEARLY_ID)).toBe("trial_yearly");
  });
  it("maps trialing monthly to trial", () => {
    expect(planFromStatus("trialing", MONTHLY_ID, YEARLY_ID)).toBe("trial");
  });
  it("maps canceled to canceling", () => {
    expect(planFromStatus("canceled", MONTHLY_ID, YEARLY_ID)).toBe("canceling");
  });
  it("maps paused to canceling", () => {
    expect(planFromStatus("paused", MONTHLY_ID, YEARLY_ID)).toBe("canceling");
  });
  it("maps unknown status to free", () => {
    expect(planFromStatus("expired", MONTHLY_ID, YEARLY_ID)).toBe("free");
  });
});
