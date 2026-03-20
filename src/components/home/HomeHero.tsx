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
                🎓 Get certified
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

// Language badges shown as a floating visual in the hero
const LANG_BADGES = [
  { icon: "🐹", label: "Go",         color: "bg-cyan-50    ring-cyan-100    dark:bg-cyan-950/40  dark:ring-cyan-800/50"   },
  { icon: "🐍", label: "Python",     color: "bg-blue-50    ring-blue-100    dark:bg-blue-950/40  dark:ring-blue-800/50"   },
  { icon: "🟨", label: "JavaScript", color: "bg-yellow-50  ring-yellow-100  dark:bg-yellow-950/40 dark:ring-yellow-800/50" },
  { icon: "🔷", label: "TypeScript", color: "bg-indigo-50  ring-indigo-100  dark:bg-indigo-950/40 dark:ring-indigo-800/50" },
  { icon: "☕", label: "Java",       color: "bg-orange-50  ring-orange-100  dark:bg-orange-950/40 dark:ring-orange-800/50" },
  { icon: "🦀", label: "Rust",       color: "bg-red-50     ring-red-100     dark:bg-red-950/40   dark:ring-red-800/50"    },
  { icon: "⚙️", label: "C++",        color: "bg-slate-50   ring-slate-100   dark:bg-slate-800/60 dark:ring-slate-700/50"  },
  { icon: "💜", label: "C#",         color: "bg-violet-50  ring-violet-100  dark:bg-violet-950/40 dark:ring-violet-800/50"},
  { icon: "🗄️", label: "SQL",        color: "bg-emerald-50 ring-emerald-100 dark:bg-emerald-950/40 dark:ring-emerald-800/50"},
];

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
    <section className="relative overflow-hidden border-b border-zinc-100 dark:border-zinc-800">

      {/* ── Background: subtle dot-grid + soft radial gradient ── */}
      <div
        className="absolute inset-0 bg-white dark:bg-zinc-950"
        style={{
          backgroundImage:
            "radial-gradient(circle at 60% 0%, rgba(99,102,241,0.06) 0%, transparent 60%), " +
            "radial-gradient(circle at 10% 90%, rgba(139,92,246,0.05) 0%, transparent 50%)",
        }}
      />
      {/* dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #c7d2fe 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Main content ── */}
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6 sm:pt-20 lg:pt-24">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-16">

          {/* Left: copy */}
          <div className="flex-1 text-center lg:text-left">

            {/* Badge */}
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-800/60">
              🎓 Free certifications — no subscription required
            </p>

            {/* Headline */}
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15] dark:text-white">
              Learn to code.{" "}
              <span
                className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400"
              >
                Get certified.
              </span>
              <br />
              Actually get hired.
            </h1>

            {/* Sub-headline */}
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-zinc-500 lg:mx-0 dark:text-zinc-400">
              Step-by-step tutorials, real interview problems, and{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                free certifications
              </span>{" "}
              — all running live in your browser. Zero setup.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="/signup"
                className="rounded-xl bg-indigo-600 px-7 py-3 text-base font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Start learning free →
              </Link>
              <Link
                href="/certifications"
                className="rounded-xl border border-zinc-200 bg-white px-7 py-3 text-base font-bold text-zinc-700 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
              >
                See certifications
              </Link>
            </div>

            <p className="mt-4 text-xs text-zinc-400">
              Get certified for free · Shareable credential · No subscription
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-zinc-100 pt-8 sm:grid-cols-4 dark:border-zinc-800">
              {[
                { value: "9",                  label: "Languages"          },
                { value: `${totalLessons}+`,   label: "Lessons"            },
                { value: `${problemCount}+`,   label: "Interview problems" },
                { value: `${certCount}`,       label: "Free certs"         },
              ].map(stat => (
                <div key={stat.label} className="text-center lg:text-left">
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: language badge cloud */}
          <div className="hidden shrink-0 lg:block" aria-hidden="true">
            <div className="relative h-72 w-64">
              {LANG_BADGES.map((b, i) => {
                // Arrange badges in a loose grid (3 cols × 3 rows)
                const col = i % 3;
                const row = Math.floor(i / 3);
                const left = col * 80 + (row % 2 === 1 ? 38 : 0);
                const top  = row * 86;
                return (
                  <div
                    key={b.label}
                    className={`absolute flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm ring-1 transition-transform hover:-translate-y-0.5 dark:text-zinc-200 ${b.color}`}
                    style={{ left, top }}
                  >
                    <span className="text-base leading-none">{b.icon}</span>
                    {b.label}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ── Value strip ── */}
      <div className="relative border-t border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 divide-y divide-zinc-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-zinc-800">
            {[
              { icon: "💻", title: "Runs in your browser",     desc: "No installs. Start coding in seconds." },
              { icon: "🧩", title: "Learn → Practice → Certify", desc: "A clear path from beginner to certified." },
              { icon: "🎓", title: "Free certifications",       desc: "Learn, prove your skills, and get a shareable certificate — at no cost." },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-3 px-4 py-3 sm:px-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-lg shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
                  {item.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{item.title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</p>
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
