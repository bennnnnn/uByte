import type { Metadata } from "next";
import Link from "next/link";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import { getLangIcon } from "@/lib/languages/icons";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getCurrentUser } from "@/lib/auth";
import { getUserPlan, getExamConfigForAllLangs, getUserExamStats, getExamPublicStatsByLang } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import { EXAM_LANGS } from "@/lib/exams/config";
import { tutorialLangUrl } from "@/lib/urls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Practice Exams",
  description:
    "Timed multiple-choice practice exams by language. Pass to earn a certificate. Pro members only.",
};

// ─── Exam Card ────────────────────────────────────────────────────────────────

function ExamCard({
  slug,
  examConfig,
  stats,
  publicStats,
  isLoggedIn = false,
  variant = "default",
}: {
  slug: string;
  examConfig: { examSize: number; examDurationMinutes: number };
  stats?: { attemptCount: number; lastPassed: boolean | null; hasCertificate: boolean };
  publicStats?: { usersTaken: number; attemptsSubmitted: number; passRatePercent: number };
  isLoggedIn?: boolean;
  variant?: "default" | "try-again" | "passed";
}) {
  const config = LANGUAGES[slug as keyof typeof LANGUAGES];
  if (!config) return null;

  const isPassed = stats?.hasCertificate ?? false;
  const tryAgain = stats && stats.attemptCount > 0 && !stats.lastPassed && !stats.hasCertificate;
  const userAttempts = stats?.attemptCount ?? 0;
  const totalAttempts = publicStats?.attemptsSubmitted ?? 0;
  const passRate = publicStats?.passRatePercent ?? 0;
  const hasData = totalAttempts > 0;

  const accentColor =
    variant === "try-again" ? "from-amber-400 to-amber-200" :
    variant === "passed"    ? "from-emerald-400 to-emerald-200" :
                              "from-indigo-500 to-violet-400";

  const borderColor =
    variant === "try-again" ? "border-amber-200 dark:border-amber-800/50" :
    variant === "passed"    ? "border-emerald-200 dark:border-emerald-900/40" :
                              "border-zinc-200 dark:border-zinc-800";

  const ctaLabel = tryAgain ? "Try again →" : isPassed ? "View cert →" : "Start exam →";

  return (
    <Link
      href={`/practice-exams/${slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:bg-zinc-900 ${borderColor} focus:outline-none focus:ring-2 focus:ring-indigo-500/40`}
    >
      {/* Accent top bar */}
      <div className={`h-1 w-full shrink-0 bg-gradient-to-r ${accentColor}`} />

      <div className="flex flex-1 flex-col gap-5 p-6">
        {/* Top row: icon + name + status + CTA */}
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 text-2xl dark:border-zinc-700/60 dark:bg-zinc-800">
            {getLangIcon(slug)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{config.name}</h3>
              {isPassed && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  ✓ Passed
                </span>
              )}
              {tryAgain && !isPassed && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  {userAttempts} attempt{userAttempts !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Practice Exam · MCQ · Certificate on pass</p>
          </div>
          <span className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors group-hover:bg-indigo-500">
            {ctaLabel}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Stats: 2 × 2 */}
        <div className="grid grid-cols-2 gap-y-4">
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Questions</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {examConfig.examSize}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Time limit</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {examConfig.examDurationMinutes}
              <span className="ml-1 text-sm font-normal text-zinc-400">min</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {isLoggedIn ? "Your attempts" : "Total attempts"}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {isLoggedIn ? (
                <>
                  {userAttempts}
                  <span className="ml-1.5 text-sm font-normal text-zinc-400">
                    / {hasData ? totalAttempts.toLocaleString() : "0"} total
                  </span>
                </>
              ) : (
                hasData ? totalAttempts.toLocaleString() : <span className="text-zinc-400">—</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Pass rate</p>
            <p className={`mt-1 text-2xl font-bold tabular-nums ${
              !hasData
                ? "text-zinc-400 dark:text-zinc-500"
                : passRate >= 60
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}>
              {hasData ? `${passRate}%` : "New"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PracticeExamsPage() {
  const [user, examConfigByLang, publicStats] = await Promise.all([
    getCurrentUser(),
    getExamConfigForAllLangs(),
    getExamPublicStatsByLang(),
  ]);

  const plan = user ? await getUserPlan(user.userId) : "free";
  const isPro = hasPaidAccess(plan);
  const langSlugs = getAllLanguageSlugs() as SupportedLanguage[];
  const examStats = user && isPro ? await getUserExamStats(user.userId) : [];
  const statsByLang = Object.fromEntries(examStats.map((s) => [s.lang, s]));
  const publicStatsByLang = Object.fromEntries(publicStats.map((s) => [s.lang, s]));

  // Aggregate trust numbers for the hero bar
  const totalAttempts = publicStats.reduce((s, r) => s + r.attemptsSubmitted, 0);
  const totalCertificates = publicStats.reduce((s, r) => s + r.usersPassed, 0);

  // Per-user sections (Pro only)
  const tryAgainLangs = EXAM_LANGS.filter(
    (lang) => statsByLang[lang] && statsByLang[lang].attemptCount > 0
      && !statsByLang[lang].lastPassed && !statsByLang[lang].hasCertificate
  );
  const passedLangs = EXAM_LANGS.filter((lang) => statsByLang[lang]?.hasCertificate);

  // Popular = langs with real attempt data, sorted by usage
  const popularLangs = EXAM_LANGS
    .filter((lang) => (publicStatsByLang[lang]?.attemptsSubmitted ?? 0) > 0)
    .sort((a, b) => (publicStatsByLang[b]?.attemptsSubmitted ?? 0) - (publicStatsByLang[a]?.attemptsSubmitted ?? 0))
    .slice(0, 3);

  return (
    <div className="min-h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Pro feature
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
                Practice Exams
              </h1>
              <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400">
                Timed multiple-choice exams by language. Pass to earn a shareable certificate.
              </p>
            </div>

            {isPro ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Pro active
              </span>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
                >
                  Upgrade to Pro
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  See pricing
                </Link>
              </div>
            )}
          </div>

          {/* Trust bar */}
          <div className="mt-10 grid grid-cols-2 gap-4 border-t border-zinc-100 pt-8 dark:border-zinc-800 sm:grid-cols-4">
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{EXAM_LANGS.length}</p>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Languages</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {totalAttempts > 0 ? totalAttempts.toLocaleString() : "—"}
              </p>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Exams taken</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {totalCertificates > 0 ? totalCertificates.toLocaleString() : "—"}
              </p>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Certificates issued</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Per exam</p>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Pass threshold</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-14">

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="mb-14">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            How it works
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { step: "1", title: "Pick a language", body: "Choose from Go, Python, JavaScript, Java, Rust, or C++. Each exam is independently timed and scored." },
              { step: "2", title: "Take the timed exam", body: "Answer multiple-choice questions within the time limit. The clock starts the moment you begin." },
              { step: "3", title: "Pass and earn your cert", body: "Meet the pass threshold for that language. Download and share your certificate — it's yours forever." },
            ].map(({ step, title, body }) => (
              <div key={step} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                  {step}
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
                <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Popular exams (only when real data exists) ───────────────────── */}
        {popularLangs.length > 0 && (
          <section className="mb-14" aria-labelledby="popular-heading">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 id="popular-heading" className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Popular right now
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Most attempted by other users.</p>
              </div>
              <a href="#all-exams" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                View all →
              </a>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {popularLangs.map((lang) => {
                const examConfig = examConfigByLang[lang] ?? { examSize: 40, examDurationMinutes: 45 };
                return (
                  <ExamCard
                    key={lang}
                    slug={lang}
                    examConfig={examConfig}
                    stats={statsByLang[lang]}
                    publicStats={publicStatsByLang[lang]}
                    isLoggedIn={!!user}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* ── Try again (Pro user with failed attempts) ─────────────────────── */}
        {tryAgainLangs.length > 0 && (
          <section className="mb-14" aria-labelledby="try-again-heading">
            <h2 id="try-again-heading" className="mb-5 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Give it another shot
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {tryAgainLangs.map((lang) => {
                const examConfig = examConfigByLang[lang] ?? { examSize: 40, examDurationMinutes: 45 };
                return (
                  <ExamCard
                    key={lang}
                    slug={lang}
                    examConfig={examConfig}
                    stats={statsByLang[lang]}
                    publicStats={publicStatsByLang[lang]}
                    isLoggedIn={!!user}
                    variant="try-again"
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* ── Passed langs ─────────────────────────────────────────────────── */}
        {passedLangs.length > 0 && (
          <section className="mb-14" aria-labelledby="passed-heading">
            <h2 id="passed-heading" className="mb-5 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              You passed
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {passedLangs.map((lang) => {
                const examConfig = examConfigByLang[lang] ?? { examSize: 40, examDurationMinutes: 45 };
                return (
                  <ExamCard
                    key={lang}
                    slug={lang}
                    examConfig={examConfig}
                    stats={statsByLang[lang]}
                    publicStats={publicStatsByLang[lang]}
                    isLoggedIn={!!user}
                    variant="passed"
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* ── All exams ─────────────────────────────────────────────────────── */}
        <section id="all-exams" aria-labelledby="all-heading">
          <h2 id="all-heading" className="mb-5 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            All exams
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {langSlugs.map((slug) => {
              const config = LANGUAGES[slug];
              if (!config) return null;
              const examConfig = examConfigByLang[slug] ?? { examSize: 40, examDurationMinutes: 45 };
              return (
                <ExamCard
                  key={slug}
                  slug={slug}
                  examConfig={examConfig}
                  stats={statsByLang[slug]}
                  publicStats={publicStatsByLang[slug]}
                  isLoggedIn={!!user}
                />
              );
            })}
          </div>
        </section>

        {/* ── Bottom CTA (free / logged-out users only) ─────────────────────── */}
        {!isPro && (
          <div className="mt-16 rounded-2xl border border-indigo-100 bg-indigo-50 p-8 text-center dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Ready to test your skills?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              Upgrade to Pro to unlock timed exams, get scored, and earn a shareable certificate for every language you pass.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
              >
                Upgrade to Pro
              </Link>
              {!user && (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Footer nav ────────────────────────────────────────────────────── */}
        <nav
          className="mt-14 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-zinc-200 pt-8 text-sm dark:border-zinc-800"
          aria-label="Quick links"
        >
          <Link href="/" className="font-medium text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">
            Home
          </Link>
          {langSlugs.map((slug) => {
            const config = LANGUAGES[slug];
            if (!config) return null;
            return (
              <Link key={slug} href={tutorialLangUrl(slug)} className="font-medium text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">
                {config.name} tutorials
              </Link>
            );
          })}
          <Link href="/practice" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Interview practice →
          </Link>
        </nav>
      </div>
    </div>
  );
}
