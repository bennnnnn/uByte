"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import type { SupportedLanguage } from "@/lib/languages/types";
import { LANG_ICONS } from "@/lib/languages/icons";
import { LANGUAGES } from "@/lib/languages/registry";

interface Props {
  totalLessons: number;
  problemCount: number;
  certCount: number;
  /** Set server-side; avoids flash before client auth resolves */
  isLoggedInServer: boolean;
  /** Last activity link + label from the server */
  leftOff: { href: string; label: string } | null;
  continueLang: SupportedLanguage;
  continueTutorials: { slug: string; title: string }[];
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function xpLevel(xp: number): { level: number; label: string; nextXp: number } {
  const thresholds = [0, 100, 300, 700, 1500, 3000, 6000, 12000, 25000, 50000];
  const labels = ["Beginner", "Learner", "Coder", "Builder", "Developer",
                  "Engineer", "Architect", "Expert", "Master", "Legend"];
  let level = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) { level = i; break; }
  }
  return {
    level: level + 1,
    label: labels[level] ?? "Legend",
    nextXp: thresholds[level + 1] ?? thresholds[thresholds.length - 1],
  };
}

// ─── Logged-in hero ───────────────────────────────────────────────────────────

interface LoggedInHeroProps {
  name: string;
  leftOff: { href: string; label: string } | null;
  continueLang: SupportedLanguage;
  xp: number;
  streak: number;
  totalStepsCompleted: number;
  plan: string;
}

function LoggedInHero({
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
  const isPro = plan === "pro";

  return (
    <section className="border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">

        {/* Top row: greeting + plan badge */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              {greeting}, {firstName} 👋
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
              {leftOff
                ? "Pick up where you left off"
                : "Ready to level up today?"}
            </h1>
          </div>
          {isPro && (
            <span className="shrink-0 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              PRO
            </span>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ── Left: continue card ── */}
          <div className="lg:col-span-2">
            {leftOff ? (
              <div className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-zinc-950">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-2xl">{langIcon}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                    {langName} tutorial
                  </span>
                </div>
                <p className="mt-1 text-base font-semibold text-zinc-800 line-clamp-2 dark:text-zinc-200">
                  {leftOff.label}
                </p>
                <Link
                  href={leftOff.href}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
                >
                  Continue →
                </Link>
                {/* decorative gradient blob */}
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
                  href="/tutorials"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
                >
                  Browse tutorials →
                </Link>
              </div>
            )}

            {/* Secondary actions */}
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/certifications"
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
              >
                🎓 Take a free exam
              </Link>
              <Link
                href="/practice"
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
              >
                🧩 Practice problems
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
              >
                🏆 Leaderboard
              </Link>
            </div>
          </div>

          {/* ── Right: stats panel ── */}
          <div className="flex flex-col gap-4">

            {/* XP + level */}
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
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
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

            {/* Streak */}
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
                <p className="mt-2 text-xs font-semibold text-orange-500">You&apos;re on fire! 🔥 Keep it going.</p>
              )}
            </div>

            {/* Lessons completed */}
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

// ─── Guest hero ───────────────────────────────────────────────────────────────

function GuestHero({
  totalLessons,
  problemCount,
  certCount,
}: {
  totalLessons: number;
  problemCount: number;
  certCount: number;
}) {
  return (
    <section className="border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">

      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-24">

        <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-800">
          🎓 Certifications are completely free — no credit card, no subscription
        </p>

        <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl lg:text-[3.5rem] lg:leading-tight dark:text-zinc-100">
          Learn to code.{" "}
          <span className="text-indigo-600 dark:text-indigo-400">Get certified for free.</span>
          <br className="hidden sm:block" />
          Actually get hired.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
          Write and run real code in your browser — no setup, no installs.
          Learn step by step, sharpen your skills with real interview problems,
          then{" "}
          <strong className="font-semibold text-zinc-700 dark:text-zinc-300">
            take a free timed exam and earn a certificate you can actually share.
          </strong>
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
          >
            Start for free →
          </Link>
          <Link
            href="/certifications"
            className="rounded-xl border border-zinc-200 bg-white px-8 py-3.5 text-base font-bold text-zinc-700 transition-all hover:border-indigo-200 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            See certifications
          </Link>
        </div>

        <p className="mt-4 text-xs text-zinc-400">
          Free forever · No credit card required · Certification exams are free
        </p>

        <div className="mt-12 grid grid-cols-2 gap-4 border-t border-zinc-100 pt-10 sm:grid-cols-4 dark:border-zinc-800">
          {[
            { value: "9",                  label: "Languages",           sub: "Go, Python, TypeScript, SQL & more" },
            { value: `${totalLessons}+`,   label: "Lessons",             sub: "Step-by-step, run in your browser" },
            { value: `${problemCount}+`,   label: "Interview problems",  sub: "LeetCode-style with test cases" },
            { value: `${certCount}`,       label: "Free certifications", sub: "Timed exams, shareable certificate" },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{stat.value}</p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{stat.label}</p>
              <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: "💻",
                title: "Code runs in your browser",
                desc: "No IDE, no terminal, no installs. Open the page and start coding in seconds.",
              },
              {
                icon: "🧩",
                title: "Learn → Practice → Certify",
                desc: "Tutorials build the knowledge. Practice problems sharpen it. Certifications prove it.",
              },
              {
                icon: "🎓",
                title: "Real certificates, zero cost",
                desc: "Unlike Codecademy and Coursera — our exams and certificates are 100% free, always.",
              },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3 rounded-xl p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-lg shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-800 dark:ring-zinc-700">
                  {item.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function HomeHero({
  totalLessons,
  problemCount,
  certCount,
  isLoggedInServer,
  leftOff,
  continueLang,
  continueTutorials: _continueTutorials,
}: Props) {
  const { user, profile, stepCountByLang } = useAuth();

  const name = (user as { name?: string } | null)?.name ?? "";
  // Use server hint to avoid a layout flash before client auth resolves
  const isLoggedIn = (user != null || isLoggedInServer) && !!name;

  const xp                  = profile?.xp ?? 0;
  const streak              = profile?.streak_days ?? 0;
  const plan                = profile?.plan ?? "free";
  const totalStepsCompleted = Object.values(stepCountByLang ?? {}).reduce((s, v) => s + v, 0);

  if (isLoggedIn) {
    return (
      <LoggedInHero
        name={name}
        leftOff={leftOff}
        continueLang={continueLang}
        xp={xp}
        streak={streak}
        totalStepsCompleted={totalStepsCompleted}
        plan={plan}
      />
    );
  }

  return (
    <GuestHero
      totalLessons={totalLessons}
      problemCount={problemCount}
      certCount={certCount}
    />
  );
}
