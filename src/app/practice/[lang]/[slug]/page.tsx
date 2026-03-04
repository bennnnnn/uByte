import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPracticeProblemBySlug, getAllPracticeProblems } from "@/lib/practice/problems";
import { isSupportedLanguage, LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { PracticeIDE } from "./PracticeIDE";
import { getCurrentUser } from "@/lib/auth";
import { getUserPlan } from "@/lib/db";
import { hasPaidAccess, isPracticeProblemFree } from "@/lib/plans";
import UpgradeWall from "@/components/UpgradeWall";

type Props = { params: Promise<{ lang: string; slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const problem = getPracticeProblemBySlug(slug);
  const langName = isSupportedLanguage(lang) ? LANGUAGES[lang as SupportedLanguage]?.name : lang;
  if (!problem) return { title: "Not found" };
  return {
    title: `${problem.title} (${langName}) | Interview Practice`,
    description: problem.description.slice(0, 160),
  };
}

export async function generateStaticParams() {
  const problems = getAllPracticeProblems();
  const langs: SupportedLanguage[] = ["go", "python", "cpp", "javascript", "java", "rust"];
  return langs.flatMap((lang) =>
    problems.map((p) => ({ lang, slug: p.slug }))
  );
}

export default async function PracticeProblemPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isSupportedLanguage(lang)) notFound();
  const problem = getPracticeProblemBySlug(slug);
  if (!problem) notFound();

  const user = await getCurrentUser();
  const plan = user ? await getUserPlan(user.userId) : "free";
  const canAccess = hasPaidAccess(plan) || isPracticeProblemFree(slug);
  if (!canAccess) {
    return (
      <UpgradeWall
        tutorialTitle="Interview Practice"
        subtitle="You've used your free problems for this language. Upgrade to unlock all problems and save progress."
        backHref={`/practice/${lang}`}
        backLabel={`← Back to ${LANGUAGES[lang as SupportedLanguage]?.name ?? lang} practice`}
      />
    );
  }

  return (
    <PracticeIDE
      problem={problem}
      initialLang={lang as SupportedLanguage}
    />
  );
}
