/**
 * Plans, pricing, and Paddle configuration
 *
 * ─── GOING LIVE CHECKLIST ───────────────────────────────────────────────────
 *
 * 1. Update MONTHLY_PRICE_CENTS and YEARLY_PRICE_CENTS if your live prices differ.
 *
 * 2. In Vercel, set these to your LIVE Paddle values:
 *    - NEXT_PUBLIC_PADDLE_CLIENT_TOKEN     →  live_...
 *    - NEXT_PUBLIC_PADDLE_PRO_PRICE_ID     →  pri_... (live monthly price)
 *    - NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID  →  pri_... (live yearly price)
 *    - PADDLE_API_KEY                      →  pdl_live_apikey_...
 *    - PADDLE_WEBHOOK_SECRET               →  live notification secret
 *
 * 3. Create matching products/prices in your Paddle live dashboard.
 *
 * ─── ADDING NEW PLANS ───────────────────────────────────────────────────────
 *
 * To add a new plan (e.g. "team"):
 * 1. Add it to hasPaidAccess() below
 * 2. Add a new entry to BILLING_CONFIG
 * 3. Add the price ID env var
 * 4. Update planFromSubscription() in the webhook handler
 * 5. Update the pricing page (src/app/pricing/page.tsx)
 *
 * ─── DATABASE NOTE ──────────────────────────────────────────────────────────
 *
 * The plan is stored in users.plan as a string (see formatAdminPlanLabel in src/app/admin/plan-labels.ts):
 *   "free" | "monthly" | "yearly" (Paddle) | "pro" (legacy/referral) | "canceling" | optional "trial"*
 * The Paddle customer ID is stored in users.paddle_customer_id.
 */

// ─── Plan helpers ─────────────────────────────────────────────────────────────

export type BillingPlan = "monthly" | "yearly";

/**
 * Returns true for any plan that grants paid feature access.
 * "canceling" — user has cancelled but is still within their billing period.
 */
export function hasPaidAccess(plan?: string | null): boolean {
  return (
    plan === "yearly" ||
    plan === "pro" ||
    plan === "monthly" ||
    plan === "canceling"
  );
}

/**
 * Returns true for users actively paying via Paddle (not free, trial, or canceling).
 * Used to hide the referral "Earn 30 free days" offer — showing it to active
 * subscribers could incentivise them to cancel to redeem the reward.
 */
export function isActiveSubscriber(plan?: string | null): boolean {
  return plan === "yearly" || plan === "pro" || plan === "monthly";
}

// ─── Pricing + Paddle config (shared between client and server) ──────────────

export const MONTHLY_PRICE_CENTS = 999;
export const YEARLY_PRICE_CENTS = 4999;
export const MONTHLY_EQUIVALENT_CENTS = Math.round(YEARLY_PRICE_CENTS / 12);
export const YEARLY_IF_MONTHLY_CENTS = MONTHLY_PRICE_CENTS * 12;
export const YEARLY_SAVINGS_CENTS = YEARLY_IF_MONTHLY_CENTS - YEARLY_PRICE_CENTS;
export const YEARLY_DISCOUNT_PERCENT = Math.round(
  ((YEARLY_IF_MONTHLY_CENTS - YEARLY_PRICE_CENTS) / YEARLY_IF_MONTHLY_CENTS) * 100
);

function formatUsd(cents: number): string {
  return "$" + (cents / 100).toFixed(2);
}

/** Display + Paddle configuration for each billing option. */
export const BILLING_CONFIG: Record<
  BillingPlan,
  {
    label: string;
    priceText: string;
    subLabel: string;
    badge?: string;
  }
> = {
  yearly: {
    label: "Yearly Pro",
    priceText: `${formatUsd(YEARLY_PRICE_CENTS)}/year`,
    subLabel: `Save ${formatUsd(YEARLY_SAVINGS_CENTS)} vs monthly`,
    badge: "Best value",
  },
  monthly: {
    label: "Monthly Pro",
    priceText: `${formatUsd(MONTHLY_PRICE_CENTS)}/month`,
    subLabel: "Cancel anytime",
  },
};

/** Public Paddle price IDs (safe to use on client and server). */
export const YEARLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID ?? "";
export const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID ?? "";

