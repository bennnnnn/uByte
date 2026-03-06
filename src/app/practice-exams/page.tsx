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
    "Timed multiple-choice practice exams by language. Pass to earn a certificate. Available for Pro members.",
};

function ExamCard({
  slug,
  examConfig,
  stats,
  publicStats,
  variant = "default",
}: {
  slug: string;
  examConfig: { examSize: number; examDurationMinutes: number };
  stats?: { attemptCount: number; lastPassed: boolean | null; hasCertificate: boolean };
  publicStats?: { usersTaken: number; attemptsSubmitted: number; passRatePercent: number };
  variant?: "default" | "try-again" | "passed";
}) {
  const config = LANGUAGES[slug as keyof typeof LANGUAGES];
  if (!config) return null;
  const isPassed = stats?.hasCertificate ?? false;
  const tryAgain = stats && stats.attemptCount > 0 && !stats.lastPassed && !stats.hasCertificate;
  const statUsersTaken = publicStats?.usersTaken ?? 0;
  const statAttempts = publicStats?.attemptsSubmitted ?? 0;
  const statPassRate = publicStats?.passRatePercent ?? 0;
  const hasPublicStats = statUsersTaken > 0 || statAttempts > 0;
  const ctaLabel = tryAgain && variant === "try-again" ? "Try again" : isPassed && variant === "passed" ? "View" : "Start";

  return (
    <Link
      href={`/practice-exams/${slug}`}
      className={`group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md
        ${variant === "try-again" ? "border-amber-200 bg-white dark:border-amber-800/60 dark:bg-zinc-900" : ""}
        ${variant === "passed" ? "border-emerald-200 bg-white dark:border-emerald-900/50 dark:bg-zinc-900" : ""}
        ${variant === "default" ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" : ""}
        hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40`}
    >
      {/* Accent */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1
          ${variant === "try-again" ? "bg-gradient-to-r from-amber-400/70 via-amber-300/40 to-transparent" : ""}
          ${variant === "passed" ? "bg-gradient-to-r from-emerald-400/70 via-emerald-300/40 to-transparent" : ""}
          ${variant === "default" ? "bg-gradient-to-r from-indigo-400/60 via-indigo-300/20 to-transparent" : ""}`}
      />

      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-2xl dark:border-zinc-700 dark:bg-zinc-800/60">
          {getLangIcon(slug)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {config.name} Practice Exam
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                  {examConfig.examSize} questions
                </span>
                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                  {examConfig.examDurationMinutes} min
                </span>
                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                  70% to pass
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {isPassed && (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  Passed
                </span>
              )}
              {tryAgain && !isPassed && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                  {stats?.attemptCount ?? 0} attempt{(stats?.attemptCount ?? 0) !== 1 ? "s" : ""}
                </span>
              )}
              <span className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors group-hover:bg-indigo-500 dark:shadow-none">
                {ctaLabel} →
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/40">
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Users
              </div>
              <div className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {hasPublicStats ? statUsersTaken.toLocaleString() : "—"}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/40">
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Attempts
              </div>
              <div className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {hasPublicStats ? statAttempts.toLocaleString() : "—"}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/40">
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Pass rate
              </div>
              <div className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {hasPublicStats ? `${statPassRate}%` : "New"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

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

  const tryAgainLangs = EXAM_LANGS.filter(
    (lang) => statsByLang[lang] && statsByLang[lang].attemptCount > 0 && !statsByLang[lang].lastPassed && !statsByLang[lang].hasCertificate
  );
  const passedLangs = EXAM_LANGS.filter((lang) => statsByLang[lang]?.hasCertificate);

  const popularCandidates = EXAM_LANGS.filter((lang) => {
    const s = publicStatsByLang[lang];
    return (s?.usersTaken ?? 0) > 0 || (s?.attemptsSubmitted ?? 0) > 0;
  });

  const popularLangs = [...popularCandidates]
    .sort((a, b) => {
      const au = publicStatsByLang[a]?.usersTaken ?? 0;
      const bu = publicStatsByLang[b]?.usersTaken ?? 0;
      if (bu !== au) return bu - au;
      const aa = publicStatsByLang[a]?.attemptsSubmitted ?? 0;
      const ba = publicStatsByLang[b]?.attemptsSubmitted ?? 0;
      return ba - aa;
    })
    .slice(0, 6);

  return (
    <div className="min-h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        {/* Hero */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
                Practice Exams
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Timed multiple-choice exams by language. Pass with 70% or higher to earn a certificate.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isPro ? (
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                  Pro active
                </span>
              ) : (
                <>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
                  >
                    Upgrade to Pro
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    See pricing
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  What you get with Pro
                </p>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  <li>· Timed exams with real scoring</li>
                  <li>· Shareable certificate when you pass</li>
                  <li>· Retake anytime to improve your score</li>
                  <li>· Multiple languages (Go, Python, JS, Java, Rust, C++)</li>
                </ul>
              </div>
              <div className="shrink-0">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Tip: browse for free, upgrade when you&apos;re ready to start.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Popular exams */}
        {popularLangs.length > 0 ? (
          <section className="mb-12" aria-labelledby="popular-exams-heading">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2
                  id="popular-exams-heading"
                  className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                >
                  Popular exams
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Based on completed attempts across all users.
                </p>
              </div>
              <Link href="#all-exams-heading" className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                View all →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {popularLangs.map((lang) => {
                const config = LANGUAGES[lang as keyof typeof LANGUAGES];
                if (!config) return null;
                const examConfig = examConfigByLang[lang] ?? { examSize: 40, examDurationMinutes: 45 };
                return (
                  <ExamCard
                    key={lang}
                    slug={lang}
                    examConfig={examConfig}
                    stats={statsByLang[lang]}
                    publicStats={publicStatsByLang[lang]}
                    variant="default"
                  />
                );
              })}
            </div>
          </section>
        ) : (
          <section className="mb-12" aria-labelledby="popular-exams-heading">
            <h2
              id="popular-exams-heading"
              className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Popular exams
            </h2>
            <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              No completed exam attempts yet — take the first one and this section will start ranking what’s actually popular.
            </div>
          </section>
        )}

        {/* Try again — failed last attempt */}
        {tryAgainLangs.length > 0 && (
          <section className="mb-10" aria-labelledby="try-again-heading">
            <h2 id="try-again-heading" className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Give it another shot
            </h2>
            <p className="mb-4 text-zinc-600 dark:text-zinc-400">
              You&apos;ve tried these — no pass yet. Review the material and try again when you&apos;re ready.
            </p>
            <div className="space-y-3">
              {tryAgainLangs.map((lang) => {
                const config = LANGUAGES[lang as keyof typeof LANGUAGES];
                if (!config) return null;
                const examConfig = examConfigByLang[lang] ?? { examSize: 40, examDurationMinutes: 45 };
                return (
                  <ExamCard
                    key={lang}
                    slug={lang}
                    examConfig={examConfig}
                    stats={statsByLang[lang]}
                    publicStats={publicStatsByLang[lang]}
                    variant="try-again"
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Passed — suggest others */}
        {passedLangs.length > 0 && (
          <section className="mb-10" aria-labelledby="passed-heading">
            <h2 id="passed-heading" className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              You passed
            </h2>
            <p className="mb-4 text-zinc-600 dark:text-zinc-400">
              {passedLangs.length === 1
                ? `You passed the ${LANGUAGES[passedLangs[0] as keyof typeof LANGUAGES]?.name ?? passedLangs[0]} exam. Try another language next.`
                : `You've passed ${passedLangs.length} exams. Keep going — try another language.`}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {passedLangs.map((lang) => {
                const examConfig = examConfigByLang[lang] ?? { examSize: 40, examDurationMinutes: 45 };
                return (
                  <ExamCard
                    key={lang}
                    slug={lang}
                    examConfig={examConfig}
                    stats={statsByLang[lang]}
                    publicStats={publicStatsByLang[lang]}
                    variant="passed"
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* All exams */}
        <section aria-labelledby="all-exams-heading">
          <h2
            id="all-exams-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
          >
            {tryAgainLangs.length > 0 || passedLangs.length > 0 ? "All exams" : "Choose a language"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  variant="default"
                />
              );
            })}
          </div>
        </section>

        {/* Quick-nav footer */}
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
