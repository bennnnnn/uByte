import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getCurrentUser } from "@/lib/auth";
import { getUserPlan, getExamConfigForLang, getExamConfigForAllLangs } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import { getLangIcon } from "@/lib/languages/icons";
import { getExamDetailContent } from "@/lib/exams/content";
import { absoluteUrl, buildBreadcrumbJsonLd, buildFaqJsonLd, SITE_KEYWORDS } from "@/lib/seo";
import StartExamButton from "./StartExamButton";
import ExamDetailTabs from "./ExamDetailTabs";
import OtherExamsGrid from "./OtherExamsGrid";

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            ✓
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export const dynamic = "force-dynamic";

const VALID_LANGS = new Set(getAllLanguageSlugs());

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) return { title: "Not found" };
  const config = LANGUAGES[lang as SupportedLanguage];
  const name = config?.name ?? lang;
  const examConfig = await getExamConfigForLang(lang);
  const canonical = absoluteUrl(`/practice-exams/${lang}`);
  return {
    title: `${name} Practice Exam`,
    description: `Take the ${name} practice exam. ${examConfig.examSize} questions, ${examConfig.examDurationMinutes} minutes. Score ${examConfig.passPercent}%+ to earn a certificate.`,
    keywords: [
      ...SITE_KEYWORDS,
      `${name} certification`,
      `${name} practice exam`,
      `${name} interview prep`,
      `${name} assessment`,
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: `${name} Practice Exam | uByte`,
      description: `Timed ${name} exam with certificate on pass.`,
      url: canonical,
    },
  };
}

export default async function PracticeExamLangPage({ params }: Props) {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) notFound();

  const [user, examConfig, examConfigByLang] = await Promise.all([
    getCurrentUser(),
    getExamConfigForLang(lang),
    getExamConfigForAllLangs(),
  ]);
  const plan = user ? await getUserPlan(user.userId) : "free";
  const canTakeExam = hasPaidAccess(plan);

  const config = LANGUAGES[lang as SupportedLanguage];
  const name = config?.name ?? lang;
  const EXAM_PASS_PERCENT = examConfig.passPercent;
  const content = getExamDetailContent(lang, examConfig, EXAM_PASS_PERCENT);
  const langSlugs = getAllLanguageSlugs();
  const passMin = Math.ceil((examConfig.examSize * EXAM_PASS_PERCENT) / 100);
  const faqItems =
    content?.faq ?? [
      {
        question: "How long is the exam?",
        answer: `${examConfig.examDurationMinutes} minutes. The timer starts when you begin and cannot be paused.`,
      },
      {
        question: "How many questions are there?",
        answer: `${examConfig.examSize} multiple-choice questions. You need ${EXAM_PASS_PERCENT}% or higher to pass.`,
      },
    ];
  const examJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    name: `${name} Practice Exam Certificate`,
    description:
      content?.objective ??
      `Timed ${name} multiple-choice exam with a certificate awarded on passing score.`,
    url: absoluteUrl(`/practice-exams/${lang}`),
    credentialCategory: "certificate",
  };
  const faqJsonLd = buildFaqJsonLd(faqItems);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Practice Exams", path: "/practice-exams" },
    { name: `${name} Practice Exam`, path: `/practice-exams/${lang}` },
  ]);

  return (
    <div className="min-h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([examJsonLd, faqJsonLd, breadcrumbJsonLd]),
        }}
      />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: identity + tagline + stat chips */}
            <div className="flex items-start gap-5">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 text-3xl dark:border-zinc-700/60 dark:bg-zinc-800">
                {getLangIcon(lang)}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
                    {name} Practice Exam
                  </h1>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-400">
                    Pro
                  </span>
                </div>
                <p className="mt-2 max-w-xl text-base text-zinc-500 dark:text-zinc-400">
                  {content?.tagline ?? `Timed multiple-choice exam to validate your ${name} knowledge.`}
                </p>

                {/* Quick stats chips */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    `${examConfig.examSize} questions`,
                    `${examConfig.examDurationMinutes} min`,
                    `${passMin} correct to pass (${EXAM_PASS_PERCENT}%)`,
                    "Certificate on pass",
                  ].map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body: main content + sticky sidebar ─────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">

          {/* ── Left: tabs (overview, topics, FAQ) ──────────────────────── */}
          <div className="min-w-0">
            <ExamDetailTabs
              langName={name}
              content={content}
              examSize={examConfig.examSize}
              examDurationMinutes={examConfig.examDurationMinutes}
              passPercent={EXAM_PASS_PERCENT}
            />
          </div>

          {/* ── Right: sticky CTA card ───────────────────────────────────── */}
          <aside className="lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              {/* Card top accent */}
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-400" />

              <div className="p-6">
                {canTakeExam ? (
                  <>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Ready to start?</p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      The timer starts the moment you begin. You&apos;ll have {examConfig.examDurationMinutes} minutes.
                    </p>

                    <CheckList items={[
                      `${examConfig.examSize} randomised questions`,
                      `${examConfig.examDurationMinutes} min — can't be paused`,
                      `${passMin} correct (${EXAM_PASS_PERCENT}%) to pass`,
                      "Certificate sent on pass",
                      "Retake anytime",
                    ]} />

                    <div className="mt-6">
                      <StartExamButton lang={lang} langName={name} fullWidth />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Take this exam</p>

                    <CheckList items={[
                      "Timed exams with real scoring",
                      "Shareable certificate on pass",
                      "All 6 language exams",
                      "Retake anytime",
                    ]} />

                    <div className="mt-6 flex flex-col gap-3">
                      <Link
                        href="/pricing"
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
                      >
                        Get certified
                      </Link>
                      {!user && (
                        <Link
                          href="/login"
                          className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                        >
                          Sign in
                        </Link>
                      )}
                    </div>

                  </>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* ── Other exams ─────────────────────────────────────────────────── */}
        <OtherExamsGrid
          currentLang={lang}
          langSlugs={langSlugs}
          examConfigByLang={examConfigByLang}
        />
      </div>
    </div>
  );
}
