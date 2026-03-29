import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPracticeProblemBySlug, getAllPracticeProblems, getPracticeCategories } from "@/lib/practice/problems";
import { isSupportedLanguage, LANGUAGES, PRACTICE_LANGUAGE_KEYS } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import type { ProblemCategory } from "@/lib/practice/types";
import { PracticeIDE } from "./PracticeIDE";
import { getCurrentUser } from "@/lib/auth";
import { absoluteUrl } from "@/lib/seo";
import { APP_NAME, BASE_URL } from "@/lib/constants";
import { tryDecodeShareCode } from "@/lib/share-code";

type Props = {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ category?: string; page?: string; status?: string; difficulty?: string; share?: string; mode?: string; deadline?: string; daily?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const problem = getPracticeProblemBySlug(slug);
  const langName = isSupportedLanguage(lang) ? LANGUAGES[lang as SupportedLanguage]?.name : lang;
  if (!problem || !PRACTICE_LANGUAGE_KEYS.includes(lang as SupportedLanguage)) return { title: "Not found" };
  const canonical = absoluteUrl(`/practice/${lang}/${slug}`);
  const title = `${problem.title} — ${langName} ${problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)} Coding Problem`;
  const description = `Solve "${problem.title}" in ${langName}. ${problem.description.slice(0, 120)} Practice this ${problem.difficulty} ${problem.category} problem with instant test feedback on uByte.`;
  return {
    title,
    description,
    keywords: [
      problem.title,
      `${problem.title} ${langName}`,
      `${problem.title} solution`,
      `${problem.title} ${langName} solution`,
      `${langName} ${problem.category} problem`,
      `${langName} coding problem`,
      `${langName} interview question`,
      `${langName} interview prep`,
      `${langName} ${problem.difficulty} problem`,
      `${problem.category} coding problems`,
      `${problem.category} interview questions`,
      `${langName} coding challenge`,
      APP_NAME,
    ],
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: `${problem.title} (${langName}) | uByte Interview Prep`,
      description,
      url: canonical,
      images: [{ url: absoluteUrl(`/api/og?title=${encodeURIComponent(problem.title)}&description=${encodeURIComponent(`${langName} ${problem.difficulty} ${problem.category} problem`)}`), width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" as const, title: `${problem.title} (${langName}) | uByte`, description },
  };
}

export async function generateStaticParams() {
  const problems = getAllPracticeProblems();
  return PRACTICE_LANGUAGE_KEYS.flatMap((lang) =>
    problems.map((p) => ({ lang, slug: p.slug }))
  );
}

export default async function PracticeProblemPage({ params, searchParams }: Props) {
  const { lang, slug } = await params;
  const sp = await searchParams;
  if (!isSupportedLanguage(lang) || !PRACTICE_LANGUAGE_KEYS.includes(lang as SupportedLanguage)) notFound();
  const problem = getPracticeProblemBySlug(slug);
  if (!problem) notFound();

  const user = await getCurrentUser();
  const { getUserById } = await import("@/lib/db");
  const { hasPaidAccess } = await import("@/lib/plans");
  const dbUser = user ? await getUserById(user.userId) : null;
  const isPro = hasPaidAccess(dbUser?.plan);

  const categories = getPracticeCategories();
  const categoryFilter =
    sp.category && categories.includes(sp.category as ProblemCategory)
      ? (sp.category as ProblemCategory)
      : null;
  const listPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const listStatus = sp.status === "solved" || sp.status === "unsolved" ? sp.status : undefined;
  const listDifficulty = ["easy", "medium", "hard"].includes(sp.difficulty ?? "") ? sp.difficulty : undefined;

  // Decode shared code from ?share= param (set by the Share button on the client)
  const sharedCode = sp.share ? tryDecodeShareCode(sp.share) : undefined;

  const interviewMode = sp.mode === "interview";
  const interviewDeadline = interviewMode && sp.deadline ? parseInt(sp.deadline, 10) : undefined;

  const langName = LANGUAGES[lang as SupportedLanguage]?.name ?? lang;
  const canonicalUrl = absoluteUrl(`/practice/${lang}/${slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `${problem.title} — ${langName} Coding Problem`,
    description: problem.description.slice(0, 300),
    url: canonicalUrl,
    learningResourceType: "Coding exercise",
    educationalLevel: problem.difficulty,
    inLanguage: "en",
    provider: {
      "@type": "Organization",
      name: APP_NAME,
      url: BASE_URL,
    },
  };

  return (
    <>
      <script async
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PracticeIDE
        problem={problem}
        initialLang={lang as SupportedLanguage}
        categoryFilter={categoryFilter}
        listPage={listPage}
        listStatus={listStatus}
        listDifficulty={listDifficulty}
        initialCode={sharedCode}
        interviewMode={interviewMode}
        interviewDeadline={interviewDeadline}
        isPro={isPro}
      />

      {/* Server-rendered content for search engine crawlers */}
      <article className="sr-only">
        <h1>{problem.title} — {langName} Coding Problem</h1>
        <p>Difficulty: {problem.difficulty} | Category: {problem.category}</p>
        <section>
          <h2>Problem Description</h2>
          <p>{problem.description}</p>
        </section>
        {problem.examples.length > 0 && (
          <section>
            <h2>Examples</h2>
            {problem.examples.map((ex, i) => (
              <div key={i}>
                <h3>Example {i + 1}</h3>
                <p>Input: {ex.input}</p>
                <p>Output: {ex.output}</p>
                {ex.explanation && <p>Explanation: {ex.explanation}</p>}
              </div>
            ))}
          </section>
        )}
        <nav>
          <Link href={`/practice/${lang}`}>← Back to {langName} Problems</Link>
          {" · "}
          <Link href="/practice">All Interview Prep Problems</Link>
        </nav>
      </article>
    </>
  );
}
