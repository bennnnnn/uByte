"use client";

/**
 * Floating onboarding checklist — shown in the bottom-right corner for new users.
 * Automatically hides when all 3 steps are done or the user dismisses it.
 * Dismissed state is stored in localStorage so it survives page refreshes.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

const DISMISSED_KEY = "ubyte_onboarding_dismissed";

interface Status {
  show: boolean;
  completedTutorialStep: boolean;
  solvedPracticeProblem: boolean;
  attemptedCert: boolean;
}

function CheckCircle({ done }: { done: boolean }) {
  return done ? (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
      </svg>
    </span>
  ) : (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-zinc-300 dark:border-zinc-600" />
  );
}

export default function OnboardingChecklist() {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);
  const [open, setOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(DISMISSED_KEY) === "1") {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (!user || loading || dismissed) return;
    fetch("/api/onboarding-status")
      .then((r) => r.json())
      .then((j: Status) => setStatus(j))
      .catch(() => {});
  }, [user, loading, dismissed]);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

  if (!user || loading || dismissed || !status?.show) return null;

  const steps = [
    {
      label: "Complete your first tutorial step",
      done: status.completedTutorialStep,
      href: "/tutorial/go",
    },
    {
      label: "Solve a practice problem",
      done: status.solvedPracticeProblem,
      href: "/practice",
    },
    {
      label: "Attempt a certification exam",
      done: status.attemptedCert,
      href: "/certifications",
    },
  ];
  const completedCount = steps.filter((s) => s.done).length;

  return (
    <div className="fixed bottom-6 right-6 z-40 w-72 rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-left"
        >
          <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Get started
          </span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            {completedCount}/{steps.length}
          </span>
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md p-1 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-200"
          aria-label="Dismiss"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      {/* Steps */}
      {open && (
        <ul className="px-4 py-3 space-y-3">
          {steps.map((step) => (
            <li key={step.label}>
              <Link
                href={step.href}
                className={`flex items-center gap-3 rounded-xl p-2 text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                  step.done ? "text-zinc-400 line-through dark:text-zinc-600" : "text-zinc-800 dark:text-zinc-200"
                }`}
              >
                <CheckCircle done={step.done} />
                {step.label}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Progress bar */}
      {open && (
        <div className="px-4 pb-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
