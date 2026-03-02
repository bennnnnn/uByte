import { NextRequest, NextResponse } from "next/server";
import { updateUserPlan, getUserByPaddleCustomerId, getUserById, createNotification, recordSubscriptionEvent } from "@/lib/db";

const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET ?? "";

async function verifyPaddleSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  if (!secret) return false;

  // Paddle-Signature format: "ts=<epoch>;h1=<sha256-hmac-hex>"
  const parts: Record<string, string> = {};
  for (const part of sigHeader.split(";")) {
    const [k, v] = part.split("=", 2);
    if (k && v) parts[k] = v;
  }

  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

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

  return expected === h1;
}

function planFromStatus(status: string): string {
  return ["active", "trialing"].includes(status) ? "pro" : "free";
}

export async function POST(request: NextRequest) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Paddle not configured" }, { status: 503 });
  }

  const sig = request.headers.get("Paddle-Signature") ?? "";
  const body = await request.text();

  const valid = await verifyPaddleSignature(body, sig, WEBHOOK_SECRET);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event_type: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = event.data;
  const customData = data["custom_data"] as Record<string, string> | null;
  const paddleCustomerId = data["customer_id"] as string | undefined;
  const status = data["status"] as string | undefined;

  const yearlyPriceId = process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID;
  const items = data["items"] as { price?: { id?: string } }[] | undefined;
  const purchasedPriceId = items?.[0]?.price?.id;
  const activatedPlan =
    yearlyPriceId && purchasedPriceId === yearlyPriceId ? "yearly" : "pro";

  switch (event.event_type) {
    case "subscription.activated": {
      const userId = customData?.["userId"];
      if (userId && paddleCustomerId) {
        const uid = parseInt(userId, 10);
        await updateUserPlan(uid, activatedPlan, paddleCustomerId);
        const planLabel = activatedPlan === "yearly" ? "Yearly Pro" : "Monthly Pro";
        await createNotification(uid, "plan", `You're now on ${planLabel}!`, "All tutorials and features are now unlocked. Enjoy!");
        const amountCents = activatedPlan === "yearly" ? 4999 : 999;
        await recordSubscriptionEvent(uid, activatedPlan, amountCents, "activated");
      }
      break;
    }

    case "subscription.updated": {
      if (paddleCustomerId && status) {
        const plan = planFromStatus(status);
        const user = await getUserByPaddleCustomerId(paddleCustomerId);
        if (user) await updateUserPlan(user.id, plan);
      }
      break;
    }

    case "subscription.canceled": {
      if (paddleCustomerId) {
        const user = await getUserByPaddleCustomerId(paddleCustomerId);
        if (user) {
          await updateUserPlan(user.id, "free");
          await recordSubscriptionEvent(user.id, user.plan, 0, "canceled");
        }
      } else {
        // Fall back to userId in custom_data
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
      break;
  }

  return NextResponse.json({ received: true });
}
