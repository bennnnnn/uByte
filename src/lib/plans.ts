export const FREE_TUTORIAL_LIMIT = 5; // tutorials with order <= 5 are free

export function hasPaidAccess(plan?: string | null): boolean {
  return plan === "early_bird" || plan === "pro";
}
