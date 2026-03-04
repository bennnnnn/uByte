import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getCurrentUser } from "@/lib/auth";
import { getUserPlan } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import UpgradeWall from "@/components/UpgradeWall";
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
    description: `Take the ${name} multiple-choice practice exam. 40 questions, 70% to pass.`,
  };
}

export default async function PracticeExamLangPage({ params }: Props) {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) notFound();

  const user = await getCurrentUser();
  const plan = user ? await getUserPlan(user.userId) : "free";
  if (!hasPaidAccess(plan)) {
    return (
      <UpgradeWall
        tutorialTitle="Practice Exams"
        subtitle="Practice exams require a paid plan. Upgrade to take exams and earn certificates."
        backHref="/practice-exams"
        backLabel="← Practice exams"
      />
    );
  }

  const config = LANGUAGES[lang as SupportedLanguage];
  const name = config?.name ?? lang;

  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <Link href="/practice-exams" className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300">
          ← Practice exams
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {name} Practice Exam
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          40 multiple-choice questions. You need 70% or higher to pass and earn a certificate. Questions and answer order are randomized each attempt.
        </p>
        <div className="mt-8">
          <StartExamButton lang={lang} langName={name} />
        </div>
      </div>
    </div>
  );
}
