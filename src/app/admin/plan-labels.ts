/**
 * Human-readable labels for `users.plan` values (see src/lib/plans.ts).
 *
 * - monthly / yearly: active Pro subscriptions billed through Paddle.
 * - pro: legacy or manual grants (e.g. referral rewards); same product access as paid Pro.
 * - canceling: user cancelled; still has Pro access until subscription_expires_at.
 * - trial / trial_yearly: Paddle trial (if present in DB).
 */

export const ADMIN_PLAN_HELP = `How plans work: Free = no subscription. Pro (monthly) and Pro (yearly) are live Paddle subscriptions. Pro (legacy) is a manual or referral grant with the same access. Canceling means the user cancelled but still has access until the billing period ends.`;

export function formatAdminPlanLabel(plan: string | null | undefined): string {
  const p = (plan ?? "free").toLowerCase();
  switch (p) {
    case "free":
      return "Free";
    case "monthly":
      return "Pro · monthly";
    case "yearly":
      return "Pro · yearly";
    case "pro":
      return "Pro · legacy";
    case "canceling":
      return "Pro · canceling";
    case "trial":
      return "Pro · trial";
    case "trial_yearly":
      return "Pro · trial (yearly)";
    default:
      return p;
  }
}

/** Short label for compact badges (table row). */
export function formatAdminPlanShort(plan: string | null | undefined): string {
  const p = (plan ?? "free").toLowerCase();
  if (p === "monthly") return "monthly";
  if (p === "yearly") return "yearly";
  if (p === "pro") return "legacy";
  if (p === "canceling") return "canceling";
  if (p === "trial" || p === "trial_yearly") return "trial";
  return p;
}

/** Plan filter chips (value = DB column). */
export const ADMIN_PLAN_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All plans" },
  { value: "free", label: "Free" },
  { value: "monthly", label: "Pro · monthly" },
  { value: "yearly", label: "Pro · yearly" },
  { value: "pro", label: "Pro · legacy" },
  { value: "canceling", label: "Pro · canceling" },
];

/** Options for admin "set plan" (manual overrides). */
export const ADMIN_SET_PLAN_OPTIONS: { value: string; label: string; hint: string }[] = [
  { value: "free", label: "Free", hint: "No paid access" },
  { value: "monthly", label: "Pro (monthly)", hint: "Matches monthly Paddle price" },
  { value: "yearly", label: "Pro (yearly)", hint: "Matches yearly Paddle price" },
  { value: "pro", label: "Pro (legacy grant)", hint: "Referrals, comps, testing — same features" },
];
