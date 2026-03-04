import { getAllPracticeProblems } from "@/lib/practice/problems";

export const FREE_TUTORIAL_LIMIT = 5; // tutorials with order <= 5 are free

/** Number of interview practice problems free per language (same problem set, first N are free). */
export const FREE_PRACTICE_LIMIT = 15;

export function hasPaidAccess(plan?: string | null): boolean {
  return plan === "yearly" || plan === "pro";
}

/** True if this practice problem is in the free tier (first FREE_PRACTICE_LIMIT by list order). */
export function isPracticeProblemFree(slug: string): boolean {
  const problems = getAllPracticeProblems();
  const idx = problems.findIndex((p) => p.slug === slug);
  return idx >= 0 && idx < FREE_PRACTICE_LIMIT;
}
