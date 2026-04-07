"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";

// ─── Goal definitions ──────────────────────────────────────────────────────

const GOALS = [
  {
    id: "learn-language",
    icon: "📖",
    title: "Learn a new language",
    desc: "Step-by-step tutorials from zero to confident",
    badge: "Most popular",
    gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
    ring: "ring-indigo-200 hover:ring-indigo-400",
    selectedRing: "ring-2 ring-indigo-500 bg-indigo-50/80",
    iconBg: "bg-indigo-100",
    needsLang: true,
    getLangPath: (lang: string) => `/tutorial/${lang}/getting-started`,
    pathSteps: (langName: string) => [
      `Start with ${langName} fundamentals`,
      "Build skills through interactive exercises",
      "Earn your certification",
    ],
  },
  {
    id: "ace-interviews",
    icon: "🏆",
    title: "Ace technical interviews",
    desc: "Practice real problems from top companies",
    badge: null,
    gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    ring: "ring-amber-200 hover:ring-amber-400",
    selectedRing: "ring-2 ring-amber-500 bg-amber-50/80",
    iconBg: "bg-amber-100",
    needsLang: true,
    getLangPath: (lang: string) => `/practice/${lang}`,
    pathSteps: (langName: string) => [
      `Solve ${langName} interview problems`,
      "Get AI-powered feedback on your code",
      "Simulate real interview conditions",
    ],
  },
  {
    id: "get-job",
    icon: "🎯",
    title: "Get a job in tech",
    desc: "From learning to landing your first dev role",
    badge: null,
    gradient: "from-violet-500/10 via-violet-500/5 to-transparent",
    ring: "ring-violet-200 hover:ring-violet-400",
    selectedRing: "ring-2 ring-violet-500 bg-violet-50/80",
    iconBg: "bg-violet-100",
    needsLang: true,
    getLangPath: (lang: string) => `/practice/${lang}`,
    pathSteps: (langName: string) => [
      `Master ${langName} fundamentals`,
      "Solve interview-style problems",
      "Get certified and build your resume",
    ],
  },
  {
    id: "level-up",
    icon: "⚡",
    title: "Level up at work",
    desc: "Sharpen skills and earn certifications",
    badge: null,
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    ring: "ring-emerald-200 hover:ring-emerald-400",
    selectedRing: "ring-2 ring-emerald-500 bg-emerald-50/80",
    iconBg: "bg-emerald-100",
    needsLang: false,
    getLangPath: () => "/certifications",
    pathSteps: () => [
      "Take certification exams across 9 languages",
      "Share verified badges on LinkedIn",
      "Track your growth with XP and streaks",
    ],
  },
] as const;

const LANGUAGES = [
  { id: "python",     icon: "🐍", name: "Python",     popular: true },
  { id: "javascript", icon: "🟨", name: "JavaScript", popular: true },
  { id: "go",         icon: "🐹", name: "Go",         popular: true },
  { id: "typescript", icon: "🔷", name: "TypeScript", popular: false },
  { id: "java",       icon: "☕", name: "Java",       popular: false },
  { id: "rust",       icon: "🦀", name: "Rust",       popular: false },
  { id: "cpp",        icon: "⚙️",  name: "C++",       popular: false },
  { id: "csharp",     icon: "💜", name: "C#",         popular: false },
] as const;

type GoalId = (typeof GOALS)[number]["id"];
type LangId = (typeof LANGUAGES)[number]["id"];

// ─── Confetti ──────────────────────────────────────────────────────────────

function fireConfetti() {
  if (typeof window === "undefined") return;
  import("canvas-confetti").then((mod) => {
    const fire = mod.default;
    fire({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#4f46e5", "#8b5cf6", "#06b6d4", "#f59e0b"] });
    setTimeout(() => fire({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } }), 200);
    setTimeout(() => fire({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } }), 350);
  }).catch(() => {});
}

// ─── Component ─────────────────────────────────────────────────────────────

function OnboardingInner() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? null;

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGoal, setSelectedGoal] = useState<GoalId | null>(null);
  const [selectedLang, setSelectedLang] = useState<LangId | null>(null);
  const [saving, setSaving] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const goal = GOALS.find((g) => g.id === selectedGoal);
  const needsLang = goal?.needsLang ?? false;
  const canContinue = selectedGoal !== null && (!needsLang || selectedLang !== null);
  const langConfig = LANGUAGES.find((l) => l.id === selectedLang);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  // Already onboarded — skip
  useEffect(() => {
    if (profile?.onboarding_goal) router.replace(nextPath ?? "/");
  }, [profile, nextPath, router]);

  // Animate language picker
  useEffect(() => {
    if (needsLang) {
      const t = setTimeout(() => setShowLangPicker(true), 150);
      return () => clearTimeout(t);
    }
    setShowLangPicker(false);
  }, [needsLang]);

  // Confetti on step 2
  useEffect(() => { if (step === 2) fireConfetti(); }, [step]);

  // Auth guard
  useEffect(() => {
    if (!user && !loading) router.replace("/login?next=/onboarding");
  }, [user, loading, router]);

  const handleContinue = useCallback(async () => {
    if (!canContinue || saving) return;
    setSaving(true);
    try {
      await apiFetch("/api/onboarding/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: selectedGoal,
          ...(selectedLang ? { lang: selectedLang } : {}),
        }),
      });
    } catch { /* non-fatal */ }
    setSaving(false);
    setStep(2);
  }, [canContinue, saving, selectedGoal, selectedLang]);

  const handleStart = useCallback(() => {
    if (!goal) { router.replace(nextPath ?? "/"); return; }
    router.replace(nextPath ?? goal.getLangPath(selectedLang ?? "go"));
  }, [goal, selectedLang, nextPath, router]);

  if (!user) return null;

  return (
    <div className="flex min-h-[100svh] flex-col bg-white">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">U</span>
          <span className="text-base font-bold tracking-tight text-zinc-900">uByte</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-zinc-400">{step} of 2</span>
          <div className="flex gap-1">
            <div className={`h-1.5 w-8 rounded-full transition-colors duration-500 ${step >= 1 ? "bg-indigo-500" : "bg-zinc-200"}`} />
            <div className={`h-1.5 w-8 rounded-full transition-colors duration-500 ${step >= 2 ? "bg-indigo-500" : "bg-zinc-200"}`} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 items-start justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-xl">

          {step === 1 ? (
            /* ── STEP 1: Goal + Language ── */
            <div>
              <p className="mb-1 text-sm font-semibold text-indigo-600">Welcome, {firstName} 👋</p>
              <h1 className="mb-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                What brings you here?
              </h1>
              <p className="mb-8 text-base text-zinc-500">Pick your goal — we&apos;ll build your path.</p>

              {/* Goal cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {GOALS.map((g) => {
                  const isSelected = selectedGoal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => { setSelectedGoal(g.id); if (!g.needsLang) setSelectedLang(null); }}
                      className={`group relative flex items-start gap-3.5 rounded-2xl border bg-white p-5 text-left ring-1 transition-all duration-200 ${
                        isSelected
                          ? `${g.selectedRing} shadow-md scale-[1.02]`
                          : `${g.ring} ring-transparent border-zinc-200 hover:shadow-sm hover:scale-[1.01]`
                      }`}
                    >
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${g.gradient} pointer-events-none transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                      <div className={`relative z-10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${g.iconBg} text-xl transition-transform ${isSelected ? "scale-110" : ""}`}>
                        {g.icon}
                      </div>
                      <div className="relative z-10 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-zinc-900">{g.title}</p>
                          {g.badge && (
                            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">{g.badge}</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{g.desc}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Language picker */}
              {needsLang && (
                <div className={`mt-8 overflow-hidden transition-all duration-300 ${showLangPicker ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="mb-3 text-sm font-bold text-zinc-800">Which language do you want to start with?</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {LANGUAGES.map((l) => {
                      const isLangSelected = selectedLang === l.id;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => setSelectedLang(l.id)}
                          className={`relative flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                            isLangSelected
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-500"
                              : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                          }`}
                        >
                          <span className="text-base">{l.icon}</span>
                          {l.name}
                          {l.popular && !isLangSelected && (
                            <span className="ml-auto rounded bg-zinc-100 px-1 py-0.5 text-[9px] font-bold text-zinc-500">HOT</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                type="button"
                onClick={handleContinue}
                disabled={!canContinue || saving}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none"
              >
                {saving ? (
                  <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Setting up…</>
                ) : "Continue →"}
              </button>
              <p className="mt-4 text-center text-xs text-zinc-400">You can change this anytime in settings.</p>
            </div>
          ) : (
            /* ── STEP 2: Your path is ready ── */
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 shadow-lg shadow-indigo-100">
                <span className="text-4xl">🚀</span>
              </div>

              <h1 className="mb-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                You&apos;re all set, {firstName}!
              </h1>
              <p className="mb-8 text-base text-zinc-500">Here&apos;s your personalized path to get started.</p>

              {/* Path card */}
              <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-left shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  {goal && (
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${goal.iconBg} text-lg`}>{goal.icon}</div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-zinc-800">{goal?.title}</p>
                    {langConfig && <p className="text-xs text-zinc-500">{langConfig.icon} {langConfig.name}</p>}
                  </div>
                </div>
                <div className="space-y-3">
                  {(goal?.pathSteps(langConfig?.name ?? "Go") ?? []).map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">{i + 1}</div>
                      <p className="pt-0.5 text-sm text-zinc-700">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="mx-auto mt-6 flex max-w-md items-center justify-around rounded-xl border border-zinc-100 bg-white px-4 py-3">
                {[{ value: "9", label: "Languages" }, { value: "300+", label: "Lessons" }, { value: "Free", label: "Certifications" }].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-lg font-black text-zinc-900">{s.value}</p>
                    <p className="text-[11px] text-zinc-500">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={handleStart}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl"
              >
                Let&apos;s go →
              </button>

              <p className="mt-6 text-xs text-zinc-400">
                Know someone who&apos;d love this?{" "}
                <Link href="/referral" className="font-semibold text-indigo-600 hover:text-indigo-700">Invite a friend</Link>
                {" "}and earn free Pro time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[100svh] items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-600" />
      </div>
    }>
      <OnboardingInner />
    </Suspense>
  );
}
