import Link from "next/link";
import type { SupportedLanguage } from "@/lib/languages/types";
import { LANG_ICONS } from "@/lib/languages/icons";
import { LANGUAGES } from "@/lib/languages/registry";
import { getTimeGreeting, xpLevel } from "./hero-helpers";

export interface LoggedInHeroProps {
  name: string;
  leftOff: { href: string; label: string } | null;
  continueLang: SupportedLanguage;
  xp: number;
  streak: number;
  totalStepsCompleted: number;
  plan: string;
}

export default function LoggedInHero({
  name,
  leftOff,
  continueLang,
  xp,
  streak,
  totalStepsCompleted,
  plan,
}: LoggedInHeroProps) {
  const firstName = name.split(" ")[0];
  const greeting = getTimeGreeting();
  const { level, label, nextXp } = xpLevel(xp);
  const xpPct = Math.min(100, Math.round((xp / nextXp) * 100));
  const langIcon = LANG_ICONS[continueLang] ?? "📝";
  const langName = LANGUAGES[continueLang]?.name ?? continueLang;

  return (
    <section className="border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950" aria-labelledby="logged-in-hero-heading">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              {greeting}, {firstName} 👋
            </p>
            <h1 id="logged-in-hero-heading" className="mt-1 text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
              {leftOff ? "Pick up where you left off" : "Ready to level up today?"}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {leftOff ? (
              <div className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-zinc-950">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-2xl">{langIcon}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                    {langName} tutorial
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  {leftOff.label}
                </p>
                <Link
                  href={leftOff.href}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
                >
                  Continue →
                </Link>
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-200/40 blur-2xl dark:bg-indigo-700/20" />
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  You haven&apos;t started a tutorial yet.
                </p>
                <p className="mt-1 text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  Pick a language and start your first lesson — it only takes a few minutes.
                </p>
                <Link
                  href="/tutorial"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
                >
                  Browse tutorials →
                </Link>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/tutorial"
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
              >
                📚 Browse tutorials
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
              >
                📈 View dashboard
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Your level</p>
                  <p className="mt-0.5 text-lg font-black text-zinc-900 dark:text-zinc-100">
                    Lv {level} — {label}
                  </p>
                </div>
                <span className="text-2xl">⚡</span>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
                  <span>{xp.toLocaleString()} XP</span>
                  <span>{nextXp.toLocaleString()} XP</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                    style={{ width: `${xpPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Streak</p>
                  <p className="mt-0.5 text-3xl font-black text-zinc-900 dark:text-zinc-100">
                    {streak}
                    <span className="ml-1 text-base font-semibold text-zinc-500 dark:text-zinc-400">days</span>
                  </p>
                </div>
                <span className="text-3xl">{streak >= 7 ? "🔥" : streak > 0 ? "✨" : "💤"}</span>
              </div>
              {streak === 0 && (
                <p className="mt-2 text-xs text-zinc-400">Complete a lesson today to start your streak.</p>
              )}
              {streak > 0 && streak < 7 && (
                <p className="mt-2 text-xs text-zinc-400">Keep going — {7 - streak} days to a week streak!</p>
              )}
              {streak >= 7 && (
                <p className="mt-2 text-xs font-semibold text-amber-500">You&apos;re on fire! 🔥 Keep it going.</p>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Lessons done</p>
                  <p className="mt-0.5 text-3xl font-black text-zinc-900 dark:text-zinc-100">
                    {totalStepsCompleted}
                  </p>
                </div>
                <span className="text-2xl">📚</span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">steps completed across all languages</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
