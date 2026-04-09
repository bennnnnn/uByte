"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import type { SupportedLanguage } from "@/lib/languages/types";
import { LANG_ICONS } from "@/lib/languages/icons";
import { LANGUAGES } from "@/lib/languages/registry";
import HeroIDEDeferred from "./HeroIDEDeferred";
import { hasPaidAccess } from "@/lib/plans";

interface Props {
  totalLessons: number;
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
  const isPro = hasPaidAccess(plan);

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
                  href="/tutorial"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
                >
                  Browse tutorials →
                </Link>
              </div>
            )}

            {/* Secondary actions */}
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
                <p className="mt-2 text-xs font-semibold text-amber-500">You&apos;re on fire! 🔥 Keep it going.</p>
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

// ─── Mobile code preview (static, below-fold visual on phones) ───────────────

function MobileCodePreview() {
  return (
    <div className="relative mx-4 mt-10 max-w-sm sm:mx-auto lg:hidden">
      {/* Success badge */}
      <div className="absolute -right-2 -top-3 z-10 flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-md dark:border-emerald-800/60 dark:bg-zinc-900 dark:text-emerald-400">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[9px] dark:bg-emerald-900/50">✓</span>
        Step passed! +10 XP
      </div>
      {/* Streak badge */}
      <div className="absolute -bottom-3 -left-2 z-10 flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-md dark:border-amber-800/60 dark:bg-zinc-900 dark:text-amber-400">
        <span className="text-sm">🔥</span>
        3-day streak
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/60 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-zinc-900/60">
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-700/80">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="text-[11px] font-semibold text-zinc-400">hello.go</span>
        </div>

        {/* Step banner */}
        <div className="border-b border-zinc-100 bg-indigo-50/70 px-4 py-2.5 dark:border-zinc-700/80 dark:bg-indigo-950/40">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-400">
              Step 1 / 5
            </span>
            <span className="text-[10px] text-zinc-400">Getting Started</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Use <code className="font-mono text-indigo-600 dark:text-indigo-400">fmt.Println()</code> to print &quot;Hello, World!&quot; to the console.
          </p>
        </div>

        {/* Code */}
        <div className="bg-white px-4 py-3 font-mono text-[12px] leading-[1.8] dark:bg-zinc-900">
          <p><span className="text-violet-600 dark:text-violet-400">package</span><span className="text-zinc-700 dark:text-zinc-300"> main</span></p>
          <p className="mt-0.5"><span className="text-violet-600 dark:text-violet-400">import </span><span className="text-emerald-600 dark:text-emerald-400">&quot;fmt&quot;</span></p>
          <p className="mt-0.5"><span className="text-violet-600 dark:text-violet-400">func </span><span className="text-blue-600 dark:text-blue-400">main</span><span className="text-zinc-700 dark:text-zinc-300">() {"{"}</span></p>
          <p className="ml-4"><span className="text-cyan-600 dark:text-cyan-400">fmt</span><span className="text-zinc-600 dark:text-zinc-400">.</span><span className="text-blue-600 dark:text-blue-400">Println</span><span className="text-emerald-600 dark:text-emerald-400">(&quot;Hello, World!&quot;)</span></p>
          <p><span className="text-zinc-700 dark:text-zinc-300">{"}"}</span></p>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 border-t border-zinc-100 px-4 py-2 dark:border-zinc-700/80">
          <span className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-[11px] font-bold text-white shadow shadow-indigo-600/20">
            ▶ Run
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-[11px] font-bold text-emerald-600 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400">
            ✓ Check
          </span>
        </div>

        {/* Output */}
        <div className="border-t border-zinc-100 bg-zinc-50/60 px-4 py-3 dark:border-zinc-700/80 dark:bg-zinc-800/40">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">Output</p>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">Hello, World!</span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[9px] dark:bg-emerald-900/50">✓</span>
              Correct!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Guest hero ───────────────────────────────────────────────────────────────

function GuestHero({
  totalLessons,
}: {
  totalLessons: number;
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
          backgroundImage: "radial-gradient(circle, #c7d2fe 1px, transparent 1px)",
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
              ✓ Free interactive tutorials in 9 languages
            </p>

            {/* Headline */}
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15] dark:text-white">
              Learn to code.{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
                Stay in the editor.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-zinc-500 lg:mx-0 dark:text-zinc-400">
              Step-by-step tutorials with{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                live code, instant feedback, and saved progress
              </span>{" "}
              — all running live in your browser. Every lesson is free, and you only pay if you want detailed hints.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="/tutorial/python"
                className="rounded-xl bg-indigo-600 px-7 py-3 text-base font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Start with Python →
              </Link>
              <Link
                href="/tutorial/go"
                className="rounded-xl border border-zinc-200 bg-white px-7 py-3 text-base font-bold text-zinc-700 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
              >
                Start with Go →
              </Link>
              <Link
                href="/tutorial"
                className="text-sm font-semibold text-indigo-600 underline-offset-2 transition-colors hover:text-indigo-500 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Browse all tutorials
              </Link>
            </div>

            <p className="mt-4 text-xs text-zinc-400">
              No credit card required · Free lessons in every language · Save progress later when you want it
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-4 gap-x-3 gap-y-4 border-t border-zinc-100 pt-8 dark:border-zinc-800">
              {[
                { value: "9", label: "Languages", mobileLabel: "Languages" },
                { value: `${totalLessons}+`, label: "Free lessons", mobileLabel: "Lessons" },
                { value: "Live", label: "Code execution", mobileLabel: "Runs live" },
                { value: "0", label: "Setup required", mobileLabel: "No setup" },
              ].map(stat => (
                <div key={stat.label} className="text-center lg:text-left">
                  <p className="text-xl font-black text-zinc-900 sm:text-2xl dark:text-zinc-100">{stat.value}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500 sm:text-sm dark:text-zinc-400">
                    <span className="sm:hidden">{stat.mobileLabel}</span>
                    <span className="hidden sm:inline">{stat.label}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Mobile product preview — desktop shows the interactive IDE on the right */}
            <MobileCodePreview />
          </div>

          {/* Right: interactive IDE preview — shows the actual product (desktop only) */}
          <div className="hidden w-full max-w-md shrink-0 lg:block">
            <HeroIDEDeferred />
          </div>

        </div>
      </div>

      {/* ── Value strip ── */}
      <div className="relative border-t border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 divide-y divide-zinc-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-zinc-800">
            {[
              { icon: "💻", title: "Runs in your browser",       desc: "No installs, no setup. Start writing real code in seconds." },
              { icon: "🧭", title: "Start with a real track",    desc: "Choose a language, follow a clear path, and always know what comes next." },
              { icon: "💡", title: "Hints only when needed",     desc: "Every lesson is free. Pay only if you want extra help at the exact step you're stuck on." },
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
  isLoggedInServer,
  leftOff,
  continueLang,
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
    />
  );
}
