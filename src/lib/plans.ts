import { getAllPracticeProblems } from "@/lib/practice/problems";

// ─── Free tier limits ─────────────────────────────────────────────────────────

export const FREE_TUTORIAL_LIMIT = 5; // tutorials with order <= 5 are free

/** Number of interview practice problems free per language (same problem set, first N are free). */
export const FREE_PRACTICE_LIMIT = 15;

// ─── Plan helpers ─────────────────────────────────────────────────────────────

export type BillingPlan = "monthly" | "yearly";

/** Simple check for any paid access (used across UI and API routes). */
export function hasPaidAccess(plan?: string | null): boolean {
  return plan === "yearly" || plan === "pro";
}

// ─── Pricing + Paddle config (shared between client and server) ──────────────

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
    priceText: "$49.99/year",
    subLabel: "Save $70 vs monthly",
    badge: "Best value",
  },
  monthly: {
    label: "Monthly Pro",
    priceText: "$9.99/month",
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
