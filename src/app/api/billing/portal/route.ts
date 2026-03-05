import { NextResponse } from "next/server";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { getUserById } from "@/lib/db";

const PADDLE_API_KEY = process.env.PADDLE_API_KEY ?? "";
const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
const isSandbox = PADDLE_CLIENT_TOKEN.startsWith("test_");
const PADDLE_BASE = isSandbox ? "https://sandbox-api.paddle.com" : "https://api.paddle.com";

/** GET: return authenticated Paddle customer portal URL (and optional cancel URL) for the current user. */
export const GET = withErrorHandling("GET /api/billing/portal", async () => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const dbUser = await getUserById(user.userId);
  const customerId = dbUser?.stripe_customer_id ?? null;
  if (!customerId || !PADDLE_API_KEY) {
    return NextResponse.json(
      { error: "No billing account or portal not configured", portalUrl: null, cancelUrl: null },
      { status: 200 }
    );
  }

  try {
    // List subscriptions for this customer to get subscription IDs for deep links
    const subRes = await fetch(
      `${PADDLE_BASE}/subscriptions?customer_id=${encodeURIComponent(customerId)}&status=active`,
      {
        headers: {
          Authorization: `Bearer ${PADDLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    let subscriptionIds: string[] = [];
    if (subRes.ok) {
      const subData = (await subRes.json()) as { data?: { id: string }[] };
      subscriptionIds = (subData.data ?? []).map((s) => s.id).filter(Boolean);
    }

    const body: { subscription_ids?: string[] } = {};
    if (subscriptionIds.length > 0) body.subscription_ids = subscriptionIds;

    const portalRes = await fetch(`${PADDLE_BASE}/customers/${encodeURIComponent(customerId)}/portal-sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PADDLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!portalRes.ok) {
      const errText = await portalRes.text();
      console.error("Paddle portal-sessions error:", portalRes.status, errText);
      return NextResponse.json(
        { error: "Could not open billing portal", portalUrl: null, cancelUrl: null },
        { status: 502 }
      );
    }

    const portalData = (await portalRes.json()) as {
      data?: {
        urls?: {
          general?: { overview?: string };
          subscriptions?: { cancel_subscription?: string }[];
        };
      };
    };
    const urls = portalData.data?.urls;
    const portalUrl = urls?.general?.overview ?? null;
    const firstSub = urls?.subscriptions?.[0];
    const cancelUrl = firstSub?.cancel_subscription ?? null;

    return NextResponse.json({ portalUrl, cancelUrl });
  } catch (e) {
    console.error("Billing portal error:", e);
    return NextResponse.json(
      { error: "Failed to load billing portal", portalUrl: null, cancelUrl: null },
      { status: 500 }
    );
  }
});
