"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/auth/AuthModal";
import { buildAuthPageHref } from "@/lib/auth-redirect";
import { BILLING_CONFIG, MONTHLY_EQUIVALENT_CENTS, YEARLY_PRICE_CENTS, type BillingPlan } from "@/lib/plans";

interface UpgradeWallProps {
  /** Title of the locked item (tutorial name, problem name, etc.) */
  tutorialTitle?: string;
  /** Context-specific subtitle / message */
  subtitle?: string;
  /** Back link */
  backHref?: string;
  backLabel?: string;
  /** Optional blurred preview lines rendered behind the overlay */
  previewLines?: string[];
  /** Context drives the default blurred placeholder */
  context?: "tutorial" | "practice" | "certification";
}

// Decorative blurred placeholder lines shown behind the overlay.
// These are purely visual — they give the "peek behind the curtain" effect.
const PLACEHOLDERS: Record<string, string[]> = {
  tutorial: [
    "func fibonacci(n int) int {",
    "    if n <= 1 { return n }",
    "    return fibonacci(n-1) + fibonacci(n-2)",
    "}",
    "",
    "// Step 3: Understanding recursion",
    "// Every recursive call reduces the problem",
    "// Base cases prevent infinite loops",
    "func main() {",
    "    fmt.Println(fibonacci(10)) // 55",
    "}",
  ],
  practice: [
    "Given an integer array nums, return indices",
    "of the two numbers such that they add up to target.",
    "",
    "Example 1:",
    "  Input: nums = [2,7,11,15], target = 9",
    "  Output: [0,1]",
    "",
    "func twoSum(nums []int, target int) []int {",
    "    seen := make(map[int]int)",
    "    for i, n := range nums {",
    "        if j, ok := seen[target-n]; ok {",
    "            return []int{j, i}",
    "        }",
  ],
  certification: [
    "Question 12 of 20",
    "",
    "Which of the following correctly describes",
    "the time complexity of a binary search?",
    "",
    "○  O(n)     Linear — scans every element",
    "○  O(n²)    Quadratic — nested loops",
    "◉  O(log n) Logarithmic — halves search space ✓",
    "○  O(1)     Constant — direct access",
    "",
    "Progress: ████████████░░░░░░░░  60%",
  ],
};

function BlurredBackground({ lines }: { lines: string[] }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden px-8 pt-10 font-mono text-sm leading-7 text-zinc-700 dark:text-zinc-300"
      aria-hidden="true"
    >
      {lines.map((line, i) => (
        <div key={i} className={line === "" ? "h-4" : ""}>
          {line}
        </div>
      ))}
    </div>
  );
}

export default function UpgradeWall({
  tutorialTitle,
  subtitle,
  backHref = "/",
  backLabel = "← Back",
  previewLines,
  context = "tutorial",
}: UpgradeWallProps) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<"yearly" | "monthly">("yearly");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus the dialog on mount
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  // Escape key dismissal and focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dialogRef.current) return;
      if (e.key === "Escape") {
        window.history.back();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const lines = previewLines ?? PLACEHOLDERS[context];

  const title = tutorialTitle
    ? `${tutorialTitle} — Pro only`
    : context === "certification"
    ? "Certification Exams — Pro only"
    : context === "practice"
    ? "Unlock this problem"
    : "Pro tutorial";

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-wall-title"
        aria-describedby="upgrade-wall-desc"
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      >
        {/* Blurred content preview — the "peek behind the curtain" */}
        <div className="absolute inset-0 select-none">
          <BlurredBackground lines={lines} />
          {/* Gradient mask that fades the preview into the upgrade card */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/20 dark:from-zinc-950 dark:via-zinc-950/80 dark:to-zinc-950/20" />
          {/* Blur layer */}
          <div className="absolute inset-0 backdrop-blur-[2px]" />
        </div>

        {/* Upgrade card */}
        <div
          ref={dialogRef}
          tabIndex={-1}
          className="relative z-10 mx-4 mb-0 w-full max-w-md rounded-t-3xl bg-white p-7 shadow-2xl ring-1 ring-zinc-200/80 outline-none sm:mb-0 sm:rounded-3xl dark:bg-zinc-900 dark:ring-zinc-800"
        >

          {/* Lock icon */}
          <div className="mb-3 flex justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950">
              <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>

          <h2 id="upgrade-wall-title" className="mb-1.5 text-center text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <p id="upgrade-wall-desc" className="mb-5 text-center text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {subtitle ?? "Upgrade to unlock all tutorials, AI feedback, interview prep and verifiable certificates."}
          </p>

          {/* Plan toggle */}
          <div className="mb-4 grid grid-cols-2 gap-2.5">
            {(["yearly", "monthly"] as BillingPlan[]).map((plan) => {
              const cfg = BILLING_CONFIG[plan];
              const active = selected === plan;
              const displayPrice = plan === "yearly"
                ? `$${(MONTHLY_EQUIVALENT_CENTS / 100).toFixed(2)}/mo`
                : cfg.priceText;
              const displaySub = plan === "yearly"
                ? `$${(YEARLY_PRICE_CENTS / 100).toFixed(2)} billed yearly`
                : cfg.subLabel;
              return (
                <button
                  key={plan}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(plan)}
                  className={`relative flex flex-col rounded-2xl border-2 px-4 py-3 text-left transition-all ${
                    active
                      ? "border-indigo-500 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40"
                      : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
                  }`}
                >
                  {active && plan === "yearly" && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      BEST VALUE
                    </span>
                  )}
                  <span className={`text-xs font-semibold uppercase tracking-wide ${active ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"}`}>
                    {cfg.label}
                  </span>
                  <span className="mt-0.5 text-xl font-black text-zinc-900 dark:text-zinc-100">
                    {displayPrice}
                  </span>
                  <span className="text-[11px] text-zinc-400">{displaySub}</span>
                  {active && (
                    <span className="absolute right-2.5 top-2.5 text-indigo-500">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* CTA — different for guests vs free users */}
          {user ? (
            <Link
              href={`/pricing?plan=${selected}`}
              className="block w-full rounded-2xl bg-indigo-600 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-indigo-500/40"
            >
              {`Unlock Now — ${selected === "yearly" ? `$${(MONTHLY_EQUIVALENT_CENTS / 100).toFixed(2)}/mo` : BILLING_CONFIG[selected].priceText}`}
            </Link>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}
                className="block w-full rounded-2xl bg-indigo-600 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
              >
                Create free account →
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setAuthOpen(true); }}
                className="block w-full rounded-2xl border border-zinc-200 py-2.5 text-center text-sm text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Already have an account? Sign in
              </button>
            </div>
          )}

          {/* Back link */}
          <Link
            href={backHref}
            className="mt-3 block w-full rounded-2xl border border-zinc-100 py-2.5 text-center text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 dark:border-zinc-800 dark:hover:bg-zinc-800"
          >
            {backLabel}
          </Link>
        </div>
      </div>

      {authOpen && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthOpen(false)}
        />
      )}
    </>
  );
}
