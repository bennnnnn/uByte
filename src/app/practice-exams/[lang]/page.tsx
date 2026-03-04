import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getCurrentUser } from "@/lib/auth";
import { getUserPlan, getExamConfig } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import { getExamDetailContent } from "@/lib/exams/content";
import StartExamButton from "./StartExamButton";
import ExamDetailTabs from "./ExamDetailTabs";
import ExamCardsSection from "./ExamCardsSection";
import OtherExamsGrid from "./OtherExamsGrid";

export const dynamic = "force-dynamic";

const VALID_LANGS = new Set(getAllLanguageSlugs());

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const config = LANGUAGES[lang as SupportedLanguage];
  const name = config?.name ?? lang;
  const examConfig = await getExamConfig();
  return {
    title: `${name} Practice Exam`,
    description: `Prepare for the ${name} practice exam. ${examConfig.examSize} questions, ${examConfig.examDurationMinutes} minutes, 70% to pass and earn a certificate.`,
  };
}

export default async function PracticeExamLangPage({ params }: Props) {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) notFound();

  const [user, examConfig] = await Promise.all([
    getCurrentUser().then((u) => u),
    getExamConfig(),
  ]);
  const plan = user ? await getUserPlan(user.userId) : "free";
  const canTakeExam = hasPaidAccess(plan);

  const config = LANGUAGES[lang as SupportedLanguage];
  const name = config?.name ?? lang;
  const content = getExamDetailContent(lang, examConfig);
  const langSlugs = getAllLanguageSlugs();

  return (
    <div className="min-h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        {/* Breadcrumb */}
        <Link
          href="/practice-exams"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          <span aria-hidden>←</span>
          Practice exams
        </Link>

        {/* Exam cards — all languages with details from config */}
        <h1 className="sr-only">
          {name} Practice Exam — {examConfig.examSize} questions, {examConfig.examDurationMinutes} minutes
        </h1>
        <ExamCardsSection
          currentLang={lang}
          langSlugs={langSlugs}
          examSize={examConfig.examSize}
          examDurationMinutes={examConfig.examDurationMinutes}
        />

        {/* Main + Sidebar layout */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          {/* Tabs (main) */}
          <div className="min-w-0">
            <ExamDetailTabs langName={name} content={content} examSize={examConfig.examSize} examDurationMinutes={examConfig.examDurationMinutes} />
          </div>

          {/* Sticky CTA card */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              {canTakeExam ? (
                <>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    You have access. The timer starts when you begin — you&apos;ll
                    have {examConfig.examDurationMinutes} minutes.
                  </p>
                  <div className="mt-4">
                    <StartExamButton lang={lang} langName={name} fullWidth />
                  </div>
                </>
              ) : (
                <>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Take this exam
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Practice exams are included in Pro. Upgrade to take this exam
                    and earn a certificate.
                  </p>
                  <div className="mt-5 flex flex-col gap-3">
                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
                    >
                      Upgrade to Pro
                    </Link>
                    {!user && (
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                      >
                        Sign in
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>

        {/* Other exams */}
        <OtherExamsGrid currentLang={lang} langSlugs={langSlugs} examSize={examConfig.examSize} examDurationMinutes={examConfig.examDurationMinutes} />
      </div>
    </div>
  );
}
