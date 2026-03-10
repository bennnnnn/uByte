/**
 * Paddle Webhook Handler — /api/webhooks/paddle
 *
 * ─── ENVIRONMENT VARIABLES REQUIRED ────────────────────────────────────────
 *
 * PADDLE_WEBHOOK_SECRET
 *   The secret key for this notification destination.
 *   Paddle dashboard → Developer Tools → Notifications → your destination → Secret key
 *   Sandbox secret starts with: pdl_ntfset_...
 *
 * PADDLE_API_KEY
 *   Used as a fallback to look up the customer's email when custom_data is missing.
 *   Paddle dashboard → Developer Tools → Authentication → API key
 *   Sandbox key starts with:  pdl_sdbx_apikey_...
 *   Live key starts with:     pdl_live_apikey_...
 *
 * NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
 *   Determines sandbox vs live mode automatically:
 *   - Starts with "test_" → uses sandbox-api.paddle.com
 *   - Starts with "live_" → uses api.paddle.com
 *
 * ─── GOING LIVE CHECKLIST ───────────────────────────────────────────────────
 *
 * 1. In Vercel env vars, replace all sandbox values with live values:
 *    - NEXT_PUBLIC_PADDLE_CLIENT_TOKEN  →  live_...
 *    - NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID  →  live price ID from Paddle catalog
 *    - NEXT_PUBLIC_PADDLE_PRO_PRICE_ID     →  live price ID from Paddle catalog
 *    - PADDLE_API_KEY                   →  pdl_live_apikey_...
 *    - PADDLE_WEBHOOK_SECRET            →  live notification secret
 *
 * 2. In Paddle live dashboard, create a notification destination pointing to:
 *    https://www.ubyte.dev/api/webhooks/paddle
 *    with these events enabled:
 *    - transaction.updated    ← primary plan activation trigger
 *    - transaction.completed  ← backup trigger
 *    - subscription.activated ← backup trigger
 *    - subscription.created   ← backup trigger
 *    - subscription.updated   ← handles plan changes (upgrade/downgrade)
 *    - subscription.canceled  ← downgrades user to free on cancellation
 *
 * 3. Redeploy on Vercel after updating env vars.
 *
 * ─── DATABASE NOTE ──────────────────────────────────────────────────────────
 *
 * The users table has a column named `stripe_customer_id` — this is a legacy
 * name from an earlier Stripe integration that was never used. It now stores
 * the Paddle customer ID (ctm_...). A future DB migration should rename it to
 * `paddle_customer_id`. The code handles this correctly despite the name.
 *
 * ─── HOW USER LOOKUP WORKS ──────────────────────────────────────────────────
 *
 * When a webhook arrives, we resolve the uByte user via 3 fallbacks in order:
 * 1. Paddle customer ID (ctm_...) already saved in users.stripe_customer_id
 * 2. custom_data.userId passed from the checkout widget at purchase time
 * 3. Fetch the customer's email from Paddle API, look up by email in DB
 *
 * Step 1 works for returning subscribers.
 * Step 2 works for first-time subscribers if Paddle passes custom_data.
 * Step 3 is the reliable fallback for new subscribers (requires PADDLE_API_KEY).
 */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import {
  updateUserPlan,
  cancelUserPlanGracefully,
  getUserByPaddleCustomerId,
  getUserById,
  getUserByEmail,
  createNotification,
  recordSubscriptionEvent,
  recordReferralSubscription,
} from "@/lib/db";
import { withErrorHandling } from "@/lib/api-utils";
import { BILLING_CONFIG, YEARLY_PRICE_CENTS, MONTHLY_PRICE_CENTS } from "@/lib/plans";

const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET ?? "";
const PADDLE_API_KEY = process.env.PADDLE_API_KEY ?? "";
const CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";

// Automatically switches between sandbox and live Paddle API based on client token prefix.
// No code change needed when going live — just update NEXT_PUBLIC_PADDLE_CLIENT_TOKEN.
const isSandbox = CLIENT_TOKEN.startsWith("test_");
const PADDLE_BASE = isSandbox ? "https://sandbox-api.paddle.com" : "https://api.paddle.com";

/**
 * Verifies the Paddle-Signature header using HMAC-SHA256.
 * Paddle signs webhooks as: HMAC_SHA256(secret, "ts:rawBody")
 * Rejects events older than 5 minutes to prevent replay attacks.
 */
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

  // Reject webhooks older than 5 minutes (replay attack prevention)
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
 * Fallback: fetch the customer's email from the Paddle API.
 * Used when custom_data.userId is missing from the webhook payload.
 * Requires PADDLE_API_KEY to be set.
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
 * Resolve the uByte user ID from a Paddle webhook event.
 * Three-step fallback — see file header comment for details.
 */
async function resolveUserId(
  paddleCustomerId: string | undefined,
  customData: Record<string, string> | null
): Promise<number | null> {
  // Step 1: Paddle customer ID already linked in users.stripe_customer_id
  if (paddleCustomerId) {
    const existing = await getUserByPaddleCustomerId(paddleCustomerId);
    if (existing) {
      console.log("[paddle-webhook] Resolved user by paddle customer ID:", existing.id);
      return existing.id;
    }
  }

  // Step 2: custom_data.userId passed from Paddle.Checkout.open({ customData })
  const clientUserId = customData?.["userId"];
  if (clientUserId) {
    const u = await getUserById(parseInt(clientUserId, 10));
    if (u) {
      console.log("[paddle-webhook] Resolved user by custom_data.userId:", u.id);
      return u.id;
    }
    console.error("[paddle-webhook] custom_data.userId not found in DB:", clientUserId);
  }

  // Step 3: Fetch email from Paddle API and match to uByte account by email
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

/**
 * Map a subscription status + price ID to a uByte plan string.
 * Used by subscription.updated to handle upgrades, downgrades, and pauses.
 */
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

  // IMPORTANT: read raw body before any parsing — signature is computed over the raw bytes
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

  // Determine which plan to activate based on the price ID in the transaction/subscription
  const yearlyPriceId = process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID;
  const items = data["items"] as { price?: { id?: string } }[] | undefined;
  const purchasedPriceId = items?.[0]?.price?.id;
  const activatedPlan = yearlyPriceId && purchasedPriceId === yearlyPriceId ? "yearly" : "pro";

  switch (event.event_type) {
    /**
     * PRIMARY ACTIVATION TRIGGER
     * transaction.updated fires when a transaction transitions to "completed".
     * This is the event Paddle actually sends in practice — more reliable than
     * transaction.completed for triggering plan activation.
     * transaction.completed is also handled as a backup.
     *
     * NOTE: This event fires for ALL transaction updates (pending, billed, etc.)
     * so we check status === "completed" before activating.
     */
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
        await recordReferralSubscription(uid).catch((err) =>
          console.error("[paddle-webhook] recordReferralSubscription failed:", err)
        );
      } else {
        console.error("[paddle-webhook] transaction completed — could not resolve user");
      }
      break;
    }

    /**
     * BACKUP ACTIVATION TRIGGER
     * subscription.activated / subscription.created fire after the subscription
     * is set up. custom_data may be absent here (it's attached to the transaction),
     * but resolveUserId will fall back to the Paddle API email lookup.
     * Also sends the user an in-app notification.
     */
    case "subscription.activated":
    case "subscription.created": {
      const uid = await resolveUserId(paddleCustomerId, customData);
      if (uid) {
        await updateUserPlan(uid, activatedPlan, paddleCustomerId);
        console.log("[paddle-webhook] subscription — updated user", uid, "to plan:", activatedPlan);
        const planLabel = activatedPlan === "yearly" ? BILLING_CONFIG.yearly.label : BILLING_CONFIG.monthly.label;
        await createNotification(
          uid,
          "plan",
          `You're now on ${planLabel}!`,
          "All tutorials and features are now unlocked. Enjoy!"
        );
        const amountCents = activatedPlan === "yearly" ? YEARLY_PRICE_CENTS : MONTHLY_PRICE_CENTS;
        await recordSubscriptionEvent(uid, activatedPlan, amountCents, "activated");
        await recordReferralSubscription(uid).catch((err) =>
          console.error("[paddle-webhook] recordReferralSubscription failed:", err)
        );
      }
      break;
    }

    /**
     * PLAN CHANGES
     * Fires when a subscription is upgraded, downgraded, paused, or resumed.
     * planFromSubscription() maps status + priceId → "yearly" | "pro" | "free"
     *
     * FUTURE: if you add more plans (e.g. team, enterprise), update
     * planFromSubscription() and BILLING_CONFIG in src/lib/plans.ts.
     */
    case "subscription.updated": {
      if (paddleCustomerId && status) {
        const plan = planFromSubscription(status, purchasedPriceId);
        const uid = await resolveUserId(paddleCustomerId, customData);
        if (uid) {
          await updateUserPlan(uid, plan);
          console.log("[paddle-webhook] subscription updated — user", uid, "plan:", plan);
        }
      }
      break;
    }

    /**
     * CANCELLATION
     * Fires when a user requests cancellation. We do NOT immediately downgrade.
     * Instead we mark the plan as "canceling" with the period-end date so the
     * user keeps full Pro access until their paid period expires.
     *
     * hasPaidAccess("canceling") returns true (see src/lib/plans.ts).
     * A daily cron (src/app/api/cron/cleanup) calls downgradeExpiredCancelingUsers()
     * which flips plan → "free" once subscription_expires_at < NOW().
     *
     * Paddle sends current_billing_period.ends_at with this event.
     */
    case "subscription.canceled": {
      const uid = await resolveUserId(paddleCustomerId, customData);
      if (uid) {
        const user = await getUserById(uid);
        const periodEnd = (event.data as Record<string, unknown>)
          ?.current_billing_period as { ends_at?: string } | undefined;
        const expiresAt = periodEnd?.ends_at;

        if (expiresAt) {
          await cancelUserPlanGracefully(uid, expiresAt);
          console.log("[paddle-webhook] subscription canceled — user", uid, "access until", expiresAt);
        } else {
          // Fallback: no period info — downgrade immediately
          await updateUserPlan(uid, "free");
          console.log("[paddle-webhook] subscription canceled (no period end) — user", uid, "downgraded to free");
        }
        if (user) await recordSubscriptionEvent(uid, user.plan, 0, "canceled");
      }
      break;
    }

    default:
      console.log("[paddle-webhook] Unhandled event type:", event.event_type);
      break;
  }

  // Always return 200 so Paddle doesn't keep retrying
  return NextResponse.json({ received: true });
});
