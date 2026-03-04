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

function ExamDetailSections({
  langName,
  content,
}: {
  langName: string;
  content: ReturnType<typeof getExamDetailContent>;
}) {
  const tagline = content?.tagline ?? `Timed multiple-choice exam to validate your ${langName} knowledge.`;
  const objective = content?.objective ?? `This exam tests core ${langName} concepts. Score 70% or higher to pass and earn a certificate.`;
  const topics = content?.topics ?? [
    "Language syntax and types",
    "Standard library and common patterns",
    "Best practices and idioms",
  ];
  const rules = content?.rules ?? [
    `${EXAM_SIZE} multiple-choice questions.`,
    `${EXAM_DURATION_MINUTES} minutes. Timer starts when you begin.`,
    "70% or higher to pass. Questions and answer order are randomized each attempt.",
    "Passing earns a shareable certificate.",
  ];
  const audience = content?.audience;

  return (
    <>
      <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
        {tagline}
      </p>

      <section className="mt-10" aria-labelledby="objective-heading">
        <h2 id="objective-heading" className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Objective
        </h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          {objective}
        </p>
      </section>

      <section className="mt-8" aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Topics covered
        </h2>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-zinc-700 dark:text-zinc-300">
          {topics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="format-heading">
        <h2 id="format-heading" className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Format
        </h2>
        <ul className="mt-3 space-y-1.5 text-zinc-700 dark:text-zinc-300">
          <li><strong>{EXAM_SIZE}</strong> questions</li>
          <li><strong>{EXAM_DURATION_MINUTES}</strong> minutes (timer starts when you begin)</li>
          <li><strong>70%</strong> or higher to pass</li>
          <li>Certificate on passing</li>
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="rules-heading">
        <h2 id="rules-heading" className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Rules
        </h2>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-zinc-700 dark:text-zinc-300">
          {rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      {audience && (
        <section className="mt-8" aria-labelledby="audience-heading">
          <h2 id="audience-heading" className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Who it&apos;s for
          </h2>
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">
            {audience}
          </p>
        </section>
      )}
    </>
  );
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

  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <Link
          href="/practice-exams"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          ← Practice exams
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {name} Practice Exam
        </h1>

        <ExamDetailSections langName={name} content={content} />

        {/* CTA: Start exam or Upgrade */}
        <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-700 dark:bg-zinc-900/50">
          {canTakeExam ? (
            <>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                You have access to this exam. When you start, the timer will begin and you&apos;ll have {EXAM_DURATION_MINUTES} minutes to complete it.
              </p>
              <StartExamButton lang={lang} langName={name} />
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Practice exams are available on Pro.
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Upgrade to take this exam, earn a certificate, and get access to all practice exams.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
                >
                  Upgrade to Pro
                </Link>
                {!user && (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
