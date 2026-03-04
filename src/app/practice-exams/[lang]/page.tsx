import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getCurrentUser } from "@/lib/auth";
import { getUserPlan } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import { getExamDetailContent, EXAM_SIZE, EXAM_DURATION_MINUTES } from "@/lib/exams/content";
import StartExamButton from "./StartExamButton";
import ExamDetailTabs from "./ExamDetailTabs";
import OtherExamsGrid from "./OtherExamsGrid";

export const dynamic = "force-dynamic";

const VALID_LANGS = new Set(getAllLanguageSlugs());

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const config = LANGUAGES[lang as SupportedLanguage];
  const name = config?.name ?? lang;
  return {
    title: `${name} Practice Exam`,
    description: `Prepare for the ${name} practice exam. ${EXAM_SIZE} questions, ${EXAM_DURATION_MINUTES} minutes, 70% to pass and earn a certificate.`,
  };
}

export default async function PracticeExamLangPage({ params }: Props) {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) notFound();

  const user = await getCurrentUser();
  const plan = user ? await getUserPlan(user.userId) : "free";
  const canTakeExam = hasPaidAccess(plan);

  const config = LANGUAGES[lang as SupportedLanguage];
  const name = config?.name ?? lang;
  const content = getExamDetailContent(lang);
  const langSlugs = getAllLanguageSlugs();

  const statPills = [
    { label: `${EXAM_SIZE} questions`, value: EXAM_SIZE },
    { label: `${EXAM_DURATION_MINUTES} min`, value: EXAM_DURATION_MINUTES },
    { label: "70% to pass", value: "70%" },
    { label: "Certificate", value: "cert" },
  ];

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

        {/* Hero */}
        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-indigo-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
              Pro
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Practice exam
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            {name} Practice Exam
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            {content?.tagline ??
              `Timed multiple-choice exam to validate your ${name} knowledge.`}
          </p>
          {/* Stat pills */}
          <ul className="mt-5 flex flex-wrap gap-3" aria-label="Exam format">
            {statPills.map((p) => (
              <li
                key={p.label}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {typeof p.value === "number" ? (
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {p.value}
                  </span>
                ) : p.value === "cert" ? (
                  <span className="text-base" aria-hidden>
                    🏆
                  </span>
                ) : (
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {p.value}
                  </span>
                )}
                <span>{p.label}</span>
              </li>
            ))}
          </ul>
        </header>

        {/* Main + Sidebar layout */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          {/* Tabs (main) */}
          <div className="min-w-0">
            <ExamDetailTabs langName={name} content={content} />
          </div>

          {/* Sticky CTA card */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              {canTakeExam ? (
                <>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    You have access. The timer starts when you begin — you&apos;ll
                    have {EXAM_DURATION_MINUTES} minutes.
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
        <OtherExamsGrid currentLang={lang} langSlugs={langSlugs} />
      </div>
    </div>
  );
}
