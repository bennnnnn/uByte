"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";

const LANGUAGES = [
  { id: "python", icon: "🐍", name: "Python", badge: "Popular" },
  { id: "javascript", icon: "🟨", name: "JavaScript", badge: "Popular" },
  { id: "go", icon: "🐹", name: "Go", badge: "Popular" },
  { id: "typescript", icon: "🔷", name: "TypeScript", badge: null },
  { id: "java", icon: "☕", name: "Java", badge: null },
  { id: "rust", icon: "🦀", name: "Rust", badge: null },
  { id: "cpp", icon: "⚙️", name: "C++", badge: null },
  { id: "csharp", icon: "💜", name: "C#", badge: null },
  { id: "sql", icon: "🗄️", name: "SQL", badge: null },
] as const;

type LangId = (typeof LANGUAGES)[number]["id"];

export default function OnboardingPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? null;
  const [selectedLangOverride, setSelectedLangOverride] = useState<LangId | null>(null);
  const [saving, setSaving] = useState(false);
  const selectedLang = selectedLangOverride ?? (profile?.onboarding_lang as LangId | null) ?? "python";

  useEffect(() => {
    if (!user && !loading) router.replace("/login?next=/onboarding");
  }, [user, loading, router]);

  useEffect(() => {
    if (profile?.onboarding_goal === "learn-language" && nextPath == null) {
      router.replace(`/tutorial/${profile.onboarding_lang ?? "python"}/getting-started`);
    }
  }, [nextPath, profile?.onboarding_goal, profile?.onboarding_lang, router]);

  const firstName = useMemo(() => user?.name?.split(" ")[0] ?? "there", [user?.name]);

  async function handleContinue() {
    if (saving) return;
    setSaving(true);
    try {
      await apiFetch("/api/onboarding/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: "learn-language", lang: selectedLang }),
      });
    } catch {
      // Non-fatal. The tutorial redirect below still gives the user a working path.
    } finally {
      setSaving(false);
    }

    const destination = nextPath ?? `/tutorial/${selectedLang}/getting-started`;
    router.replace(destination);
  }

  if (!user) return null;

  return (
    <div className="flex min-h-[100svh] flex-col bg-white dark:bg-zinc-950">
      <div className="flex flex-1 items-start justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-3xl">
          <p className="mb-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">Welcome, {firstName} 👋</p>
          <h1 className="mb-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
            Pick the language you want to learn first.
          </h1>
          <p className="mb-8 max-w-2xl text-base text-zinc-500 dark:text-zinc-400">
            We&apos;ll drop you straight into the tutorial track so you can start writing code immediately.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LANGUAGES.map((lang) => {
              const selected = selectedLang === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setSelectedLangOverride(lang.id)}
                  className={`relative rounded-2xl border p-5 text-left transition-all ${
                    selected
                      ? "border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500 dark:border-indigo-400 dark:bg-indigo-950/40 dark:ring-indigo-400"
                      : "border-zinc-200 bg-white hover:border-indigo-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-600"
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-2xl dark:bg-zinc-800">
                      {lang.icon}
                    </span>
                    {lang.badge && (
                      <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        {lang.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{lang.name}</p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Start with the getting started track</p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleContinue}
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 disabled:opacity-60"
            >
              {saving ? "Starting…" : `Start ${LANGUAGES.find((lang) => lang.id === selectedLang)?.name} →`}
            </button>
            <Link
              href="/tutorial"
              className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Browse all tutorials instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
