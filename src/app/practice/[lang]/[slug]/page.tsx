import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPracticeProblemBySlug, getAllPracticeProblems, getPracticeCategories } from "@/lib/practice/problems";
import { isSupportedLanguage, LANGUAGES, ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import type { ProblemCategory } from "@/lib/practice/types";
import { PracticeIDE } from "./PracticeIDE";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import { tryUnlockProblem } from "@/lib/db/practice-unlocks";
import UpgradeWall from "@/components/UpgradeWall";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";
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
  if (!problem) return { title: "Not found" };
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

  // Daily challenge is always free — verify the slug matches today's actual daily problem.
  const isDailyChallenge = sp.daily === "1" && (() => {
    const all = getAllPracticeProblems();
    const epochDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return all.length > 0 && all[epochDay % all.length]?.slug === slug;
  })();

  let canAccess = isDailyChallenge; // daily challenge bypasses the paywall
  let dripMessage = "";

  if (!isDailyChallenge && !user) {
    canAccess = false;
    dripMessage = "Sign up free to start solving problems. The daily challenge is always free — no account needed.";
  } else if (!isDailyChallenge && user) {
    const profile = await getUserById(user.userId);
    if (hasPaidAccess(profile?.plan)) {
      canAccess = true;
    } else if (profile) {
      const result = await tryUnlockProblem(user.userId, slug, profile.created_at);
      canAccess = result.allowed;
      if (!canAccess) {
        const remaining = result.allowance - result.unlockedCount;
        if (remaining <= 0 && result.unlockedCount >= 10) {
          dripMessage = `You've unlocked all ${result.unlockedCount} free problems. Upgrade to Pro for unlimited access.`;
        } else {
          dripMessage = `You've used today's free problems. Come back tomorrow for ${Math.min(2, 10 - result.unlockedCount)} more, or upgrade now for instant access.`;
        }
      }
    }
  }

  if (!canAccess) {
    const backQuery = new URLSearchParams();
    if (sp.category) backQuery.set("category", sp.category);
    if (sp.page && sp.page !== "1") backQuery.set("page", sp.page);
    if (sp.status) backQuery.set("status", sp.status);
    if (sp.difficulty) backQuery.set("difficulty", sp.difficulty);
    const backQueryStr = backQuery.toString();
    // Build a preview of the problem description to show blurred behind the wall
    const previewLines = [
      `// ${problem.title} — ${problem.difficulty.toUpperCase()}`,
      `// Category: ${problem.category}`,
      "",
      ...problem.description.split("\n").slice(0, 6),
      "",
      ...(problem.examples?.[0]
        ? [`Example: ${problem.examples[0].input}`, `Output:  ${problem.examples[0].output}`]
        : []),
    ];
    return (
      <UpgradeWall
        tutorialTitle={problem.title}
        subtitle={dripMessage}
        backHref={`/practice/${lang}${backQueryStr ? `?${backQueryStr}` : ""}`}
        backLabel={`← Back to ${LANGUAGES[lang as SupportedLanguage]?.name ?? lang} problems`}
        previewLines={previewLines}
        context="practice"
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
      <script
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
      />

      {/* Server-rendered content for search engine crawlers */}
      <article className="sr-only" aria-hidden="true">
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
