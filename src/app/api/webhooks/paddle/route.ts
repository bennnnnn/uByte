import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import {
  updateUserPlan,
  getUserByPaddleCustomerId,
  getUserById,
  getUserByEmail,
  createNotification,
  recordSubscriptionEvent,
} from "@/lib/db";
import { withErrorHandling } from "@/lib/api-utils";
import { BILLING_CONFIG, YEARLY_PRICE_CENTS, MONTHLY_PRICE_CENTS } from "@/lib/plans";

const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET ?? "";
const PADDLE_API_KEY = process.env.PADDLE_API_KEY ?? "";
const CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
const isSandbox = CLIENT_TOKEN.startsWith("test_");
const PADDLE_BASE = isSandbox ? "https://sandbox-api.paddle.com" : "https://api.paddle.com";

async function verifyPaddleSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  if (!secret) {
    console.error("[paddle-webhook] PADDLE_WEBHOOK_SECRET is empty");
    return false;
  }

  const parts: Record<string, string> = {};
  for (const part of sigHeader.split(";")) {
    const [k, v] = part.split("=", 2);
    if (k && v) parts[k] = v;
  }

  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) {
    console.error("[paddle-webhook] Missing ts or h1 in signature header");
    return false;
  }

  const TOLERANCE_SECONDS = 300;
  if (Math.abs(Date.now() / 1000 - parseInt(ts, 10)) > TOLERANCE_SECONDS) {
    console.error("[paddle-webhook] Timestamp outside tolerance window");
    return false;
  }

  const signed = `${ts}:${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
  const expected = Buffer.from(mac).toString("hex");

  if (expected.length !== h1.length) return false;
  return timingSafeEqual(Buffer.from(expected, "utf-8"), Buffer.from(h1, "utf-8"));
}

/**
 * Fetch the customer's email from the Paddle API.
 * Used as a fallback when custom_data.userId is missing from the webhook.
 */
async function getPaddleCustomerEmail(customerId: string): Promise<string | null> {
  if (!PADDLE_API_KEY) return null;
  try {
    const res = await fetch(`${PADDLE_BASE}/customers/${encodeURIComponent(customerId)}`, {
      headers: { Authorization: `Bearer ${PADDLE_API_KEY}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: { email?: string } };
    return data.data?.email ?? null;
  } catch (err) {
    console.error("[paddle-webhook] Failed to fetch customer email:", err);
    return null;
  }
}

/**
 * Resolve the uByte user ID from a Paddle webhook event using a 3-step fallback:
 * 1. Paddle customer ID already linked in DB
 * 2. custom_data.userId passed from the checkout
 * 3. Fetch the customer's email from Paddle API and look up by email
 */
async function resolveUserId(
  paddleCustomerId: string | undefined,
  customData: Record<string, string> | null
): Promise<number | null> {
  // 1. Already linked by Paddle customer ID
  if (paddleCustomerId) {
    const existing = await getUserByPaddleCustomerId(paddleCustomerId);
    if (existing) {
      console.log("[paddle-webhook] Resolved user by paddle customer ID:", existing.id);
      return existing.id;
    }
  }

  // 2. Custom data userId passed from checkout widget
  const clientUserId = customData?.["userId"];
  if (clientUserId) {
    const u = await getUserById(parseInt(clientUserId, 10));
    if (u) {
      console.log("[paddle-webhook] Resolved user by custom_data.userId:", u.id);
      return u.id;
    }
    console.error("[paddle-webhook] custom_data.userId not found in DB:", clientUserId);
  }

  // 3. Fetch customer email from Paddle API and look up by email
  if (paddleCustomerId) {
    const email = await getPaddleCustomerEmail(paddleCustomerId);
    if (email) {
      const u = await getUserByEmail(email);
      if (u) {
        console.log("[paddle-webhook] Resolved user by Paddle customer email:", u.id, email);
        return u.id;
      }
      console.error("[paddle-webhook] No uByte user found for Paddle customer email:", email);
    }
  }

  console.error("[paddle-webhook] Could not resolve user. customerId:", paddleCustomerId, "customData:", JSON.stringify(customData));
  return null;
}

function planFromSubscription(status: string, priceId?: string): string {
  if (!["active", "trialing"].includes(status)) return "free";
  const yearlyPriceId = process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID;
  return yearlyPriceId && priceId === yearlyPriceId ? "yearly" : "pro";
}

export const POST = withErrorHandling("POST /api/webhooks/paddle", async (request: NextRequest) => {
  if (!WEBHOOK_SECRET) {
    console.error("[paddle-webhook] PADDLE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Paddle not configured" }, { status: 503 });
  }

  const sig = request.headers.get("Paddle-Signature") ?? "";
  const body = await request.text();

  const valid = await verifyPaddleSignature(body, sig, WEBHOOK_SECRET);
  if (!valid) {
    console.error("[paddle-webhook] Signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event_type: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[paddle-webhook] Event type:", event.event_type);

  const data = event.data;
  const customData = data["custom_data"] as Record<string, string> | null;
  const paddleCustomerId = data["customer_id"] as string | undefined;
  const status = data["status"] as string | undefined;

  console.log("[paddle-webhook] customer_id:", paddleCustomerId, "custom_data:", JSON.stringify(customData));

  const yearlyPriceId = process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID;
  const items = data["items"] as { price?: { id?: string } }[] | undefined;
  const purchasedPriceId = items?.[0]?.price?.id;
  const activatedPlan =
    yearlyPriceId && purchasedPriceId === yearlyPriceId ? "yearly" : "pro";

  switch (event.event_type) {
    // Handle both transaction.completed and transaction.updated (when status=completed).
    // Paddle sends transaction.updated when a transaction transitions to completed status.
    case "transaction.completed":
    case "transaction.updated": {
      if (status !== "completed") {
        console.log("[paddle-webhook] Skipping transaction event with status:", status);
        break;
      }
      console.log("[paddle-webhook] transaction completed data:", JSON.stringify({ 
        status, paddleCustomerId, customData, purchasedPriceId 
      }));
      const uid = await resolveUserId(paddleCustomerId, customData);
      if (uid) {
        await updateUserPlan(uid, activatedPlan, paddleCustomerId);
        console.log("[paddle-webhook] transaction completed — updated user", uid, "to plan:", activatedPlan);
        const amountCents = activatedPlan === "yearly" ? YEARLY_PRICE_CENTS : MONTHLY_PRICE_CENTS;
        await recordSubscriptionEvent(uid, activatedPlan, amountCents, "activated");
      } else {
        console.error("[paddle-webhook] transaction completed — could not resolve user");
      }
      break;
    }

    case "subscription.activated":
    case "subscription.created": {
      const uid = await resolveUserId(paddleCustomerId, customData);
      if (uid) {
        await updateUserPlan(uid, activatedPlan, paddleCustomerId);
        console.log("[paddle-webhook] Updated user", uid, "to plan:", activatedPlan);
        const planLabel = activatedPlan === "yearly" ? BILLING_CONFIG.yearly.label : BILLING_CONFIG.monthly.label;
        await createNotification(
          uid,
          "plan",
          `You're now on ${planLabel}!`,
          "All tutorials and features are now unlocked. Enjoy!"
        );
        const amountCents = activatedPlan === "yearly" ? YEARLY_PRICE_CENTS : MONTHLY_PRICE_CENTS;
        await recordSubscriptionEvent(uid, activatedPlan, amountCents, "activated");
      }
      break;
    }

    case "subscription.updated": {
      if (paddleCustomerId && status) {
        const plan = planFromSubscription(status, purchasedPriceId);
        const uid = await resolveUserId(paddleCustomerId, customData);
        if (uid) {
          await updateUserPlan(uid, plan);
          console.log("[paddle-webhook] Updated user", uid, "plan to:", plan);
        }
      }
      break;
    }

    case "subscription.canceled": {
      const uid = await resolveUserId(paddleCustomerId, customData);
      if (uid) {
        const user = await getUserById(uid);
        await updateUserPlan(uid, "free");
        if (user) await recordSubscriptionEvent(uid, user.plan, 0, "canceled");
        console.log("[paddle-webhook] Canceled subscription for user:", uid);
      }
      break;
    }

    default:
      console.log("[paddle-webhook] Unhandled event type:", event.event_type);
      break;
  }

  return NextResponse.json({ received: true });
});
