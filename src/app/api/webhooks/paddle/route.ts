import { NextRequest, NextResponse } from "next/server";
import { updateUserPlan, getUserByPaddleCustomerId, getUserById, createNotification, recordSubscriptionEvent } from "@/lib/db";
import { BILLING_CONFIG, YEARLY_PRICE_CENTS, MONTHLY_PRICE_CENTS } from "@/lib/plans";

export const runtime = "nodejs";

const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET ?? "";

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

  try {
    const { createHmac } = await import("crypto");
    const expected = createHmac("sha256", secret)
      .update(`${ts}:${payload}`)
      .digest("hex");

    if (expected.length !== h1.length) return false;

    const { timingSafeEqual } = await import("crypto");
    return timingSafeEqual(
      Buffer.from(expected, "utf-8"),
      Buffer.from(h1, "utf-8")
    );
  } catch (err) {
    console.error("[paddle-webhook] Signature verification error:", err);
    return false;
  }
}

function planFromSubscription(status: string, priceId?: string): string {
  if (!["active", "trialing"].includes(status)) return "free";
  const yearlyPriceId = process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID;
  return yearlyPriceId && priceId === yearlyPriceId ? "yearly" : "pro";
}

export async function POST(request: NextRequest) {
  try {
    if (!WEBHOOK_SECRET) {
      console.error("[paddle-webhook] PADDLE_WEBHOOK_SECRET not set");
      return NextResponse.json({ error: "Paddle not configured" }, { status: 503 });
    }

    const sig = request.headers.get("Paddle-Signature") ?? "";
    const body = await request.text();

    console.log("[paddle-webhook] Received webhook, signature present:", !!sig);

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
      case "subscription.activated":
      case "subscription.created": {
        if (!paddleCustomerId) {
          console.error("[paddle-webhook] No customer_id in event");
          break;
        }

        let uid: number | null = null;
        const existingUser = await getUserByPaddleCustomerId(paddleCustomerId);
        if (existingUser) {
          uid = existingUser.id;
          console.log("[paddle-webhook] Found user by Paddle customer ID:", uid);
        } else {
          const clientUserId = customData?.["userId"];
          if (clientUserId) {
            const u = await getUserById(parseInt(clientUserId, 10));
            if (u) {
              uid = u.id;
              console.log("[paddle-webhook] Found user by custom_data userId:", uid);
            } else {
              console.error("[paddle-webhook] No user found for custom_data userId:", clientUserId);
            }
          } else {
            console.error("[paddle-webhook] No custom_data.userId and no existing Paddle customer");
          }
        }

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
          const user = await getUserByPaddleCustomerId(paddleCustomerId);
          if (user) {
            await updateUserPlan(user.id, plan);
            console.log("[paddle-webhook] Updated user", user.id, "plan to:", plan);
          }
        }
        break;
      }

      case "subscription.canceled": {
        if (paddleCustomerId) {
          const user = await getUserByPaddleCustomerId(paddleCustomerId);
          if (user) {
            await updateUserPlan(user.id, "free");
            await recordSubscriptionEvent(user.id, user.plan, 0, "canceled");
            console.log("[paddle-webhook] Canceled subscription for user:", user.id);
          }
        } else {
          const userId = customData?.["userId"];
          if (userId) {
            const user = await getUserById(parseInt(userId, 10));
            if (user) {
              await updateUserPlan(user.id, "free");
              await recordSubscriptionEvent(user.id, user.plan, 0, "canceled");
            }
          }
        }
        break;
      }

      default:
        console.log("[paddle-webhook] Unhandled event type:", event.event_type);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[paddle-webhook] Unhandled error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
