import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPracticeProblemBySlug, getAllPracticeProblems, getPracticeCategories } from "@/lib/practice/problems";
import { isSupportedLanguage, LANGUAGES, ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import type { ProblemCategory } from "@/lib/practice/types";
import { PracticeIDE } from "./PracticeIDE";
import { getCurrentUser } from "@/lib/auth";
import { getUserPlan } from "@/lib/db";
import { hasPaidAccess, isPracticeProblemFree } from "@/lib/plans";
import UpgradeWall from "@/components/UpgradeWall";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

type Props = {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ category?: string; page?: string; status?: string; difficulty?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const problem = getPracticeProblemBySlug(slug);
  const langName = isSupportedLanguage(lang) ? LANGUAGES[lang as SupportedLanguage]?.name : lang;
  if (!problem) return { title: "Not found" };
  const canonical = absoluteUrl(`/practice/${lang}/${slug}`);
  const title = `${problem.title} (${langName}) | Interview Prep`;
  const description = problem.description.slice(0, 160);
  return {
    title,
    description,
    keywords: [
      ...SITE_KEYWORDS,
      problem.title,
      `${problem.title} ${langName}`,
      `${langName} coding problem`,
      `${langName} interview prep`,
    ],
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: `${title} | uByte`,
      description,
      url: canonical,
    },
    twitter: { card: "summary_large_image" as const, title: `${title} | uByte`, description },
  };
}

export async function generateStaticParams() {
  const problems = getAllPracticeProblems();
  return ALL_LANGUAGE_KEYS.flatMap((lang) =>
    problems.map((p) => ({ lang, slug: p.slug }))
  );
}

export default async function PracticeProblemPage({ params, searchParams }: Props) {
  const { lang, slug } = await params;
  const sp = await searchParams;
  if (!isSupportedLanguage(lang)) notFound();
  const problem = getPracticeProblemBySlug(slug);
  if (!problem) notFound();

  const user = await getCurrentUser();
  const plan = user ? await getUserPlan(user.userId) : "free";
  const canAccess = hasPaidAccess(plan) || isPracticeProblemFree(slug);
  if (!canAccess) {
    const backQuery = new URLSearchParams();
    if (sp.category) backQuery.set("category", sp.category);
    if (sp.page && sp.page !== "1") backQuery.set("page", sp.page);
    if (sp.status) backQuery.set("status", sp.status);
    if (sp.difficulty) backQuery.set("difficulty", sp.difficulty);
    const backQueryStr = backQuery.toString();
    return (
      <UpgradeWall
        tutorialTitle="Interview Prep"
        subtitle="You've used your free problems for this language. Upgrade to unlock all problems and save progress."
        backHref={`/practice/${lang}${backQueryStr ? `?${backQueryStr}` : ""}`}
        backLabel={`← Back to ${LANGUAGES[lang as SupportedLanguage]?.name ?? lang} problems`}
      />
    );
  }

  const categories = getPracticeCategories();
  const categoryFilter =
    sp.category && categories.includes(sp.category as ProblemCategory)
      ? (sp.category as ProblemCategory)
      : null;
  const listPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const listStatus = sp.status === "solved" || sp.status === "unsolved" ? sp.status : undefined;
  const listDifficulty = ["easy", "medium", "hard"].includes(sp.difficulty ?? "") ? sp.difficulty : undefined;

  return (
    <PracticeIDE
      problem={problem}
      initialLang={lang as SupportedLanguage}
      categoryFilter={categoryFilter}
      listPage={listPage}
      listStatus={listStatus}
      listDifficulty={listDifficulty}
    />
  );
}
