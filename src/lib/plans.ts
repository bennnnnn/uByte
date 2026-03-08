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
 * The plan is stored in users.plan as a string: "free" | "pro" | "yearly" | "monthly"
 * The Paddle customer ID is stored in users.stripe_customer_id (legacy column name).
 * A future DB migration should rename it to users.paddle_customer_id.
 */
import { DAILY_DRIP, MAX_FREE_PROBLEMS } from "@/lib/db/practice-unlocks";

// ─── Free tier limits ─────────────────────────────────────────────────────────

export const FREE_TUTORIAL_LIMIT = 5; // tutorials with order <= 5 are free

/**
 * @deprecated Use drip-based access via `tryUnlockProblem` instead.
 * Kept for backward compatibility in non-critical display code.
 */
export const FREE_PRACTICE_LIMIT = MAX_FREE_PROBLEMS;

// Re-export drip constants so UI code can import from one place
export { DAILY_DRIP, MAX_FREE_PROBLEMS };

// ─── Plan helpers ─────────────────────────────────────────────────────────────

export type BillingPlan = "monthly" | "yearly";

/** Simple check for any paid access (used across UI and API routes). */
export function hasPaidAccess(plan?: string | null): boolean {
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

// ─── Practice helpers ────────────────────────────────────────────────────────

/**
 * @deprecated Use drip-based gating. This is only kept for the practice list
 * client display when no user context is available.
 */
export function isPracticeProblemFree(_slug: string): boolean {
  return false;
}
