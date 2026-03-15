import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllPracticeProblems,
  getCategoryForSlug,
  getPracticeCategories,
  sortProblemsByCategoryAndDifficulty,
} from "@/lib/practice/problems";
import { isSupportedLanguage, LANGUAGES, ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import type { Difficulty, ProblemCategory } from "@/lib/practice/types";
import { getCurrentUser } from "@/lib/auth";
import { getPracticeAttempts, getUserById } from "@/lib/db";
import type { PracticeAttemptStatus } from "@/lib/db/practice-attempts";
import { getDripStatus } from "@/lib/db/practice-unlocks";
import { hasPaidAccess } from "@/lib/plans";
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
  const title = `${name} Coding Interview Questions — Practice ${name} Problems`;
  const description = `Ace your ${name} coding interview with practice problems. Arrays, strings, trees, graphs, dynamic programming, sliding window, and more — write and run real ${name} code in your browser with instant test feedback.`;
  return {
    title,
    description,
    keywords: [
      ...SITE_KEYWORDS,
      `${name} interview questions`,
      `${name} coding interview prep`,
      `${name} algorithm problems`,
      `${name} coding problems`,
      `${name} coding challenges`,
      `${name} data structures`,
      `${name} two sum`,
      `${name} dynamic programming`,
      `${name} array problems`,
      `${name} string problems`,
      `${name} tree problems`,
      `${name} interview practice`,
      `${name} coding exercises`,
      `practice ${name} online`,
      `${name} leetcode problems`,
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: `${name} Coding Interview Questions | uByte`,
      description: `${name} interview prep with runnable coding challenges and instant feedback.`,
      url: canonical,
      images: [{ url: absoluteUrl(`/api/og?title=${encodeURIComponent(`${name} Interview Prep`)}&description=${encodeURIComponent(`${name} coding interview problems with instant feedback`)}`), width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" as const, title: `${name} Coding Interview Questions | uByte`, description },
  };
}

export async function generateStaticParams() {
  return ALL_LANGUAGE_KEYS.map((lang) => ({ lang }));
}

export default async function PracticeLangPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const sp = await searchParams;
  if (!isSupportedLanguage(lang)) notFound();

  const l = lang as SupportedLanguage;
  const allProblems = getAllPracticeProblems();
  const categories = getPracticeCategories();

  const user = await getCurrentUser();
  const [attempts, profile] = await Promise.all([
    user ? getPracticeAttempts(user.userId) : ({} as Record<string, PracticeAttemptStatus>),
    user ? getUserById(user.userId) : null,
  ]);
  const solvedCount = Object.values(attempts).filter((s) => s === "solved").length;
  const isPro = hasPaidAccess(profile?.plan);
  const drip = user && !isPro
    ? await getDripStatus(user.userId, profile?.created_at ?? new Date())
    : null;

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

  // Pass all sorted problems so the client can do instant text search without a round-trip.
  const searchableProblems = sorted.map((p) => ({
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
  }));

  const name = LANGUAGES[l]?.name ?? lang;

  return (
    <>
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
        searchableProblems={searchableProblems}
        attempts={attempts}
        hasUser={!!user}
        isPro={isPro}
        solvedCount={solvedCount}
        allProblemsLength={allProblems.length}
        unlockedSlugs={drip?.unlockedSlugs ?? []}
        unlockedCount={drip?.unlockedCount ?? 0}
        allowance={drip?.allowance ?? 0}
        maxFree={drip?.maxFree ?? 10}
      />

      {/* Server-rendered content for search engine crawlers */}
      <article className="sr-only" aria-hidden="true">
        <h1>{name} Interview Prep Problems</h1>
        <p>
          Practice {name} coding interview questions on uByte. {allProblems.length} problems
          across {categories.length} categories — arrays, strings, dynamic programming, trees,
          graphs, and more — with instant test feedback.
        </p>

        <section>
          <h2>Problem Categories</h2>
          <ul>
            {categories.map((cat) => (
              <li key={cat}>
                <Link href={`/practice/${lang}?category=${cat}`}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ")}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Problems</h2>
          <ol>
            {sorted.slice(0, 50).map((p) => (
              <li key={p.slug}>
                <Link href={`/practice/${lang}/${p.slug}`}>
                  {p.title}
                </Link>{" "}
                — {p.difficulty}
              </li>
            ))}
            {sorted.length > 50 && <li>...and {sorted.length - 50} more problems</li>}
          </ol>
        </section>

        <nav>
          <Link href="/practice">← All Languages</Link>
        </nav>
      </article>
    </>
  );
}
