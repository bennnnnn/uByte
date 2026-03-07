import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllPracticeProblems,
  getCategoryForSlug,
  getPracticeCategories,
  sortProblemsByCategoryAndDifficulty,
} from "@/lib/practice/problems";
import { isSupportedLanguage, LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import type { Difficulty, ProblemCategory } from "@/lib/practice/types";
import { getCurrentUser } from "@/lib/auth";
import { getPracticeAttempts } from "@/lib/db";
import type { PracticeAttemptStatus } from "@/lib/db/practice-attempts";
import { PracticeListClient } from "@/components/practice/PracticeListClient";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

const PROBLEMS_PER_PAGE = 35;

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string; category?: string; status?: string; difficulty?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isSupportedLanguage(lang)) return { title: "Not found" };
  const name = LANGUAGES[lang as SupportedLanguage]?.name ?? lang;
  const canonical = absoluteUrl(`/practice/${lang}`);
  return {
    title: `${name} Interview Practice`,
    description: `Solve classic interview coding problems in ${name}. Two Sum, Three Sum, sliding window, dynamic programming and more.`,
    keywords: [
      ...SITE_KEYWORDS,
      `${name} interview questions`,
      `${name} coding interview practice`,
      `${name} algorithm problems`,
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: `${name} Interview Practice | uByte`,
      description: `Practice ${name} interview questions with runnable coding challenges.`,
      url: canonical,
    },
  };
}

export async function generateStaticParams() {
  const langs: SupportedLanguage[] = ["go", "python", "cpp", "javascript", "java", "rust"];
  return langs.map((lang) => ({ lang }));
}

export default async function PracticeLangPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const sp = await searchParams;
  if (!isSupportedLanguage(lang)) notFound();

  const l = lang as SupportedLanguage;
  const allProblems = getAllPracticeProblems();
  const categories = getPracticeCategories();

  const user = await getCurrentUser();
  const attempts: Record<string, PracticeAttemptStatus> = user
    ? await getPracticeAttempts(user.userId)
    : {};
  const solvedCount = Object.values(attempts).filter((s) => s === "solved").length;

  const categoryFilter = sp.category && categories.includes(sp.category as ProblemCategory)
    ? (sp.category as ProblemCategory)
    : null;
  let filtered =
    categoryFilter === null
      ? allProblems
      : allProblems.filter((p) => getCategoryForSlug(p.slug) === categoryFilter);

  const statusFilter = sp.status === "solved" || sp.status === "unsolved" ? sp.status : null;
  if (statusFilter === "solved") {
    filtered = filtered.filter((p) => attempts[p.slug] === "solved");
  } else if (statusFilter === "unsolved") {
    filtered = filtered.filter((p) => attempts[p.slug] !== "solved");
  }

  const difficultyFilter = ["easy", "medium", "hard"].includes(sp.difficulty ?? "")
    ? (sp.difficulty as Difficulty)
    : null;
  if (difficultyFilter) {
    filtered = filtered.filter((p) => p.difficulty === difficultyFilter);
  }

  const categoryOrder = categories;
  const sorted = sortProblemsByCategoryAndDifficulty(filtered, categoryOrder);

  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PROBLEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PROBLEMS_PER_PAGE;
  const pageProblems = sorted.slice(start, start + PROBLEMS_PER_PAGE).map((p) => ({
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
  }));

  return (
    <PracticeListClient
      initialLang={l}
      categories={categories}
      categoryFilter={categoryFilter}
      statusFilter={statusFilter}
      difficultyFilter={difficultyFilter}
      currentPage={currentPage}
      totalPages={totalPages}
      start={start}
      sortedLength={sorted.length}
      pageProblems={pageProblems}
      attempts={attempts}
      hasUser={!!user}
      solvedCount={solvedCount}
      allProblemsLength={allProblems.length}
    />
  );
}
