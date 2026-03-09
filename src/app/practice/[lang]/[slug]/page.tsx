import { notFound } from "next/navigation";
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

type Props = {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ category?: string; page?: string; status?: string; difficulty?: string; share?: string }>;
};

/** Decode a base64+URI-encoded shared code snippet — returns undefined on any error. */
function tryDecodeShare(encoded: string): string | undefined {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    return undefined;
  }
}

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

  let canAccess = false;
  let dripMessage = "";

  if (!user) {
    canAccess = false;
    dripMessage = "Sign up free to start solving problems — 2 new problems unlock every day.";
  } else {
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
  const sharedCode = sp.share ? tryDecodeShare(sp.share) : undefined;

  return (
    <PracticeIDE
      problem={problem}
      initialLang={lang as SupportedLanguage}
      categoryFilter={categoryFilter}
      listPage={listPage}
      listStatus={listStatus}
      listDifficulty={listDifficulty}
      initialCode={sharedCode}
    />
  );
}
