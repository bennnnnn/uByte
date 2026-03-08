import type { Metadata } from "next";
import Link from "next/link";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import { getLangIcon } from "@/lib/languages/icons";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getCurrentUser } from "@/lib/auth";
import { getUserPlan, getExamConfigForAllLangs, getUserExamStats, getExamPublicStatsByLang, DEFAULT_EXAM_CONFIG } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import { EXAM_LANGS } from "@/lib/exams/config";
import { tutorialLangUrl } from "@/lib/urls";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Programming Certifications",
  description:
    "Timed certification-style programming exams by language. Practice real assessment formats and earn shareable certificates when you pass.",
  keywords: [
    ...SITE_KEYWORDS,
    "programming certification exams",
    "coding certification practice",
    "technical assessment practice",
  ],
  alternates: { canonical: absoluteUrl("/certifications") },
  openGraph: {
    title: "Programming Certifications | uByte",
    description:
      "Take timed programming certifications and earn shareable certificates.",
    type: "website",
    url: absoluteUrl("/certifications"),
  },
};

// ─── Exam Card ────────────────────────────────────────────────────────────────

function getDifficultyFromPassRate(passRate: number, hasData: boolean): { label: string; color: string } {
  if (!hasData) return { label: "New", color: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" };
  if (passRate >= 70) return { label: "Beginner", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" };
  if (passRate >= 40) return { label: "Intermediate", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" };
  return { label: "Advanced", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" };
}

function ExamCard({
  slug,
  examConfig,
  stats,
  publicStats,
  isLoggedIn = false,
}: {
  slug: string;
  examConfig: { examSize: number; examDurationMinutes: number };
  stats?: { attemptCount: number; lastPassed: boolean | null; lastScore: number | null; bestScore: number | null; hasCertificate: boolean };
  publicStats?: { usersTaken: number; attemptsSubmitted: number; passRatePercent: number };
  isLoggedIn?: boolean;
}) {
  const config = LANGUAGES[slug as keyof typeof LANGUAGES];
  if (!config) return null;

  const isPassed = stats?.hasCertificate ?? false;
  const tryAgain = stats && stats.attemptCount > 0 && !stats.lastPassed && !stats.hasCertificate;
  const userAttempts = stats?.attemptCount ?? 0;
  const totalAttempts = publicStats?.attemptsSubmitted ?? 0;
  const passRate = publicStats?.passRatePercent ?? 0;
  const hasData = totalAttempts > 0;
  const difficulty = getDifficultyFromPassRate(passRate, hasData);

  const ctaLabel = tryAgain ? "Try again →" : isPassed ? "View cert →" : "Take certification →";

  return (
    <Link
      href={`/certifications/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
    >
      <div className="flex flex-1 flex-col gap-5 p-6">
        {/* Top row: icon + name + difficulty + status */}
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 text-2xl dark:border-zinc-700/60 dark:bg-zinc-800">
            {getLangIcon(slug)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{config.name}</h3>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${difficulty.color}`}>
                {difficulty.label}
              </span>
              {isPassed && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  ✓ Certified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Exam info + stats */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Questions</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{examConfig.examSize}</p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Time limit</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {examConfig.examDurationMinutes}<span className="ml-0.5 text-sm font-normal text-zinc-400">min</span>
            </p>
          </div>
          {isLoggedIn && userAttempts > 0 ? (
            <>
              {stats?.bestScore != null && (
                <div className="flex-1">
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Best</p>
                  <p className={`mt-0.5 text-lg font-bold tabular-nums ${isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-900 dark:text-zinc-100"}`}>
                    {stats.bestScore}%
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Pass rate</p>
              <p className={`mt-0.5 text-lg font-bold tabular-nums ${
                !hasData ? "text-zinc-400" : passRate >= 60 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              }`}>
                {hasData ? `${passRate}%` : "—"}
              </p>
            </div>
          )}
        </div>

        {/* CTA button */}
        <span className="mt-auto w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors group-hover:bg-indigo-500">
          {ctaLabel}
        </span>
      </div>
    </Link>
  );
}

/** Renders a grid of ExamCards for a list of language slugs. */
function ExamCardGrid({
  langs,
  examConfigByLang,
  statsByLang,
  publicStatsByLang,
  isLoggedIn,
  cols = 3,
}: {
  langs: string[];
  examConfigByLang: Record<string, { examSize: number; examDurationMinutes: number }>;
  statsByLang: Record<string, { attemptCount: number; lastPassed: boolean | null; lastScore: number | null; bestScore: number | null; hasCertificate: boolean }>;
  publicStatsByLang: Record<string, { usersTaken: number; attemptsSubmitted: number; passRatePercent: number }>;
  isLoggedIn: boolean;
  cols?: 2 | 3;
}) {
  return (
    <div className={`grid gap-5 sm:grid-cols-2 ${cols === 3 ? "lg:grid-cols-3" : ""}`}>
      {langs.map((lang) => (
        <ExamCard
          key={lang}
          slug={lang}
          examConfig={examConfigByLang[lang] ?? DEFAULT_EXAM_CONFIG}
          stats={statsByLang[lang]}
          publicStats={publicStatsByLang[lang]}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
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

  // Languages the Pro user hasn't attempted yet
  const unattemptedLangs = EXAM_LANGS.filter((lang) => !statsByLang[lang] || statsByLang[lang].attemptCount === 0);

  // Pick a suggested language: first failed > first unattempted > first overall
  const suggestedLang = tryAgainLangs[0] ?? unattemptedLangs[0] ?? EXAM_LANGS[0];

  // Popular = langs with real attempt data, sorted by usage
  const popularLangs = EXAM_LANGS
    .filter((lang) => (publicStatsByLang[lang]?.attemptsSubmitted ?? 0) > 0)
    .sort((a, b) => (publicStatsByLang[b]?.attemptsSubmitted ?? 0) - (publicStatsByLang[a]?.attemptsSubmitted ?? 0))
    .slice(0, 3);
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Programming certifications",
    url: absoluteUrl("/certifications"),
    hasPart: EXAM_LANGS.map((lang, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${LANGUAGES[lang]?.name ?? lang} certification`,
      url: absoluteUrl(`/certifications/${lang}`),
    })),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do certifications work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each exam is timed, language-specific, and scored automatically. You can retake exams after each attempt.",
        },
      },
      {
        "@type": "Question",
        name: "Do I get a certificate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Passing an exam unlocks a shareable certificate for that language.",
        },
      },
    ],
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Certifications", item: absoluteUrl("/certifications") },
    ],
  };

  return (
    <div className="min-h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([collectionJsonLd, faqJsonLd, breadcrumbJsonLd]),
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
                Programming Certifications
              </h1>
              <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400">
                Timed multiple-choice exams by language. Pass to earn a shareable certificate.
              </p>
            </div>

            {!user ? (
              /* Not logged in */
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login?redirect=/certifications"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
                >
                  Get started free
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  See pricing
                </Link>
              </div>
            ) : !isPro ? (
              /* Logged in, free plan */
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
                >
                  Upgrade to Pro
                </Link>
                <a
                  href="#all-certifications"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Browse certifications
                </a>
              </div>
            ) : passedLangs.length === EXAM_LANGS.length ? (
              /* Pro, all passed */
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  All certified!
                </span>
                <Link
                  href="/profile?tab=overview"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  View certificates
                </Link>
              </div>
            ) : tryAgainLangs.length > 0 ? (
              /* Pro, has failed exams */
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/certifications/${tryAgainLangs[0]}`}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
                >
                  Retake {LANGUAGES[tryAgainLangs[0]]?.name} exam
                </Link>
                <a
                  href="#all-certifications"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  All certifications
                </a>
              </div>
            ) : (
              /* Pro, no attempts yet (or some passed, some not attempted) */
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/certifications/${suggestedLang}`}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
                >
                  {passedLangs.length > 0
                    ? `Next: ${LANGUAGES[suggestedLang]?.name} exam`
                    : "Start your first exam"}
                </Link>
                <a
                  href="#all-certifications"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Browse all
                </a>
              </div>
            )}
          </div>

          {/* Trust bar */}
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-zinc-100 pt-8 dark:border-zinc-800">
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
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-14">

        {/* ── Learning journey OR progress dashboard ──────────────────────── */}
        {isPro && examStats.length > 0 ? (
          /* Progress dashboard for Pro users with exam history */
          <section className="mb-14">
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Your progress
            </h2>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {passedLangs.length} <span className="text-base font-normal text-zinc-400">/ {EXAM_LANGS.length} certified</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {examStats.reduce((s, e) => s + e.attemptCount, 0)} total attempts
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mb-6 h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.round((passedLangs.length / EXAM_LANGS.length) * 100)}%` }}
                />
              </div>
              {/* Per-language mini cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {EXAM_LANGS.map((lang) => {
                  const s = statsByLang[lang];
                  const passed = s?.hasCertificate;
                  const attempted = s && s.attemptCount > 0;
                  return (
                    <Link
                      key={lang}
                      href={`/certifications/${lang}`}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors hover:border-indigo-300 dark:hover:border-indigo-700 ${
                        passed
                          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-950/20"
                          : attempted
                          ? "border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/20"
                          : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                      }`}
                    >
                      <span className="text-xl">{getLangIcon(lang)}</span>
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {LANGUAGES[lang]?.name}
                      </span>
                      {passed ? (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Certified</span>
                      ) : attempted && s?.bestScore != null ? (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Best: {s.bestScore}%</span>
                      ) : (
                        <span className="text-[10px] text-zinc-400">Not started</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        ) : (
          /* Learning journey for visitors / free users / Pro with no attempts */
          <section className="mb-14">
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Your path to certification
            </h2>
            <div className="relative grid gap-4 sm:grid-cols-2">
              {/* Connector line (desktop only) */}
              <div className="pointer-events-none absolute left-0 right-0 top-[3.25rem] hidden h-px bg-gradient-to-r from-indigo-200 to-emerald-300 dark:from-indigo-800 dark:to-emerald-700 sm:block" />

              {[
                {
                  step: "1",
                  icon: "📖",
                  title: "Build understanding",
                  body: "Start with bite-sized tutorials. Master syntax, data structures, and core concepts at your own pace — then practice with hands-on coding challenges.",
                  link: "/tutorial",
                  linkLabel: "Browse tutorials",
                },
                {
                  step: "2",
                  icon: "🏆",
                  title: "Prove yourself",
                  body: "Take a timed certification exam. Pass the threshold and earn a shareable digital certificate — proof of your expertise.",
                  link: "#all-certifications",
                  linkLabel: "View certifications",
                },
              ].map(({ step, icon, title, body, link, linkLabel }) => (
                <div key={step} className="relative rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl dark:bg-indigo-950/40">
                    {icon}
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
                  <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{body}</p>
                  <Link
                    href={link}
                    className="mt-4 inline-flex text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {linkLabel} →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Popular certifications (only when real data exists) ───────────────────── */}
        {popularLangs.length > 0 && (
          <section className="mb-14" aria-labelledby="popular-heading">
            <div className="mb-5 flex items-end justify-between">
              <h2 id="popular-heading" className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Popular certifications
              </h2>
              <a href="#all-certifications" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                View all →
              </a>
            </div>
            <ExamCardGrid langs={popularLangs} examConfigByLang={examConfigByLang} statsByLang={statsByLang} publicStatsByLang={publicStatsByLang} isLoggedIn={!!user} />
          </section>
        )}

        {/* ── Try again (Pro user with failed attempts) ─────────────────────── */}
        {tryAgainLangs.length > 0 && (
          <section className="mb-14" aria-labelledby="try-again-heading">
            <h2 id="try-again-heading" className="mb-5 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Give it another shot
            </h2>
            <ExamCardGrid langs={tryAgainLangs} examConfigByLang={examConfigByLang} statsByLang={statsByLang} publicStatsByLang={publicStatsByLang} isLoggedIn={!!user} cols={2} />
          </section>
        )}

        {/* ── Passed langs ─────────────────────────────────────────────────── */}
        {passedLangs.length > 0 && (
          <section className="mb-14" aria-labelledby="passed-heading">
            <h2 id="passed-heading" className="mb-5 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              You passed
            </h2>
            <ExamCardGrid langs={passedLangs} examConfigByLang={examConfigByLang} statsByLang={statsByLang} publicStatsByLang={publicStatsByLang} isLoggedIn={!!user} cols={2} />
          </section>
        )}

        {/* ── All certifications ─────────────────────────────────────────────────────── */}
        <section id="all-certifications" aria-labelledby="all-heading">
          <h2 id="all-heading" className="mb-5 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            All certifications
          </h2>
          <ExamCardGrid langs={langSlugs} examConfigByLang={examConfigByLang} statsByLang={statsByLang} publicStatsByLang={publicStatsByLang} isLoggedIn={!!user} />
        </section>

        {/* ── Bottom CTA ─────────────────────────────────────────────── */}
        {!user ? (
          <div className="mt-16 rounded-2xl border border-indigo-100 bg-indigo-50 p-8 text-center dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Ready to prove your skills?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              Create a free account to get started, then upgrade to Pro to unlock timed exams and earn shareable certificates.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login?redirect=/certifications"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
              >
                Sign up free
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                See pricing
              </Link>
            </div>
          </div>
        ) : !isPro ? (
          <div className="mt-16 rounded-2xl border border-indigo-100 bg-indigo-50 p-8 text-center dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Unlock all certifications</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              Upgrade to Pro to take timed exams, get scored, and earn a shareable certificate for every language you pass.
            </p>
            <div className="mt-6">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        ) : passedLangs.length < EXAM_LANGS.length ? (
          <div className="mt-16 rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {passedLangs.length === 0 ? "Take your first certification" : `${EXAM_LANGS.length - passedLangs.length} certifications remaining`}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              {passedLangs.length === 0
                ? "You have Pro access. Pick a language and earn your first certificate."
                : `You've passed ${passedLangs.length} of ${EXAM_LANGS.length}. Keep going to complete the full set.`}
            </p>
            <div className="mt-6">
              <Link
                href={`/certifications/${suggestedLang}`}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
              >
                {tryAgainLangs.length > 0
                  ? `Retake ${LANGUAGES[tryAgainLangs[0]]?.name} exam`
                  : `Start ${LANGUAGES[suggestedLang]?.name} exam`}
              </Link>
            </div>
          </div>
        ) : null}

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
