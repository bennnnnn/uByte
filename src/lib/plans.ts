import { getAllPracticeProblems } from "@/lib/practice/problems";

// ─── Free tier limits ─────────────────────────────────────────────────────────

export const FREE_TUTORIAL_LIMIT = 5; // tutorials with order <= 5 are free

/** Number of interview prep problems free per language (same problem set, first N are free). */
export const FREE_PRACTICE_LIMIT = 15;

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

/** True if this practice problem is in the free tier (first FREE_PRACTICE_LIMIT by list order). */
export function isPracticeProblemFree(slug: string): boolean {
  const problems = getAllPracticeProblems();
  const idx = problems.findIndex((p) => p.slug === slug);
  return idx >= 0 && idx < FREE_PRACTICE_LIMIT;
}
