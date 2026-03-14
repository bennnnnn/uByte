"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";

const GOALS = [
  {
    id: "get-job",
    icon: "🎯",
    title: "Get a job in tech",
    desc: "Land my first dev role or switch into software engineering",
    color: "border-violet-200 hover:border-violet-400 dark:border-violet-800 dark:hover:border-violet-500",
    selectedColor: "border-violet-500 bg-violet-50 dark:border-violet-400 dark:bg-violet-950/30",
    path: "/practice/go",
  },
  {
    id: "ace-interviews",
    icon: "🏆",
    title: "Ace technical interviews",
    desc: "Sharpen algorithms, data structures, and coding problem skills",
    color: "border-amber-200 hover:border-amber-400 dark:border-amber-800 dark:hover:border-amber-500",
    selectedColor: "border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-950/30",
    path: "/practice/go",
  },
  {
    id: "learn-language",
    icon: "📖",
    title: "Learn a new language",
    desc: "Pick up Go, Python, JavaScript, Rust, Java, or C++ from scratch",
    color: "border-indigo-200 hover:border-indigo-400 dark:border-indigo-800 dark:hover:border-indigo-500",
    selectedColor: "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/30",
    path: "/tutorial/go/getting-started",
  },
  {
    id: "level-up",
    icon: "⬆️",
    title: "Level up at work",
    desc: "Improve code quality, learn new patterns, earn certifications",
    color: "border-emerald-200 hover:border-emerald-400 dark:border-emerald-800 dark:hover:border-emerald-500",
    selectedColor: "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30",
    path: "/certifications",
  },
] as const;

type GoalId = (typeof GOALS)[number]["id"];

function OnboardingInner() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? null;

  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<GoalId | null>(null);
  const [saving, setSaving] = useState(false);
  const [referralData, setReferralData] = useState<{ code: string; shareUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // If user already completed onboarding, skip to destination
  useEffect(() => {
    if (profile?.onboarding_goal) {
      router.replace(nextPath ?? "/");
    }
  }, [profile, nextPath, router]);

  // Fetch referral data for step 2
  useEffect(() => {
    if (step === 2 && user) {
      apiFetch("/api/referral").then(async (r) => {
        if (r.ok) {
          const d = await r.json();
          setReferralData(d);
        }
      }).catch(() => {});
    }
  }, [step, user]);

  const handleContinue = useCallback(async () => {
    if (!selected || saving) return;
    setSaving(true);
    try {
      await apiFetch("/api/onboarding/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: selected }),
      });
    } catch {
      // Non-fatal — continue anyway
    } finally {
      setSaving(false);
    }
    setStep(2);
  }, [selected, saving]);

  const handleFinish = useCallback(() => {
    const goal = GOALS.find((g) => g.id === selected);
    router.replace(nextPath ?? goal?.path ?? "/");
  }, [selected, nextPath, router]);

  async function copyLink() {
    if (!referralData) return;
    await navigator.clipboard.writeText(referralData.shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const firstName = user?.name?.split(" ")[0] ?? "there";

  useEffect(() => {
    if (!user && !loading) {
      router.replace("/login?next=/onboarding");
    }
  }, [user, loading, router]);

  if (!user) return null;

  return (
    <div className="flex min-h-[100svh] flex-col bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
        <Link href="/" className="text-lg font-black tracking-tight text-indigo-600 dark:text-indigo-400">
          uByte
        </Link>
        <span className="text-xs font-medium text-zinc-400">
          Step {step} of 2
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full bg-indigo-500 transition-all duration-500"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>

      <div className="flex flex-1 items-start justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-xl">
          {step === 1 ? (
            <>
              <h1 className="mb-2 text-2xl font-black text-zinc-900 sm:text-3xl dark:text-white">
                Welcome, {firstName}! 🎉
              </h1>
              <p className="mb-8 text-zinc-500 dark:text-zinc-400">
                What&apos;s your main goal? We&apos;ll personalize your experience.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelected(g.id)}
                    className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                      selected === g.id ? g.selectedColor : g.color + " bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <span className="mt-0.5 text-2xl">{g.icon}</span>
                    <div>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{g.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{g.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleContinue}
                disabled={!selected || saving}
                className="mt-8 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
              >
                {saving ? "Saving…" : "Continue →"}
              </button>
            </>
          ) : (
            <>
              <h1 className="mb-2 text-2xl font-black text-zinc-900 sm:text-3xl dark:text-white">
                Invite your friends 🎁
              </h1>
              <p className="mb-6 text-zinc-500 dark:text-zinc-400">
                Refer a friend who subscribes to Pro and you both win — you get{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">30 days of Pro free</span>.
              </p>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Your referral link
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-lg bg-white px-3 py-2 text-sm font-mono text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">
                    {referralData?.shareUrl ?? "Loading…"}
                  </code>
                  <button
                    type="button"
                    onClick={copyLink}
                    disabled={!referralData}
                    className="shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                </div>

                {referralData && (
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just joined uByte to level up my coding skills 🚀 — interactive tutorials, interview prep, and AI hints. Try it: ${referralData.shareUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.905-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on X
                  </a>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
                >
                  Start learning →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingInner />
    </Suspense>
  );
}
