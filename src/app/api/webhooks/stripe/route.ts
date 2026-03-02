import { NextRequest, NextResponse } from "next/server";
import { updateUserPlan, getUserByStripeCustomerId } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-utils";

// Stripe is an optional dependency — degrade gracefully when not configured.
// We manually verify the webhook signature using the Web Crypto API so we
// don't need to bundle the full Stripe SDK on the server.

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

// Stripe timestamp tolerance: 5 minutes
const TOLERANCE_SECONDS = 300;

async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  if (!secret) return false;

  // sig header format: "t=<timestamp>,v1=<sig1>,v1=<sig2>,..."
  const parts: Record<string, string[]> = {};
  for (const part of sigHeader.split(",")) {
    const [k, v] = part.split("=", 2);
    if (!parts[k]) parts[k] = [];
    parts[k].push(v);
  }

  const timestamp = parts["t"]?.[0];
  const signatures = parts["v1"] ?? [];
  if (!timestamp || signatures.length === 0) return false;

  const ts = parseInt(timestamp, 10);
  if (Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SECONDS) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expected = Buffer.from(mac).toString("hex");

  return signatures.some((sig) => sig === expected);
}

// Map Stripe subscription status → our plan string
function planFromStatus(status: string): string {
  return ["active", "trialing"].includes(status) ? "pro" : "free";
}

export const POST = withErrorHandling("POST /api/webhooks/stripe", async (request: NextRequest) => {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const sig = request.headers.get("stripe-signature") ?? "";
  const body = await request.text();

  const valid = await verifyStripeSignature(body, sig, WEBHOOK_SECRET);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const obj = event.data.object;

  switch (event.type) {
    case "checkout.session.completed": {
      const metadata = obj["metadata"] as Record<string, string> | null;
      const userId = metadata?.["userId"];
      const customerId = obj["customer"] as string | undefined;
      if (userId && customerId) {
        await updateUserPlan(parseInt(userId, 10), "pro", customerId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const customerId = obj["customer"] as string | undefined;
      const status = obj["status"] as string | undefined;
      if (customerId && status) {
        const plan = planFromStatus(status);
        const user = await getUserByStripeCustomerId(customerId);
        if (user) await updateUserPlan(user.id, plan);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const customerId = obj["customer"] as string | undefined;
      if (customerId) {
        const user = await getUserByStripeCustomerId(customerId);
        if (user) await updateUserPlan(user.id, "free");
      }
      break;
    }

    // Ignore other event types
    default:
      break;
  }

  return NextResponse.json({ received: true });
});
