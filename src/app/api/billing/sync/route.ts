/**
 * GET /api/billing/sync
 *
 * Pulls the current subscription state directly from Paddle and syncs it to
 * the local DB. Called from the plan tab when the user returns from the
 * Paddle portal, so cancellations and plan changes are reflected immediately
 * without waiting for the webhook to fire.
 *
 * Returns { plan, expiresAt } so the client can update its UI optimistically.
 */
import { NextResponse } from "next/server";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { getUserById, cancelUserPlanGracefully, updateUserPlan, setTrialExpiry } from "@/lib/db";

const PADDLE_API_KEY = process.env.PADDLE_API_KEY ?? "";
const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
const isSandbox = PADDLE_CLIENT_TOKEN.startsWith("test_");
const PADDLE_BASE = isSandbox ? "https://sandbox-api.paddle.com" : "https://api.paddle.com";

type PaddleSub = {
  id: string;
  status: string;
  scheduled_change?: { action: string; effective_at: string } | null;
  current_billing_period?: { ends_at: string } | null;
  items?: { price?: { id?: string } }[];
};

export const GET = withErrorHandling("GET /api/billing/sync", async () => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  if (!PADDLE_API_KEY) {
    return NextResponse.json({ synced: false, reason: "not_configured" });
  }

  const dbUser = await getUserById(user.userId);
  const customerId = dbUser?.paddle_customer_id ?? null;
  if (!customerId) {
    return NextResponse.json({ synced: false, reason: "no_customer" });
  }

  // Fetch all subscriptions for this customer from Paddle
  const subRes = await fetch(
    `${PADDLE_BASE}/subscriptions?customer_id=${encodeURIComponent(customerId)}`,
    { headers: { Authorization: `Bearer ${PADDLE_API_KEY}` } }
  );
  if (!subRes.ok) {
    return NextResponse.json({ synced: false, reason: "paddle_error" });
  }

  const subData = (await subRes.json()) as { data?: PaddleSub[] };
  const subs = subData.data ?? [];

  // Find the most relevant subscription: active or trialing first, then others
  const active = subs.find((s) => ["active", "trialing"].includes(s.status));
  const latest = active ?? subs[0];

  if (!latest) {
    // No subscriptions at all — downgrade to free if still showing as paid/trial
    const paidPlans = ["pro", "yearly", "canceling", "trial", "trial_yearly"];
    if (paidPlans.includes(dbUser?.plan ?? "")) {
      await updateUserPlan(user.userId, "free");
    }
    return NextResponse.json({ synced: true, plan: "free" });
  }

  const yearlyPriceId = process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID;
  const priceId = latest.items?.[0]?.price?.id;

  // Check if a cancellation is scheduled (user cancelled but period hasn't ended)
  const isCancelScheduled =
    latest.scheduled_change?.action === "cancel" ||
    latest.status === "canceled";

  if (isCancelScheduled) {
    const expiresAt =
      latest.scheduled_change?.effective_at ??
      latest.current_billing_period?.ends_at ??
      null;

    if (expiresAt && dbUser?.plan !== "canceling") {
      await cancelUserPlanGracefully(user.userId, expiresAt);
      return NextResponse.json({ synced: true, plan: "canceling", expiresAt });
    }
    return NextResponse.json({ synced: true, plan: dbUser?.plan ?? "canceling" });
  }

  // Active subscription — ensure plan is correct in DB
  if (latest.status === "active") {
    const correctPlan = yearlyPriceId && priceId === yearlyPriceId ? "yearly" : "pro";
    if (dbUser?.plan !== correctPlan) {
      await updateUserPlan(user.userId, correctPlan, customerId);
    }
    return NextResponse.json({ synced: true, plan: correctPlan });
  }

  // Trialing — map to "trial" / "trial_yearly" and refresh the expiry date
  if (latest.status === "trialing") {
    const correctPlan = yearlyPriceId && priceId === yearlyPriceId ? "trial_yearly" : "trial";
    if (dbUser?.plan !== correctPlan) {
      await updateUserPlan(user.userId, correctPlan, customerId);
    }
    const trialEndsAt = latest.current_billing_period?.ends_at ?? null;
    if (trialEndsAt) {
      await setTrialExpiry(user.userId, trialEndsAt);
    }
    return NextResponse.json({ synced: true, plan: correctPlan, expiresAt: trialEndsAt });
  }

  // past_due — payment failed but subscription not yet cancelled; preserve access
  if (latest.status === "past_due") {
    console.log("[billing-sync] past_due subscription — preserving current plan for user", user.userId);
    return NextResponse.json({ synced: true, plan: dbUser?.plan ?? "pro" });
  }

  // paused — Paddle-paused subscription; preserve access until explicitly cancelled
  if (latest.status === "paused") {
    console.log("[billing-sync] paused subscription — preserving current plan for user", user.userId);
    return NextResponse.json({ synced: true, plan: dbUser?.plan ?? "pro" });
  }

  return NextResponse.json({ synced: true, plan: dbUser?.plan ?? "free" });
});
