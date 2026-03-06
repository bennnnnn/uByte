import type { Metadata } from "next";
import Link from "next/link";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import { getLangIcon } from "@/lib/languages/icons";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getCurrentUser } from "@/lib/auth";
import { getUserPlan, getExamConfigForAllLangs, getUserExamStats } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import UpgradeWall from "@/components/UpgradeWall";
import { EXAM_LANGS } from "@/lib/exams/config";

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
  variant = "default",
}: {
  slug: string;
  examConfig: { examSize: number; examDurationMinutes: number };
  stats?: { attemptCount: number; lastPassed: boolean | null; hasCertificate: boolean };
  variant?: "default" | "try-again" | "passed";
}) {
  const config = LANGUAGES[slug as keyof typeof LANGUAGES];
  if (!config) return null;
  const isPassed = stats?.hasCertificate ?? false;
  const tryAgain = stats && stats.attemptCount > 0 && !stats.lastPassed && !stats.hasCertificate;

  return (
    <Link
      href={`/practice-exams/${slug}`}
      className={`group flex items-center gap-4 rounded-xl border p-5 transition-all hover:shadow-md
        ${variant === "try-again" ? "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20" : ""}
        ${variant === "passed" ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-950/10" : ""}
        ${variant === "default" ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" : ""}
        hover:border-zinc-300 dark:hover:border-zinc-700`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-2xl dark:bg-zinc-800">
        {getLangIcon(slug)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {config.name} Practice Exam
          </h3>
          {isPassed && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              Passed
            </span>
          )}
          {tryAgain && variant === "default" && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              {stats.attemptCount} attempt{stats.attemptCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          {examConfig.examSize} questions · {examConfig.examDurationMinutes} min · 70% to pass
        </p>
      </div>
      <span className="shrink-0 text-sm font-medium text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100">
        {tryAgain && variant === "try-again" ? "Try again →" : isPassed && variant === "passed" ? "View →" : "Start →"}
      </span>
    </Link>
  );
}

export default async function PracticeExamsPage() {
  const [user, examConfigByLang] = await Promise.all([
    getCurrentUser(),
    getExamConfigForAllLangs(),
  ]);
  const plan = user ? await getUserPlan(user.userId) : "free";
  const isPro = hasPaidAccess(plan);
  const langSlugs = getAllLanguageSlugs() as SupportedLanguage[];
  const examStats = user && isPro ? await getUserExamStats(user.userId) : [];
  const statsByLang = Object.fromEntries(examStats.map((s) => [s.lang, s]));

  const tryAgainLangs = EXAM_LANGS.filter(
    (lang) => statsByLang[lang] && statsByLang[lang].attemptCount > 0 && !statsByLang[lang].lastPassed && !statsByLang[lang].hasCertificate
  );
  const passedLangs = EXAM_LANGS.filter((lang) => statsByLang[lang]?.hasCertificate);

  if (!isPro) {
    return (
      <div className="min-h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <div className="mb-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
              Pro
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Practice Exams
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Timed multiple-choice exams by language. Questions and duration vary per exam. Score 70% or higher to pass and earn a shareable certificate.
            </p>
          </div>

          <div className="mb-10 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              What to expect
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <li>· Questions and duration set per language</li>
              <li>· 70% correct to pass and earn a certificate</li>
              <li>· Go, Python, C++, JavaScript, Java, Rust</li>
            </ul>
          </div>

          <UpgradeWall
            tutorialTitle="Practice Exams"
            subtitle="Upgrade to Pro to take timed exams and earn certificates."
            backHref="/"
            backLabel="← Back to home"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        {/* Hero */}
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Practice Exams
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Timed multiple-choice exams by language. Pass with 70% or higher to earn a certificate.
          </p>
        </header>

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
                  variant="default"
                />
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
